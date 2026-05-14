import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { PageHeader } from "../../../shared/components/PageHeader";
import { DashboardLayout } from "../../../shared/layouts/DashboardLayout";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useAuth } from "../../auth/hooks/useAuth";
import { subscribeConnections } from "../../connections/services/connections.service";
import type { Connection } from "../../connections/types/connection.types";
import { ContactFilters } from "../components/ContactFilters";
import { ContactFormDialog } from "../components/ContactFormDialog";
import { ContactList } from "../components/ContactList";
import {
  createContact,
  deleteContact,
  subscribeContacts,
  updateContact,
} from "../services/contacts.service";
import type { ContactFormData } from "../schemas/contact.schema";
import type { Contact } from "../types/contact.types";

const normalizeText = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const normalizePhone = (value: string) => {
  return value.replace(/\D/g, "");
};

const contactMatchesSearch = (contact: Contact, search: string) => {
  const normalizedSearch = normalizeText(search);
  const phoneSearch = normalizePhone(search);

  if (!normalizedSearch && !phoneSearch) {
    return true;
  }

  const name = normalizeText(contact.name ?? "");
  const email = normalizeText(contact.email ?? "");
  const phone = normalizePhone(contact.phone ?? "");

  return (
    name.includes(normalizedSearch) ||
    email.includes(normalizedSearch) ||
    Boolean(phoneSearch && phone.includes(phoneSearch))
  );
};

export const ContactsPage = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [connectionFilter, setConnectionFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    return subscribeConnections(currentUser.uid, setConnections, (error) => {
      console.error(error);
      showSnackbar("Erro ao carregar conexões.", "error");
    });
  }, [currentUser, showSnackbar]);

  useEffect(() => {
    if (!currentUser) return;

    return subscribeContacts(
      currentUser.uid,
      connectionFilter || null,
      setContacts,
      (error) => {
        console.error(error);
        showSnackbar("Erro ao carregar contatos.", "error");
      }
    );
  }, [currentUser, connectionFilter, showSnackbar]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => contactMatchesSearch(contact, searchTerm));
  }, [contacts, searchTerm]);

  const openCreateDialog = () => {
    setSelectedContact(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: ContactFormData) => {
    if (!currentUser) return;

    setLoading(true);

    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, data);
        showSnackbar("Contato atualizado.", "success");
      } else {
        await createContact(currentUser.uid, data);
        showSnackbar("Contato criado.", "success");
      }

      setDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível salvar o contato.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);

    try {
      await deleteContact(deleteTarget.id);
      showSnackbar("Contato removido.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível remover o contato.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Contatos"
        description="Contatos pertencem a uma conexão e são isolados por cliente."
        actionLabel="Novo contato"
        onAction={openCreateDialog}
      />

      <ContactFilters
        connectionId={connectionFilter}
        searchTerm={searchTerm}
        connections={connections}
        onConnectionChange={setConnectionFilter}
        onSearchChange={setSearchTerm}
      />

      <ContactList
        contacts={filteredContacts}
        connections={connections}
        onCreate={openCreateDialog}
        onEdit={(contact) => {
          setSelectedContact(contact);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <ContactFormDialog
        open={dialogOpen}
        loading={loading}
        contact={selectedContact}
        connections={connections}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        loading={loading}
        title="Remover contato"
        description="Tem certeza que deseja remover este contato?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};