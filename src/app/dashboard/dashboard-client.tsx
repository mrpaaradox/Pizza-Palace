"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { Pizza, Clock, ArrowRight, Star } from "lucide-react";
import ProductCarousel from "./product-carousel";

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay * 0.1, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  isFeatured: boolean;
  prepTime: number | null;
  category: {
    name: string;
  };
}

interface DashboardClientProps {
  session: any;
  products: Product[];
}

export default function DashboardClient({ session, products }: DashboardClientProps) {
  const carouselProducts = products.slice(0, 5);
  const listProducts = products.slice(5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <AnimatedSection>
        <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-6 md:p-8">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D4AF37]/3 rounded-full blur-[80px]" />
          </div>
          
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <Pizza className="w-64 h-64 text-[#D4AF37]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-light mb-4"
              >
                <Star className="w-4 h-4 fill-[#D4AF37]" />
                <span>Welcome back!</span>
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-light mb-2">
                Hey <span className="font-serif italic text-[#D4AF37]">{session?.user?.name?.split(" ")[0] || "there"}!</span>
              </h1>
              <p className="text-white/50 font-light text-lg max-w-md">
                Ready to order some delicious pizza? We've got something special for you today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/menu">
                <Button className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium px-6 h-12">
                  <Pizza className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button variant="outline" className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white px-6 h-12 font-light">
                  View Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <ProductCarousel products={carouselProducts} />

      {listProducts.length > 0 && (
        <div>
          <AnimatedSection delay={1}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-light text-white">More to Explore</h2>
                <p className="text-white/40 text-sm font-light">Discover our full menu</p>
              </div>
              <Link href="/dashboard/menu">
                <Button variant="ghost" className="text-[#D4AF37] hover:text-[#c9a227] hover:bg-[#1a1a1a] font-light">
                  View Full Menu
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <Link href={`/dashboard/menu?product=${product.id}`}>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 group rounded-2xl">
          <div className="h-56 relative w-full overflow-hidden">
            {product.image ? (
              <>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                <Pizza className="w-16 h-16 text-[#2a2a2a]" />
              </div>
            )}
            
            {product.isFeatured && (
              <Badge className="absolute top-4 right-4 bg-[#D4AF37] text-black font-medium px-3 py-1">
                <Star className="w-3 h-3 mr-1 fill-black" />
                Featured
              </Badge>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Button 
                size="sm" 
                className="w-full bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
                onClick={() => {
                  // TODO: Add to cart functionality
                }}
              >
                Order Now
              </Button>
            </motion.div>
          </div>
          
          <CardContent className="p-5">
            <h3 className="font-light text-white text-xl">{product.name}</h3>
            <p className="text-white/40 text-xs mt-1">{product.category.name}</p>
            
            <div className="flex items-center justify-between mt-4">
              {product.prepTime && (
                <div className="flex items-center gap-1 text-white/40 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-light">{product.prepTime} mins</span>
                </div>
              )}
              <span className="text-2xl font-light text-[#D4AF37]">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
