"use client";

import { motion } from "motion/react";
import { Pizza } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-end p-16">
          <h2 className="text-5xl font-light text-white mb-4 leading-tight">
            Welcome to<br />
            <span className="font-serif italic text-[#D4AF37]">Pizza Palace</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Experience the finest pizzas crafted with passion and the finest ingredients.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-24 h-24 mx-auto"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border border-[#D4AF37]/30 rounded-full w-20 h-20 mx-auto"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative w-20 h-20 mx-auto rounded-full bg-[#D4AF37] flex items-center justify-center"
            >
              <Pizza className="w-10 h-10 text-black" />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-white/50 font-light"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
