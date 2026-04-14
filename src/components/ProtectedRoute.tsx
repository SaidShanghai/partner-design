import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Superadmin can access all protected routes
  if (role !== requiredRole && role !== "superadmin" && role !== null) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
