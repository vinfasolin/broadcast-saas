import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { PageHeader } from "../../../shared/components/PageHeader";
import { DashboardLayout } from "../../../shared/layouts/DashboardLayout";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useAuth } from "../../auth/hooks/useAuth";
import { subscribeConnections } from "../../connections/services/connections.service";
import type { Connection } from "../../connections/types/connection.types";
import { subscribeContacts } from "../../contacts/services/contacts.service";
import type { Contact } from "../../contacts/types/contact.types";
import { MessageFilters } from "../components/MessageFilters";
import { MessageFormDialog } from "../components/MessageFormDialog";
import { MessageList } from "../components/MessageList";
import {
  createMessage,
  deleteMessage,
  subscribeMessages,
  updateMessage,
} from "../services/messages.service";
import {
  sendEmailNotification,
  sendWhatsappNotification,
} from "../services/messageNotifications.service";
import type { MessageFormData } from "../schemas/message.schema";
import type {
  BroadcastMessage,
  MessageInput,
  MessageStatus,
} from "../types/message.types";

type ImmediateCopyResult = {
  emailSent: boolean;
  whatsappSent: boolean;
  hasFailure: boolean;
};

export const MessagesPage = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<BroadcastMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BroadcastMessage | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    return subscribeConnections(currentUser.uid, setConnections, (error) => {
      console.error(error);
      showSnackbar("Erro ao carregar conexões.", "error");
    });
  }, [currentUser, showSnackbar]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    return subscribeContacts(currentUser.uid, null, setContacts, (error) => {
      console.error(error);
      showSnackbar("Erro ao carregar contatos.", "error");
    });
  }, [currentUser, showSnackbar]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    return subscribeMessages(
      currentUser.uid,
      { status: statusFilter },
      setMessages,
      (error) => {
        console.error(error);
        showSnackbar("Erro ao carregar mensagens.", "error");
      }
    );
  }, [currentUser, statusFilter, showSnackbar]);

  const contactsById = useMemo(() => {
    return new Map(contacts.map((contact) => [contact.id, contact]));
  }, [contacts]);

  const openCreateDialog = () => {
    setSelectedMessage(null);
    setDialogOpen(true);
  };

  const withContactChannels = (data: MessageFormData): MessageInput => {
    const selectedContacts = data.contactIds
      .map((contactId) => contactsById.get(contactId))
      .filter(Boolean) as Contact[];

    return {
      connectionId: data.connectionId,
      contactIds: data.contactIds,
      contactEmails: selectedContacts
        .map((contact) => contact.email)
        .filter(Boolean) as string[],
      contactPhones: selectedContacts
        .map((contact) => contact.phone)
        .filter(Boolean) as string[],
      content: data.content,
      status: data.status,
      scheduledAt: data.scheduledAt ?? "",
      sendEmailCopy: data.sendEmailCopy,
      sendWhatsappCopy: data.sendWhatsappCopy,
    };
  };

  const sendImmediateCopies = async (
    messageId: string,
    payload: MessageInput
  ): Promise<ImmediateCopyResult> => {
    const result: ImmediateCopyResult = {
      emailSent: false,
      whatsappSent: false,
      hasFailure: false,
    };

    if (payload.status !== "sent") {
      return result;
    }

    const operations: Promise<void>[] = [];

    if (
      payload.sendEmailCopy &&
      payload.contactEmails &&
      payload.contactEmails.length > 0
    ) {
      operations.push(
        sendEmailNotification({
          to: payload.contactEmails,
          subject: "Mensagem Broadcast SaaS",
          text: payload.content,
        }).then(() => {
          result.emailSent = true;
        })
      );
    }

    if (
      payload.sendWhatsappCopy &&
      payload.contactPhones &&
      payload.contactPhones.length > 0
    ) {
      operations.push(
        sendWhatsappNotification({
          to: payload.contactPhones,
          text: payload.content,
          externalId: messageId,
        }).then(() => {
          result.whatsappSent = true;
        })
      );
    }

    if (operations.length === 0) {
      return result;
    }

    const settledResults = await Promise.allSettled(operations);

    result.hasFailure = settledResults.some(
      (settledResult) => settledResult.status === "rejected"
    );

    settledResults.forEach((settledResult) => {
      if (settledResult.status === "rejected") {
        console.error(settledResult.reason);
      }
    });

    return result;
  };

  const getSaveFeedbackMessage = (
    action: "criada" | "atualizada",
    result: ImmediateCopyResult
  ) => {
    if (result.hasFailure) {
      return `Mensagem ${action}, mas uma ou mais cópias não foram enviadas agora.`;
    }

    if (result.emailSent && result.whatsappSent) {
      return `Mensagem ${action} e enviada por e-mail e WhatsApp.`;
    }

    if (result.emailSent) {
      return `Mensagem ${action} e enviada por e-mail.`;
    }

    if (result.whatsappSent) {
      return `Mensagem ${action} e enviada pelo WhatsApp.`;
    }

    return `Mensagem ${action}.`;
  };

  const handleSubmit = async (data: MessageFormData) => {
    if (!currentUser) {
      return;
    }

    setLoading(true);

    try {
      const payload = withContactChannels(data);

      if (selectedMessage) {
        await updateMessage(selectedMessage.id, payload);

        const result = await sendImmediateCopies(selectedMessage.id, payload);

        showSnackbar(
          getSaveFeedbackMessage("atualizada", result),
          result.hasFailure ? "warning" : "success"
        );
      } else {
        const messageId = await createMessage(currentUser.uid, payload);

        const result = await sendImmediateCopies(messageId, payload);

        showSnackbar(
          getSaveFeedbackMessage("criada", result),
          result.hasFailure ? "warning" : "success"
        );
      }

      setDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível salvar a mensagem.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setLoading(true);

    try {
      await deleteMessage(deleteTarget.id);
      showSnackbar("Mensagem removida.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível remover a mensagem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Mensagens"
        description="Envie mensagens fake agora, agende para depois e acompanhe em tempo real."
        actionLabel="Nova mensagem"
        onAction={openCreateDialog}
      />

      <MessageFilters status={statusFilter} onStatusChange={setStatusFilter} />

      <MessageList
        messages={messages}
        onCreate={openCreateDialog}
        onEdit={(message) => {
          setSelectedMessage(message);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <MessageFormDialog
        open={dialogOpen}
        loading={loading}
        message={selectedMessage}
        connections={connections}
        contacts={contacts}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        loading={loading}
        title="Remover mensagem"
        description="Tem certeza que deseja remover esta mensagem?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};