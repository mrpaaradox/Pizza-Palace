"use client";

import { useEffect, memo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza, Clock, Star } from "lucide-react";
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

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
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
          element.classList.add("ring-2", "ring-[#D4AF37]");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-[#D4AF37]");
          }, 3000);
        }, 100);
      }
    }
  }, [productId]);

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-white">Our Menu</h1>
          <p className="text-white/50 mt-1 font-light">
            Browse our delicious selection of pizzas and sides
          </p>
        </div>
      </AnimatedSection>

      <div className="space-y-12">
        {categories.map((category, catIndex) => (
          <AnimatedSection key={category.id} delay={catIndex * 0.1}>
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="relative">
                  <h2 className="text-xl md:text-2xl font-light text-white">{category.name}</h2>
                  <div className="absolute -bottom-2 left-0 w-16 h-1 bg-[#D4AF37]" />
                </div>
                {category.description && (
                  <span className="text-white/40 font-light md:ml-4">— {category.description}</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map((product, prodIndex) => (
                  <AnimatedSection key={product.id} delay={prodIndex * 0.05}>
                    <MemoizedProductCard 
                      id={`product-${product.id}`} 
                      product={product} 
                      index={prodIndex}
                    />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {categories.length === 0 && (
        <AnimatedSection>
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-32 h-32"
              />
              <div className="relative w-28 h-28 mx-auto rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <Pizza className="w-12 h-12 text-[#D4AF37]" />
              </div>
            </div>
            <h3 className="text-2xl font-light text-white mb-2">No items available</h3>
            <p className="text-white/40 font-light">Check back soon for our delicious pizzas!</p>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}

function ProductCard({ product, id, index = 0 }: { product: Product; id?: string; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <Card id={id} className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 group h-full flex flex-col rounded-2xl">
        <div className="h-48 relative w-full overflow-hidden">
          {product.image ? (
            <>
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
              <Pizza className="w-16 h-16 text-[#2a2a2a]" />
            </div>
          )}
          
          {product.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-black font-medium px-3 py-1">
              <Star className="w-3 h-3 mr-1 fill-black" />
              Featured
            </Badge>
          )}
          
          <div className="absolute bottom-3 right-3">
            <span className="text-2xl font-light text-white drop-shadow-lg">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-light text-white text-lg">{product.name}</h3>
          </div>
          
          <p className="text-white/40 text-sm mb-3 line-clamp-2 font-light">
            {product.description}
          </p>
          
          {product.prepTime && (
            <div className="flex items-center gap-1 text-white/40 text-xs mb-4">
              <Clock className="w-3 h-3" />
              <span className="font-light">{product.prepTime} mins prep time</span>
            </div>
          )}
          
          <div className="mt-auto pt-2 border-t border-[#2a2a2a]">
            <AddToCartButton productId={product.id} productName={product.name} basePrice={Number(product.price)} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const MemoizedProductCard = memo(ProductCard);
