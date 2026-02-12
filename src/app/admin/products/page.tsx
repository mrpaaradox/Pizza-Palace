"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pizza, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  isFeatured: boolean;
  prepTime: number | null;
  category: Category;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryData, setCategoryData] = useState({ name: "", description: "" });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
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

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleEdit = (product: Product) => {
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
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingProduct ? `/api/admin/products` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const body = editingProduct
        ? { id: editingProduct.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingProduct ? "update" : "create"} product`);
      }

      const savedProduct = await response.json();
      
      if (editingProduct) {
        setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        toast.success("Product updated successfully!");
      } else {
        setProducts([savedProduct, ...products]);
        toast.success("Product created successfully!");
      }
      
      handleCancel();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save product";
      toast.error("Failed to save product", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCategory(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setCategoryData({ name: "", description: "" });
      setShowCategoryForm(false);
      toast.success("Category created successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create category";
      toast.error("Failed to create category", {
        description: errorMessage,
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const nameId = useId();
  const priceId = useId();
  const descId = useId();
  const categoryId = useId();
  const prepTimeId = useId();
  const imageId = useId();
  const isAvailableId = useId();
  const isFeaturedId = useId();
  const categoryNameId = useId();
  const categoryDescId = useId();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your pizza menu</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCategoryForm(true)}
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Add Category
          </Button>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={categoryNameId}>Category Name *</Label>
                <Input
                  id={categoryNameId}
                  placeholder="e.g., Pizzas, Drinks, Desserts"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={categoryDescId}>Description</Label>
                <Textarea
                  id={categoryDescId}
                  placeholder="Category description..."
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreatingCategory} className="bg-red-500 hover:bg-red-600">
                  {isCreatingCategory ? "Creating..." : "Create Category"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Product Name *</Label>
                  <Input
                    id={nameId}
                    placeholder="e.g., Margherita Pizza"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={priceId}>Price ($) *</Label>
                  <Input
                    id={priceId}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="12.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={descId}>Description *</Label>
                <Textarea
                  id={descId}
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={categoryId}>Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    required
                  >
                    <SelectTrigger id={categoryId}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={prepTimeId}>Prep Time (minutes)</Label>
                  <Input
                    id={prepTimeId}
                    type="number"
                    min="1"
                    placeholder="15"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={imageId}>Image URL</Label>
                <Input
                  id={imageId}
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={isAvailableId}
                    checked={formData.isAvailable}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isAvailable: checked })}
                  />
                  <Label htmlFor={isAvailableId} className="text-sm font-normal">
                    Available for order
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={isFeaturedId}
                    checked={formData.isFeatured}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor={isFeaturedId} className="text-sm font-normal">
                    Featured product
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="bg-red-500 hover:bg-red-600">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Create Product"
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

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Pizza className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h2>
            <p className="text-gray-600 mb-6">Start adding products to your menu.</p>
            <Button onClick={() => setShowForm(true)} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <button 
              type="button"
              key={product.id} 
              className="hover:shadow-xl transition-all duration-300 group rounded-2xl overflow-hidden bg-white cursor-pointer text-left w-full"
              onClick={() => handleEdit(product)}
            >
              <div className="relative aspect-square bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Pizza className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {product.isFeatured && (
                  <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                    FEATURED
                  </span>
                )}
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">Unavailable</span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[2.5rem]">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {product.category?.name || "Uncategorized"}
                  </span>
                  <span className="font-bold text-xl text-gray-900">${Number(product.price).toFixed(2)}</span>
                </div>
                {product.prepTime && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
                    {product.prepTime} min prep time
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
