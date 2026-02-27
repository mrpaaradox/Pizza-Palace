"use client";

import { motion } from "motion/react";
import { Pizza } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
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
  );
}
