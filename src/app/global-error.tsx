"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Pizza, Home, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  title?: string;
  description?: string;
  code?: string;
}

export default function ErrorPage({ 
  title = "Something went wrong", 
  description = "We couldn't load this page. Please try again later.",
  code
}: ErrorPageProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (!window.history.state || window.history.state.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-[#2a2a2a] rounded-full w-48 h-48 mx-auto"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border border-[#D4AF37]/20 rounded-full w-44 h-44 mx-auto"
            />
            <div className="relative w-40 h-40 mx-auto rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
              <Pizza className="w-16 h-16 text-[#D4AF37]" />
            </div>
          </div>
        </motion.div>

        {code && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-8xl font-light text-[#D4AF37]/20 mb-4"
          >
            {code}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-light text-white mb-4"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/50 mb-8 max-w-md mx-auto font-light"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="border-[#2a2a2a] text-white/60 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30 hover:text-white font-light w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
