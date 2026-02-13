"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza, Clock } from "lucide-react";
import AddToCartButton from "./add-to-cart-button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: any;
  image: string | null;
  isFeatured: boolean;
  prepTime: number | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  products: Product[];
}

interface MenuClientProps {
  categories: Category[];
}

export default function MenuClient({ categories }: MenuClientProps) {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  useEffect(() => {
    if (productId) {
      const element = document.getElementById(`product-${productId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-red-500");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-red-500");
          }, 3000);
        }, 100);
      }
    }
  }, [productId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
        <p className="text-gray-600 mt-1">
          Browse our delicious selection of pizzas and sides
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {category.name}
              {category.description && (
                <span className="text-sm font-normal text-gray-500">
                  - {category.description}
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.products.map((product) => (
                <div key={product.id} id={`product-${product.id}`} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col rounded-xl border-0 shadow-md py-0 gap-0">
      <div className="h-36 bg-gray-200 relative w-full rounded-t-xl overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Pizza className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {product.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Featured
          </Badge>
        )}
      </div>
      
      <CardContent className="p-3 flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">{product.name}</h3>
          <span className="text-sm font-bold text-red-500 whitespace-nowrap ml-2">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-1">
          {product.prepTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {product.prepTime} mins
            </div>
          )}
          <AddToCartButton productId={product.id} productName={product.name} />
        </div>
      </CardContent>
    </Card>
  );
}
