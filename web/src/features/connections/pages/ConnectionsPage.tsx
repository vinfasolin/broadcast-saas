import { useEffect, useState } from "react";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { PageHeader } from "../../../shared/components/PageHeader";
import { DashboardLayout } from "../../../shared/layouts/DashboardLayout";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useAuth } from "../../auth/hooks/useAuth";
import { ConnectionFormDialog } from "../components/ConnectionFormDialog";
import { ConnectionList } from "../components/ConnectionList";
import {
  createConnection,
  deleteConnection,
  subscribeConnections,
  updateConnection,
} from "../services/connections.service";
import type { Connection } from "../types/connection.types";
import type { ConnectionFormData } from "../schemas/connection.schema";

export const ConnectionsPage = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Connection | null>(null);
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

  const openCreateDialog = () => {
    setSelectedConnection(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: ConnectionFormData) => {
    if (!currentUser) {
      return;
    }

    setLoading(true);

    try {
      if (selectedConnection) {
        await updateConnection(selectedConnection.id, data);
        showSnackbar("Conexão atualizada.", "success");
      } else {
        await createConnection(currentUser.uid, data);
        showSnackbar("Conexão criada.", "success");
      }

      setDialogOpen(false);
      setSelectedConnection(null);
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível salvar a conexão.", "error");
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
      await deleteConnection(deleteTarget.id);
      showSnackbar("Conexão removida.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível remover a conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Conexões"
        description="Cada conexão tem sua própria área de contatos e mensagens."
        actionLabel="Nova conexão"
        onAction={openCreateDialog}
      />

      <ConnectionList
        connections={connections}
        onCreate={openCreateDialog}
        onEdit={(connection) => {
          setSelectedConnection(connection);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <ConnectionFormDialog
        open={dialogOpen}
        loading={loading}
        connection={selectedConnection}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        loading={loading}
        title="Remover conexão"
        description="Tem certeza que deseja remover esta conexão?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};
