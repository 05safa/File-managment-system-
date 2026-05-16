import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useDocuments } from "@/lib/documents-context";
import { useUsers } from "@/lib/users-context";
import { useDepartments } from "@/lib/departments-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddUserForm } from "@/components/AddUserForm";
import { AddDepartmentForm } from "@/components/AddDepartmentForm";
import { AddCategoryForm } from "@/components/AddCategoryForm";
import { AssignUsersToDept } from "@/components/AssignUsersToDept";
import { AssignDepartmentsToUser } from "@/components/AssignDepartmentsToUser";
import { useCategories } from "@/lib/categories-context";
import { usePagination } from "@/hooks/usePagination";
import { PaginationController } from "@/components/PaginationController";

const USERS_PER_PAGE = 5;
const DEPARTMENTS_PER_PAGE = 6;

function DashboardHome() {
  const { user, isAdmin } = useAuth();
  const { documents } = useDocuments();
  const { users, addUser, assignUserDepartments } = useUsers();
  const { departments, addDepartment, deleteDepartment } = useDepartments();
  const { categories, addCategory } = useCategories();
  const [usersPage, setUsersPage] = useState(1);
  const [departmentsPage, setDepartmentsPage] = useState(1);

  const usersPagination = usePagination(users.length, USERS_PER_PAGE, usersPage);
  const departmentsPagination = usePagination(departments.length, DEPARTMENTS_PER_PAGE, departmentsPage);

  const paginatedUsers = users.slice(usersPagination.startIndex, usersPagination.endIndex);
  const paginatedDepartments = departments.slice(departmentsPagination.startIndex, departmentsPagination.endIndex);

  const stats = [
    { label: "Total Documents", value: documents.length, color: "bg-primary/10 text-primary" },
    { label: "In Draft", value: documents.filter((d) => d.status === "draft").length, color: "bg-muted text-muted-foreground" },
    { label: "Under Review", value: documents.filter((d) => d.status === "review").length, color: "bg-accent text-accent-foreground" },
    { label: "Approved", value: documents.filter((d) => d.status === "approved").length, color: "bg-primary/10 text-primary" },
  ];

  const adminStats = [
    { label: "Total Files", value: documents.reduce((sum, d) => sum + d.files.length, 0) },
    { label: "Total Comments", value: documents.reduce((sum, d) => sum + d.comments.length, 0) },
    { label: "Archived", value: documents.filter((d) => d.status === "archived").length },
    { label: "Avg Files/Doc", value: documents.length ? (documents.reduce((sum, d) => sum + d.files.length, 0) / documents.length).toFixed(1) : "0" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.username}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Admin Dashboard — Full system overview" : "Here's an overview of your documents."}
          </p>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
          {isAdmin ? "Admin" : "User"}
        </Badge>
      </div>

      {/* Core stats — visible to all */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin-only: Extended statistics */}
      {isAdmin && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-foreground">System Statistics</h2>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adminStats.map((stat) => (
              <Card key={stat.label} className="border-primary/20">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin-only: User Management */}
          <h2 className="mb-4 text-lg font-semibold text-foreground">User Management</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            After assigning departments, users must sign out and sign in again so their JWT includes the new departments.
          </p>
          <AddUserForm onAddUser={addUser} />
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Departments</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {u.departmentIds.length
                            ? u.departmentIds
                                .map((id) => departments.find((d) => d.id === id)?.name ?? id.slice(0, 8))
                                .join(", ")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <AssignDepartmentsToUser user={u} onAssign={assignUserDepartments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {usersPagination.totalPages > 1 && (
            <div className="mb-8">
              <PaginationController
                currentPage={usersPagination.currentPage}
                totalPages={usersPagination.totalPages}
                pages={usersPagination.pages}
                onPageChange={setUsersPage}
              />
            </div>
          )}

          <h2 className="mb-4 text-lg font-semibold text-foreground">Categories</h2>
          <AddCategoryForm onAddCategory={addCategory} />
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="outline">
                {c.name}
              </Badge>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet (General, Administrative, Training).</p>
            )}
          </div>

          {/* Admin-only: Department Management */}
          <h2 className="mb-4 text-lg font-semibold text-foreground">Department Management</h2>
          <AddDepartmentForm
            onAddDepartment={(dept) => addDepartment(dept.name, dept.description)}
          />
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDepartments.map((dept) => (
              <Card key={dept.id} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-foreground">{dept.userCount}</span>
                      <span className="text-muted-foreground"> members</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AssignUsersToDept
                      department={dept}
                      onAssign={async (d, userIds) => {
                        for (const u of users) {
                          const inDept = userIds.includes(u.id);
                          const hasDept = u.departmentIds.includes(d.id);
                          let next = [...u.departmentIds];
                          if (inDept && !hasDept) next = [...next, d.id];
                          if (!inDept && hasDept) next = next.filter((id) => id !== d.id);
                          if (next.length !== u.departmentIds.length || next.some((id, i) => id !== u.departmentIds[i])) {
                            await assignUserDepartments(u.id, next);
                          }
                        }
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDepartment(dept.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {departmentsPagination.totalPages > 1 && (
            <div className="mb-8">
              <PaginationController
                currentPage={departmentsPagination.currentPage}
                totalPages={departmentsPagination.totalPages}
                pages={departmentsPagination.pages}
                onPageChange={setDepartmentsPage}
              />
            </div>
          )}

          {/* Admin-only: Recent Activity */}
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
          <Card className="mb-8">
            <CardContent className="p-4 space-y-3">
              {[
                { action: "Document approved", detail: "Project Requirements", time: "2 hours ago" },
                { action: "New user registered", detail: "dave@company.com", time: "5 hours ago" },
                { action: "File uploaded", detail: "requirements.pdf", time: "1 day ago" },
                { action: "Document created", detail: "Design Mockups", time: "2 days ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick actions — visible to all */}
      <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/dashboard/documents" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle className="mt-2 text-base">View All Documents</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Browse, search and manage all your documents.</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/documents" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <CardTitle className="mt-2 text-base">Add Document</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Create a new document with metadata and files.</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/documents" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <CardTitle className="mt-2 text-base">Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Upload and attach files to your documents.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default DashboardHome;
