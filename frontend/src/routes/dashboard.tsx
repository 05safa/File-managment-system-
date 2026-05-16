import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useEffect } from "react";

function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
