import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const RequireAdmin = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Unauthorized");
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default RequireAdmin;
