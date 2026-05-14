import { Navigate, Route, Routes } from "react-router-dom";
import { PublicRoute } from "./shared/components/PublicRoute";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { CompleteProfilePage } from "./features/auth/pages/CompleteProfilePage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { ConnectionsPage } from "./features/connections/pages/ConnectionsPage";
import { ContactsPage } from "./features/contacts/pages/ContactsPage";
import { MessagesPage } from "./features/messages/pages/MessagesPage";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute requireCompletedProfile={false}>
            <CompleteProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <ConnectionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
