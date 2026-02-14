"use client";

import { useState, useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Tag, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminCouponsPage() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "0",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });

  const { data: couponsData, isLoading } = trpc.coupons.adminGetAll.useQuery();
  
  const createCouponMutation = trpc.coupons.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Coupon created!");
      utils.coupons.adminGetAll.invalidate();
      handleCancel();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateCouponMutation = trpc.coupons.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Coupon updated!");
      utils.coupons.adminGetAll.invalidate();
      handleCancel();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCouponMutation = trpc.coupons.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Coupon deleted!");
      utils.coupons.adminGetAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete coupon");
    },
  });

  const coupons = couponsData || [];

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    const expiresAtDate = coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "";
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
      expiresAt: expiresAtDate,
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }
    deleteCouponMutation.mutate({ id: couponId });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderAmount: "0",
      maxUses: "",
      expiresAt: "",
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      code: formData.code,
      description: formData.description || undefined,
      discountType: formData.discountType as "PERCENTAGE" | "FIXED",
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: parseFloat(formData.minOrderAmount),
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      expiresAt: formData.expiresAt || undefined,
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, ...data });
    } else {
      createCouponMutation.mutate(data);
    }
  };

  const codeId = useId();
  const descId = useId();
  const discountTypeId = useId();
  const discountValueId = useId();
  const minOrderId = useId();
  const maxUsesId = useId();
  const expiresAtId = useId();

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount coupons</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-red-500 hover:bg-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={codeId}>Coupon Code *</Label>
                  <Input
                    id={codeId}
                    placeholder="e.g., PIZZA20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={discountTypeId}>Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger id={discountTypeId}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={discountValueId}>
                    Discount {formData.discountType === "PERCENTAGE" ? "(%)" : "($)"} *
                  </Label>
                  <Input
                    id={discountValueId}
                    type="number"
                    step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                    min="0"
                    placeholder={formData.discountType === "PERCENTAGE" ? "20" : "5"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={minOrderId}>Min Order Amount ($)</Label>
                  <Input
                    id={minOrderId}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={maxUsesId}>Max Uses (leave empty for unlimited)</Label>
                  <Input
                    id={maxUsesId}
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={expiresAtId}>Expires At</Label>
                  <Input
                    id={expiresAtId}
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={descId}>Description (optional)</Label>
                <Input
                  id={descId}
                  placeholder="Summer sale discount"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createCouponMutation.isPending || updateCouponMutation.isPending} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  {(createCouponMutation.isPending || updateCouponMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCoupon ? "Update Coupon" : "Create Coupon"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No coupons yet</h2>
            <p className="text-gray-600 mb-6">Start creating discount coupons.</p>
            <Button onClick={() => setShowForm(true)} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-lg">{coupon.code}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {coupon.description && (
                  <p className="text-sm text-gray-500">{coupon.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-600">
                      {coupon.discountType === "PERCENTAGE" 
                        ? `${coupon.discountValue}%` 
                        : `$${coupon.discountValue}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min Order</span>
                    <span className="font-medium">${Number(coupon.minOrderAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uses</span>
                    <span className="font-medium">
                      {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : '/ ∞'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires</span>
                    <span className="font-medium">
                      {coupon.expiresAt 
                        ? new Date(coupon.expiresAt).toLocaleDateString() 
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${coupon.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
