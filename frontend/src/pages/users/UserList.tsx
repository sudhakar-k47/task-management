import { useState, useEffect } from "react";
import * as api from "@/lib/api";
import { Plus, Edit, Trash, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserModal } from "@/components/users/UserModal";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "User Deleted", description: "User deleted successfully.", variant: "destructive" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
        variant: "destructive",
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        const updated = await api.updateUser(editingUser.id, userData);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
        toast({ title: "User Updated", description: "User updated successfully." });
      } else {
        const created = await api.createUser(userData);
        setUsers(prev => [created, ...prev]);
        toast({ title: "User Created", description: "User created successfully." });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save user", variant: "destructive" });
    }
    setEditingUser(undefined);
    setIsCreateModalOpen(false);
  };

  const getInitials = (name?: string, username?: string) => {
    const base = name || username || "?";
    if (!base.trim()) return "?";
    return base.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">
              Manage team members and their permissions
            </p>
          </div>
          <Button
            variant="gradient"
            className="gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {getInitials(user.username)}
                      </span>
                    </div>
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {user.username}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No users yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first team member to get started
            </p>
            <Button
              variant="gradient"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First User
            </Button>
          </div>
        )}

        <UserModal
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            setIsCreateModalOpen(open);
            if (!open) setEditingUser(undefined);
          }}
          user={editingUser}
          onSave={handleSaveUser}
        />
      </div>
    </DashboardLayout>
  );

};