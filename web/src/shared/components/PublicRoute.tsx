import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { LoadingScreen } from "./LoadingScreen";

type PublicRouteProps = {
  children: React.ReactNode;
};

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { currentUser, loading, profile } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser && profile?.profileCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  if (currentUser && (!profile || !profile.profileCompleted)) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};