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
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Tag, Loader2, Pencil, Trash2 } from "lucide-react";
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

export default function AdminCouponsPage() {
  const utils = trpc.useUtils();
  const [showCouponDialog, setShowCouponDialog] = useState(false);
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
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateCouponMutation = trpc.coupons.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Coupon updated!");
      utils.coupons.adminGetAll.invalidate();
      handleCloseDialog();
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
    setShowCouponDialog(true);
  };

  const handleDelete = (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }
    deleteCouponMutation.mutate({ id: couponId });
  };

  const handleCloseDialog = () => {
    setShowCouponDialog(false);
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

  const handleOpenCreate = () => {
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
    setShowCouponDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-white">Coupons</h1>
            <p className="text-white/50 mt-1">Manage discount coupons</p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </Button>
        </div>
      </AnimatedSection>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={(open: boolean) => !open && handleCloseDialog()}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-light">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Coupon Code *</Label>
                <Input
                  placeholder="e.g., PIZZA20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: string) => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="PERCENTAGE" className="text-white">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED" className="text-white">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">
                  Discount {formData.discountType === "PERCENTAGE" ? "(%)" : "($)"} *
                </Label>
                <Input
                  type="number"
                  step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                  min="0"
                  placeholder={formData.discountType === "PERCENTAGE" ? "20" : "5"}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Min Order Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Max Uses (leave empty for unlimited)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Expires At</Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Description (optional)</Label>
              <Input
                placeholder="Summer sale discount"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className="text-sm text-white/70">Active</span>
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCouponMutation.isPending || updateCouponMutation.isPending} 
                className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {coupons.length === 0 ? (
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
                  <Tag className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>
              <h2 className="text-xl font-light text-white mb-2">No coupons yet</h2>
              <p className="text-white/50 mb-6">Start creating discount coupons.</p>
              <Button onClick={handleOpenCreate} className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Coupon
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon, index) => (
            <AnimatedSection key={coupon.id} delay={index * 0.05}>
              <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#D4AF37]" />
                      <CardTitle className="text-lg font-light text-white">{coupon.code}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-[#D4AF37]"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-red-400"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-white/40">{coupon.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50 font-light">Discount</span>
                      <span className="font-light text-[#D4AF37]">
                        {coupon.discountType === "PERCENTAGE" 
                          ? `${coupon.discountValue}%` 
                          : `$${coupon.discountValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 font-light">Min Order</span>
                      <span className="font-light text-white">${Number(coupon.minOrderAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 font-light">Uses</span>
                      <span className="font-light text-white">
                        {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : '/ ∞'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 font-light">Expires</span>
                      <span className="font-light text-white">
                        {coupon.expiresAt 
                          ? new Date(coupon.expiresAt).toLocaleDateString() 
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#2a2a2a]">
                      <span className="text-white/50 font-light">Status</span>
                      <span className={`font-light ${coupon.isActive ? 'text-[#D4AF37]' : 'text-red-400'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
