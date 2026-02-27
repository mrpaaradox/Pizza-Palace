"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pizza, Clock, Star, ArrowRight } from "lucide-react";

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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay * 0.1, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-[#D4AF37] origin-left z-[60]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

export default function MenuClient({ categories }: MenuClientProps) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <ScrollProgress />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0f0f0f]/80 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Pizza className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl md:text-2xl font-light tracking-wide">
                <span className="font-serif italic text-[#D4AF37]">Pizza Palace</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1a1a1a] text-base font-light">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium text-base">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white/50 mb-6">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span>Premium Selection</span>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={1}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight">
              Our <span className="font-serif italic text-[#D4AF37]">Menu</span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={2}>
            <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
              Browse our selection of handcrafted pizzas made with the finest ingredients, 
              sourced from local farms and prepared with love.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories & Products */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category, catIndex) => (
            <div key={category.id} className="mb-20">
              <AnimatedSection delay={catIndex * 0.5}>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
                  <div className="relative">
                    <h2 className="text-3xl md:text-4xl font-light text-white">{category.name}</h2>
                    <div className="absolute -bottom-2 left-0 w-20 h-1 bg-[#D4AF37]" />
                  </div>
                  {category.description && (
                    <span className="text-white/40 font-light md:ml-4">— {category.description}</span>
                  )}
                </div>
              </AnimatedSection>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.products.map((product, prodIndex) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={prodIndex}
                    categoryDelay={catIndex}
                  />
                ))}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <AnimatedSection>
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-32 h-32 mx-auto"
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
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="relative p-8 md:p-16 rounded-3xl overflow-hidden text-center">
            <div className="absolute inset-0 bg-[#1a1a1a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 to-[#0f0f0f]/60" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px]" 
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6">
                Ready to <span className="font-serif italic text-[#D4AF37]">Order?</span>
              </h2>
              
              <p className="text-white/50 mb-8 max-w-md mx-auto font-light">
                Create an account to place your order and enjoy exclusive deals, 
                faster checkout, and order history.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium px-8 h-12">
                    Create Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white px-8 h-12 font-light">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/30 font-light">&copy; 2026 Pizza Palace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, index = 0, categoryDelay = 0 }: { product: Product; index?: number; categoryDelay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  const delay = categoryDelay * 0.5 + index * 0.1;
  
  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
    >
      <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 group rounded-2xl">
        <div className="h-56 relative w-full overflow-hidden">
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
            <Link href="/login">
              <Button size="sm" className="w-full bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
                Order Now
              </Button>
            </Link>
          </motion.div>
        </div>
        
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-light text-white text-xl">{product.name}</h3>
          </div>
          
          <p className="text-white/40 text-sm mb-4 line-clamp-2 font-light">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
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
    </motion.div>
  );
}
