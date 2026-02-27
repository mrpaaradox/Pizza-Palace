"use client";

import { useState, useId } from "react";
import { motion } from "motion/react";
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

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading users: {usersError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">Customers</h1>
            <p className="text-white/50 mt-1">Manage registered customers</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </AnimatedSection>

      {users.length === 0 ? (
        <AnimatedSection>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-24 h-24"
                />
                <div className="relative w-20 h-20 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <Users className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>
              <h2 className="text-xl font-light text-white mb-2">No users yet</h2>
              <p className="text-white/50 mb-6">Start by adding a user.</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, index) => (
            <AnimatedSection key={user.id} delay={index * 0.05}>
              <Card className={`bg-[#1a1a1a] border-[#2a2a2a] ${user.deletedAt ? "border-red-900/30" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-light text-white">{user.name || "No name"}</CardTitle>
                    <div className="flex gap-1">
                      {user.deletedAt ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-green-400"
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
                            className="h-8 w-8 text-white/40 hover:text-blue-400"
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
                            className="h-8 w-8 text-white/40 hover:text-red-400"
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
                          className="h-8 w-8 text-white/40 hover:text-[#D4AF37]"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {user.deletedAt ? (
                    <div className="space-y-2">
                      <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Deleted
                      </span>
                      <p className="text-xs text-white/40">
                        Deleted: {new Date(user.deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : user.deletionRequestedAt ? (
                    <div className="space-y-2">
                      <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Deletion Requested
                      </span>
                    </div>
                  ) : user.role === "ADMIN" ? (
                    <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full w-fit">
                      Admin
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
                        onClick={() => makeAdminMutation.mutate({ userId: user.id })}
                      >
                        Make Admin
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/40 hover:text-red-400"
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
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                    <span className="truncate font-light">{user.originalEmail || user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-light">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-light">
                        {user.address}, {user.city} {user.postalCode}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-white/40 pt-2 border-t border-[#2a2a2a]">
                    <Calendar className="w-4 h-4" />
                    <span className="font-light">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-white/40 font-light">
                    Orders: {user._count?.orders || 0}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open: boolean) => !open && handleCancel()}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle className="text-white font-light">Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={nameId} className="text-white/70">Name</Label>
              <Input
                id={nameId}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={emailId} className="text-white/70">Email</Label>
              <Input
                id={emailId}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={phoneId} className="text-white/70">Phone</Label>
              <Input
                id={phoneId}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={addressId} className="text-white/70">Address</Label>
              <Input
                id={addressId}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={cityId} className="text-white/70">City</Label>
                <Input
                  id={cityId}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={postalId} className="text-white/70">Postal Code</Label>
                <Input
                  id={postalId}
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={roleId} className="text-white/70">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) => setFormData({ ...formData, role: value as "ADMIN" | "CUSTOMER" })}
              >
                <SelectTrigger id={roleId} className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="CUSTOMER" className="text-white">Customer</SelectItem>
                  <SelectItem value="ADMIN" className="text-white">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending} className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
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
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-light">Create New User</DialogTitle>
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
              <Label htmlFor={createNameId} className="text-white/70">Name *</Label>
              <Input
                id={createNameId}
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createEmailId} className="text-white/70">Email *</Label>
              <Input
                id={createEmailId}
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createPasswordId} className="text-white/70">Password *</Label>
              <Input
                id={createPasswordId}
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createPhoneId} className="text-white/70">Phone</Label>
              <Input
                id={createPhoneId}
                type="tel"
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={createAddressId} className="text-white/70">Address</Label>
              <Input
                id={createAddressId}
                value={createFormData.address}
                onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={createCityId} className="text-white/70">City</Label>
                <Input
                  id={createCityId}
                  value={createFormData.city}
                  onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={createPostalId} className="text-white/70">Postal Code</Label>
                <Input
                  id={createPostalId}
                  value={createFormData.postalCode}
                  onChange={(e) => setCreateFormData({ ...createFormData, postalCode: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={createRoleId} className="text-white/70">Role</Label>
              <Select
                value={createFormData.role}
                onValueChange={(value: string) => setCreateFormData({ ...createFormData, role: value as "ADMIN" | "CUSTOMER" })}
              >
                <SelectTrigger id={createRoleId} className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="CUSTOMER" className="text-white">Customer</SelectItem>
                  <SelectItem value="ADMIN" className="text-white">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="emailVerified"
                checked={createFormData.emailVerified}
                onCheckedChange={(checked: boolean) => setCreateFormData({ ...createFormData, emailVerified: checked })}
                className="border-[#2a2a2a] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
              />
              <Label htmlFor="emailVerified" className="text-sm font-light text-white/70">
                Mark email as verified (for testing)
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending} className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
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
