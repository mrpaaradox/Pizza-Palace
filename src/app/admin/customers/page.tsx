"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Mail, Phone, MapPin, Calendar, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminCustomersPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    role: "CUSTOMER",
  });

  const { data: usersData, isLoading } = trpc.admin.getUsers.useQuery();

  const makeAdminMutation = trpc.admin.makeAdmin.useMutation({
    onSuccess: () => {
      toast.success("User promoted to admin!");
      utils.admin.getUsers.invalidate();
    },
    onError: () => {
      toast.error("Failed to promote user");
    },
  });

  const users = (usersData || []) as any[];

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const addressId = useId();
  const cityId = useId();
  const postalId = useId();
  const roleId = useId();

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      role: user.role,
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
    toast.info("User management via API - feature coming soon");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
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
            <Card key={user.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{user.name || "No name"}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-500"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {user.role === "ADMIN" ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full w-fit">
                    Admin
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => makeAdminMutation.mutate({ userId: user.id })}
                  >
                    Make Admin
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
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
    </div>
  );
}
