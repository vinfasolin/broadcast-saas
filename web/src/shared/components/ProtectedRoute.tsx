import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { LoadingScreen } from "./LoadingScreen";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireCompletedProfile?: boolean;
};

export const ProtectedRoute = ({
  children,
  requireCompletedProfile = true,
}: ProtectedRouteProps) => {
  const { currentUser, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireCompletedProfile && (!profile || !profile.profileCompleted)) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};