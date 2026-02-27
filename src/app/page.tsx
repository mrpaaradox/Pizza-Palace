"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useInView, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { 
  Pizza, 
  Truck, 
  Star, 
  MapPin, 
  Phone, 
  ArrowRight,
  Leaf,
  Award,
  Clock,
  ShoppingBag,
  Flame
} from "lucide-react";

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);
  
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-[#D4AF37] origin-left z-[60]"
      style={{ scaleX }}
    />
  );
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[100px]" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white/50">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>#1 Pizza in the City</span>
                </div>
              </AnimatedSection>
              
              <AnimatedSection>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-tight">
                  <span className="block text-white">Crafted for</span>
                  <span className="block font-serif italic text-[#D4AF37]">Perfection</span>
                </h1>
              </AnimatedSection>
              
              <AnimatedSection>
                <p className="text-lg text-white/50 max-w-lg leading-relaxed font-light">
                  Hand-tossed dough, aged mozzarella, and ingredients sourced from the finest Italian farms. Every pizza tells a story of tradition.
                </p>
              </AnimatedSection>
              
              <AnimatedSection>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/menu">
                    <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c9a227] text-black text-base px-8 h-14 font-medium">
                      <span>Order Now</span>
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white h-14 font-light">
                      Join Club
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="flex gap-10 pt-4">
                  <div>
                    <div className="text-3xl font-light text-white">50k+</div>
                    <div className="text-sm text-white/40">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-white">4.9</div>
                    <div className="text-sm text-white/40 flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#D4AF37]" fill="#D4AF37" /> Rating
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-white">25min</div>
                    <div className="text-sm text-white/40">Delivery</div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection>
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 border border-[#2a2a2a] rounded-full animate-spin-slow" />
                <div className="absolute inset-2 border border-[#2a2a2a]/50 rounded-full animate-spin-slow-reverse" />
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80"
                    alt="Pizza"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-8 right-8 p-4 rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                        <Truck className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="font-light text-white">Free Delivery</div>
                        <div className="text-xs text-white/40">Orders over $30</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">Hot</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="25 Min Delivery"
              description="Fast and hot delivery to your doorstep."
              delay={0}
            />
            <FeatureCard
              icon={<Leaf className="w-6 h-6" />}
              title="Fresh Ingredients"
              description="Daily sourced from local farms."
              delay={1}
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="Award Winning"
              description="Recognized as city's best pizza."
              delay={2}
            />
            <FeatureCard
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Easy Ordering"
              description="Order in seconds, receive in minutes."
              delay={3}
            />
          </div>
        </div>
      </section>

      {/* Popular Items */}
      <section className="py-24 md:py-32 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                Popular <span className="font-serif italic text-[#D4AF37]">Choices</span>
              </h2>
              <p className="text-white/50 font-light">
                Most loved pizzas by our customers
              </p>
            </div>
            <Link href="/menu">
              <Button variant="outline" className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white font-light">
                View Menu
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PizzaCard
              name="Margherita"
              description="San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil."
              price="$18.99"
              image="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80"
              index={0}
            />
            <PizzaCard
              name="Pepperoni Supreme"
              description="Double pepperoni, mozzarella, oregano, with our signature sauce."
              price="$22.99"
              image="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80"
              index={1}
            />
            <PizzaCard
              name="Four Cheese"
              description="Mozzarella, gorgonzola, parmesan, fontina, with truffle honey drizzle."
              price="$24.99"
              image="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="relative p-8 md:p-16 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[#1a1a1a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 to-[#0f0f0f]/60" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px]" 
            />
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6">
                Join the <span className="font-serif italic text-[#D4AF37]">Family</span>
              </h2>
              
              <p className="text-white/50 mb-8 max-w-md mx-auto font-light">
                Create an account and get 20% off your first order, exclusive deals, and faster checkout.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c9a227] text-black text-base px-8 h-12 font-medium">
                    Create Account
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button size="lg" variant="outline" className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white h-12 font-light">
                    Browse Menu
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Pizza className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-light">
                  <span className="font-serif italic text-[#D4AF37]">Pizza Palace</span>
                </span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed font-light">
                Crafting the finest pizzas with passion and tradition since 2020.
              </p>
            </div>

            <div>
              <h3 className="font-light mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3 text-sm text-white/40 font-light">
                <li><Link href="/menu" className="hover:text-white transition-colors">Menu</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Orders</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Join Club</Link></li>
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              </ul>
            </div>

            <div>
              <h3 className="font-light mb-4 text-white">Contact</h3>
              <ul className="space-y-3 text-sm text-white/40 font-light">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>123 Pizza Street</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>(555) 123-4567</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-light mb-4 text-white">Hours</h3>
              <ul className="space-y-2 text-sm text-white/40 font-light">
                <li className="flex justify-between"><span>Mon - Thu</span><span>11am - 10pm</span></li>
                <li className="flex justify-between"><span>Fri - Sat</span><span>11am - 11pm</span></li>
                <li className="flex justify-between"><span>Sunday</span><span>12pm - 9pm</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#2a2a2a] text-center text-sm text-white/30 font-light">
            <p>&copy; 2026 Pizza Palace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }: { 
  icon: React.ReactNode;
  title: string; 
  description: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-colors group"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors"
      >
        <div className="text-[#D4AF37]">{icon}</div>
      </motion.div>
      <h3 className="text-lg font-light mb-2 text-white">{title}</h3>
      <p className="text-white/40 text-sm font-light">{description}</p>
    </motion.div>
  );
}

function PizzaCard({ name, description, price, image, index = 0 }: { 
  name: string; 
  description: string; 
  price: string; 
  image: string;
  index?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  return (
    <motion.div 
      ref={ref}
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] hover:border-[#D4AF37]/30 transition-colors"
    >
      <div className="relative h-56 overflow-hidden">
        <ParallaxImage 
          src={image} 
          alt={name} 
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-light mb-2 text-white">{name}</h3>
        <p className="text-white/40 text-sm mb-4 line-clamp-2 font-light">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-light text-[#D4AF37]">{price}</span>
          <Link href="/menu">
            <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium">
              Order
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
