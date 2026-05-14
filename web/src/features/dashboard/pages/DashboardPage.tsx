import { Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageHeader } from "../../../shared/components/PageHeader";
import { DashboardLayout } from "../../../shared/layouts/DashboardLayout";

const cards = [
  {
    title: "Conexões",
    description: "Cadastre e gerencie as conexões do cliente.",
    to: "/connections",
  },
  {
    title: "Contatos",
    description: "Organize contatos por conexão, com dados em tempo real.",
    to: "/contacts",
  },
  {
    title: "Mensagens",
    description: "Crie, agende, filtre e acompanhe mensagens enviadas.",
    to: "/messages",
  },
];

export const DashboardPage = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu ambiente SaaS de broadcast."
      />

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 4 }}>
            <Paper
              component={Link}
              to={card.to}
              className="block h-full rounded-3xl p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              sx={{ textDecoration: "none" }}
            >
              <Typography variant="h6" className="font-bold text-slate-900">
                {card.title}
              </Typography>
              <Typography className="mt-2 text-slate-500">{card.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </DashboardLayout>
  );
};