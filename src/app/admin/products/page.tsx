"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pizza, Loader2 } from "lucide-react";
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

export default function AdminProductsPage() {
  const utils = trpc.useUtils();
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categoryData, setCategoryData] = useState({ name: "", description: "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    isAvailable: true,
    isFeatured: false,
    prepTime: "",
  });

  const { data: productsData, isLoading } = trpc.products.adminGetAll.useQuery();
  const { data: categoriesData } = trpc.categories.getAll.useQuery();
  
  const createProductMutation = trpc.products.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      utils.products.adminGetAll.invalidate();
      handleCloseProductDialog();
    },
    onError: (error) => {
      toast.error("Failed to create product", { description: error.message });
    },
  });

  const updateProductMutation = trpc.products.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      utils.products.adminGetAll.invalidate();
      handleCloseProductDialog();
    },
    onError: (error) => {
      toast.error("Failed to update product", { description: error.message });
    },
  });

  const createCategoryMutation = trpc.categories.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully!");
      utils.categories.getAll.invalidate();
      setCategoryData({ name: "", description: "" });
      setShowCategoryDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to create category", { description: error.message });
    },
  });

  const products = productsData || [];
  const categories = categoriesData || [];

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image: product.image || "",
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      prepTime: product.prepTime ? String(product.prepTime) : "",
    });
    setShowProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setShowProductDialog(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      categoryId: "",
      isAvailable: true,
      isFeatured: false,
      prepTime: "",
    });
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || undefined,
      categoryId: formData.categoryId,
      isAvailable: formData.isAvailable,
      isFeatured: formData.isFeatured,
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : undefined,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate({
      name: categoryData.name,
      description: categoryData.description || undefined,
    });
  };

  const categoryNameId = useId();
  const categoryDescId = useId();

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
            <h1 className="text-2xl md:text-3xl font-light text-white">Products</h1>
            <p className="text-white/50 mt-1">Manage your pizza menu</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(true)}
              className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white"
            >
              <span className="sm:hidden">Category</span>
              <span className="hidden sm:inline">Add Category</span>
            </Button>
            <Button
              onClick={() => setShowProductDialog(true)}
              className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle className="text-white font-light">Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={categoryNameId} className="text-white/70">Category Name *</Label>
              <Input
                id={categoryNameId}
                placeholder="e.g., Pizzas, Drinks, Desserts"
                value={categoryData.name}
                onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={categoryDescId} className="text-white/70">Description</Label>
              <Textarea
                id={categoryDescId}
                placeholder="Category description..."
                value={categoryData.description}
                onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)} className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending} className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={(open: boolean) => !open && handleCloseProductDialog()}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-light">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Product Name *</Label>
                <Input
                  placeholder="e.g., Margherita Pizza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="12.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Description *</Label>
              <Textarea
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value: string) => setFormData({ ...formData, categoryId: value })}
                  required
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Prep Time (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="15"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isAvailable: checked })}
                  className="border-[#2a2a2a] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <Label htmlFor="isAvailable" className="text-sm font-light text-white/70">
                  Available for order
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isFeatured: checked })}
                  className="border-[#2a2a2a] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <Label htmlFor="isFeatured" className="text-sm font-light text-white/70">
                  Featured product
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseProductDialog} className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending || updateProductMutation.isPending} 
                className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
              >
                {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingProduct ? "Update Product" : "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {products.length === 0 ? (
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
                  <Pizza className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>
              <h2 className="text-xl font-light text-white mb-2">No products yet</h2>
              <p className="text-white/50 mb-6">Start adding products to your menu.</p>
              <Button onClick={() => setShowProductDialog(true)} className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.05}>
              <button 
                type="button"
                className="hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 group rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D4AF37]/30 cursor-pointer text-left w-full block"
                onClick={() => handleEdit(product)}
              >
                <div className="relative aspect-square bg-[#2a2a2a]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                      <Pizza className="w-16 h-16 text-[#2a2a2a]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#D4AF37] text-black text-xs font-medium px-2 py-1 rounded-full shadow">
                      FEATURED
                    </span>
                  )}
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-full font-light">Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-[#1a1a1a]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-light text-white text-lg leading-tight">{product.name}</h3>
                  </div>
                  <p className="text-sm text-white/40 line-clamp-2 mb-3 min-h-[2.5rem]">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-light bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                      {product.category?.name || "Uncategorized"}
                    </span>
                    <span className="font-light text-xl text-[#D4AF37]">${Number(product.price).toFixed(2)}</span>
                  </div>
                  {product.prepTime && (
                    <p className="text-xs text-white/40 mt-2 flex items-center">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mr-1.5" />
                      {product.prepTime} min prep time
                    </p>
                  )}
                </div>
              </button>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
