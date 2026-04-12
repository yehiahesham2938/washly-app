import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

export function AdminUsers() {
  const { allUsers, deleteUserById, updateUserRoleById, user: currentUser } =
    useAuth();
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  async function deleteUser(id: string) {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account here.");
      return;
    }
    try {
      await deleteUserById(id);
      toast.success("User removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove user");
    }
  }

  async function onRoleChange(uId: string, next: UserRole, prev: UserRole) {
    if (next === prev) return;
    setRoleUpdatingId(uId);
    try {
      await updateUserRoleById(uId, next);
      toast.success(next === "admin" ? "User promoted to admin" : "Role updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update role");
    } finally {
      setRoleUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Registered accounts and roles. Only non-admin accounts can be removed;
          admins cannot be demoted to users.
        </p>
      </div>

      {allUsers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-muted-foreground">
          No users yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((u) => {
                const canDelete =
                  u.id !== currentUser?.id && u.role !== "admin";
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge variant="default">admin</Badge>
                      ) : (
                        <Select
                          value={u.role}
                          disabled={roleUpdatingId === u.id}
                          onValueChange={(value) =>
                            onRoleChange(u.id, value as UserRole, u.role)
                          }
                        >
                          <SelectTrigger
                            className="h-9 w-[140px]"
                            aria-label={`Role for ${u.email}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!canDelete}
                            aria-label="Delete user"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {u.email} from the platform. This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser(u.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
