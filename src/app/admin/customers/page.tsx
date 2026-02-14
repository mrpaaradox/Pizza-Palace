"use client";

import { useState, useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Users, Mail, Phone, MapPin, Calendar, Loader2, Pencil, Trash2, AlertTriangle, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminCustomersPage() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    role: "CUSTOMER" as "ADMIN" | "CUSTOMER",
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    role: "CUSTOMER" as "ADMIN" | "CUSTOMER",
    emailVerified: false,
  });

  const { data: usersData, isLoading, error: usersError } = trpc.admin.getUsers.useQuery();

  const makeAdminMutation = trpc.admin.makeAdmin.useMutation({
    onSuccess: () => {
      toast.success("User promoted to admin!");
      utils.admin.getUsers.invalidate();
    },
    onError: (err: any) => {
      toast.error("Failed to promote user", { description: err.message });
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully!");
      utils.admin.getUsers.invalidate();
    },
    onError: (err: any) => {
      toast.error("Failed to delete user", { description: err.message });
    },
  });

  const cancelDeletionMutation = trpc.admin.cancelDeletionRequest.useMutation({
    onSuccess: () => {
      toast.success("Deletion request cancelled!");
      utils.admin.getUsers.invalidate();
    },
    onError: (err: any) => {
      toast.error("Failed to cancel deletion request", { description: err.message });
    },
  });

  const restoreUserMutation = trpc.admin.restoreUser.useMutation({
    onSuccess: () => {
      toast.success("User restored successfully!");
      utils.admin.getUsers.invalidate();
    },
    onError: (err: any) => {
      toast.error("Failed to restore user", { description: err.message });
    },
  });

  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("User created successfully!");
      utils.admin.getUsers.invalidate();
      setShowCreateForm(false);
      setCreateFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        role: "CUSTOMER",
        emailVerified: false,
      });
    },
    onError: (err: any) => {
      toast.error("Failed to create user", { description: err.message });
    },
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully!");
      utils.admin.getUsers.invalidate();
      handleCancel();
    },
    onError: (err: any) => {
      toast.error("Failed to update user", { description: err.message });
    },
  });

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const addressId = useId();
  const cityId = useId();
  const postalId = useId();
  const roleId = useId();
  const createNameId = useId();
  const createEmailId = useId();
  const createPasswordId = useId();
  const createPhoneId = useId();
  const createAddressId = useId();
  const createCityId = useId();
  const createPostalId = useId();
  const createRoleId = useId();

  const users = (usersData || []) as any[];

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.originalEmail || user.email,
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      role: "CUSTOMER",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({
      userId: editingUser.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      postalCode: formData.postalCode || undefined,
      role: formData.role,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading users: {usersError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage registered customers</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No users yet</h2>
            <p className="text-gray-600 mb-6">Start by adding a user.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className={`relative ${user.deletedAt ? "border-red-300 bg-red-50" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{user.name || "No name"}</CardTitle>
                  <div className="flex gap-1">
                    {user.deletedAt ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-500 hover:text-green-600"
                        title="Restore User"
                        onClick={() => {
                          if (confirm("Restore this user's account?")) {
                            restoreUserMutation.mutate({ userId: user.id });
                          }
                        }}
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    ) : user.deletionRequestedAt ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600"
                          title="Cancel Deletion"
                          onClick={() => {
                            if (confirm("Cancel this deletion request?")) {
                              cancelDeletionMutation.mutate({ userId: user.id });
                            }
                          }}
                        >
                          <Undo2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          title="Approve Deletion"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this user?")) {
                              deleteUserMutation.mutate({ userId: user.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-500"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {user.deletedAt ? (
                  <div className="space-y-2">
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      Deleted
                    </span>
                    <p className="text-xs text-gray-500">
                      Deleted: {new Date(user.deletedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : user.deletionRequestedAt ? (
                  <div className="space-y-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Deletion Requested
                    </span>
                  </div>
                ) : user.role === "ADMIN" ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full w-fit">
                    Admin
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => makeAdminMutation.mutate({ userId: user.id })}
                    >
                      Make Admin
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-600"
                      title="Delete User"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this user?")) {
                          deleteUserMutation.mutate({ userId: user.id });
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.originalEmail || user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {user.address}, {user.city} {user.postalCode}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Orders: {user._count?.orders || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>Name</Label>
              <Input
                id={nameId}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={phoneId}>Phone</Label>
              <Input
                id={phoneId}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={addressId}>Address</Label>
              <Input
                id={addressId}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={cityId}>City</Label>
                <Input
                  id={cityId}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={postalId}>Postal Code</Label>
                <Input
                  id={postalId}
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={roleId}>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) => setFormData({ ...formData, role: value as "ADMIN" | "CUSTOMER" })}
              >
                <SelectTrigger id={roleId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateForm} onOpenChange={(open: boolean) => !open && setShowCreateForm(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createUserMutation.mutate({
              name: createFormData.name,
              email: createFormData.email,
              password: createFormData.password,
              phone: createFormData.phone || undefined,
              address: createFormData.address || undefined,
              city: createFormData.city || undefined,
              postalCode: createFormData.postalCode || undefined,
              role: createFormData.role,
              emailVerified: createFormData.emailVerified,
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={createNameId}>Name *</Label>
              <Input
                id={createNameId}
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createEmailId}>Email *</Label>
              <Input
                id={createEmailId}
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createPasswordId}>Password *</Label>
              <Input
                id={createPasswordId}
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createPhoneId}>Phone</Label>
              <Input
                id={createPhoneId}
                type="tel"
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createAddressId}>Address</Label>
              <Input
                id={createAddressId}
                value={createFormData.address}
                onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={createCityId}>City</Label>
                <Input
                  id={createCityId}
                  value={createFormData.city}
                  onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={createPostalId}>Postal Code</Label>
                <Input
                  id={createPostalId}
                  value={createFormData.postalCode}
                  onChange={(e) => setCreateFormData({ ...createFormData, postalCode: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={createRoleId}>Role</Label>
              <Select
                value={createFormData.role}
                onValueChange={(value: string) => setCreateFormData({ ...createFormData, role: value as "ADMIN" | "CUSTOMER" })}
              >
                <SelectTrigger id={createRoleId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="emailVerified"
                checked={createFormData.emailVerified}
                onCheckedChange={(checked: boolean) => setCreateFormData({ ...createFormData, emailVerified: checked })}
              />
              <Label htmlFor="emailVerified" className="text-sm font-normal">
                Mark email as verified (for testing)
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
