import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { DocumentsProvider } from "@/lib/documents-context";
import { UsersProvider } from "@/lib/users-context";
import { DepartmentsProvider } from "@/lib/departments-context";
import { CategoriesProvider } from "@/lib/categories-context";
import RootLayout from "@/routes/__root";
import LoginPage from "@/routes/index";
import DashboardLayout from "@/routes/dashboard";
import DashboardHome from "@/routes/dashboard/index";
import DocumentsLayout from "@/routes/dashboard/documents";
import DocumentsPage from "@/routes/dashboard/documents/index";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UsersProvider>
          <DepartmentsProvider>
            <CategoriesProvider>
              <DocumentsProvider>
                <Routes>
                  <Route element={<RootLayout />}>
                    <Route index element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="documents" element={<DocumentsLayout />}>
                        <Route index element={<DocumentsPage />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </DocumentsProvider>
            </CategoriesProvider>
          </DepartmentsProvider>
        </UsersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
