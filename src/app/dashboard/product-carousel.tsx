"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Pizza, Flame, Star, ArrowRight } from "lucide-react";
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
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="100vw"
                    priority={index === 0}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                    <Pizza className="w-20 h-20 text-[#2a2a2a]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-[#D4AF37] text-black font-medium">
                      <Star className="w-3 h-3 mr-1 fill-black" />
                      Featured
                    </Badge>
                  )}
                  {index < 3 && (
                    <Badge className="bg-[#1a1a1a]/80 backdrop-blur-sm text-white border border-[#2a2a2a] flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#D4AF37]" />
                      Trending
                    </Badge>
                  )}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-[#D4AF37] text-sm font-light mb-1">{product.category.name}</p>
                    <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-light text-[#D4AF37]">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <span className="font-light">Order Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-[#1a1a1a]/80 hover:bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:text-[#D4AF37] backdrop-blur-sm" />
      <CarouselNext className="right-2 bg-[#1a1a1a]/80 hover:bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:text-[#D4AF37] backdrop-blur-sm" />
    </Carousel>
  );
}
