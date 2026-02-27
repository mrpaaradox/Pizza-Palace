"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
}

export function Loader({ size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-[#D4AF37]`}
      />
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </motion.div>
    </div>
  );
}
