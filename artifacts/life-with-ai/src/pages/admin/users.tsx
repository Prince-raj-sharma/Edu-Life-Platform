import { useState } from "react";
import { useListUsers, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params = { page, limit: 20, ...(search && { search }) };
  const { data, isLoading } = useListUsers(params, { query: { queryKey: getListUsersQueryKey(params) } });
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey(params) });

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await updateUser.mutateAsync({ id: userId, data: { role: newRole } });
      toast({ title: "Role updated!" });
      invalidate();
    } catch {
      toast({ title: "Error updating role", variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser.mutateAsync({ id: userId });
      toast({ title: "User deleted" });
      invalidate();
    } catch {
      toast({ title: "Error deleting user", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} total users</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input data-testid="input-search" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 text-sm" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : !data?.users?.length ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button data-testid={`button-toggle-role-${user.id}`} onClick={() => handleToggleRole(user.id, user.role)} className="capitalize">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={user.isVerified ? "default" : "outline"} className={user.isVerified ? "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300" : ""}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button data-testid={`button-delete-${user.id}`} onClick={() => handleDelete(user.id, user.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.pages && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Previous</button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
