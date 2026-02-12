"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza, Flame } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | any;
  image: string | null;
  isFeatured: boolean;
  prepTime: number | null;
  category: {
    name: string;
  };
}

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "center",
        loop: true,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {products.map((product, index) => (
          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full">
            <Link href={`/dashboard/menu?product=${product.id}`}>
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                    <Pizza className="w-20 h-20 text-red-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 mb-2">
                    {product.isFeatured && (
                      <Badge className="bg-red-500">Featured</Badge>
                    )}
                    {index < 3 && (
                      <Badge className="bg-orange-500 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Trending
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {product.name}
                  </h3>
                  <p className="text-white/80 text-sm">{product.category.name}</p>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-white/20 hover:bg-white/40 border-0 backdrop-blur-sm" />
      <CarouselNext className="right-2 bg-white/20 hover:bg-white/40 border-0 backdrop-blur-sm" />
    </Carousel>
  );
}
