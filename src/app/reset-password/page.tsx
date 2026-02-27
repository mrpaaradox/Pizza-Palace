"use client";

import { useState, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pizza, Loader2, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const passwordId = useId();
  const confirmPasswordId = useId();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Validation error", {
        description: "Passwords do not match",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Validation error", {
        description: "Password must be at least 8 characters",
      });
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link");
      toast.error("Invalid reset link");
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      });

      if (resetError) {
        console.error("Reset password error:", resetError);
        throw new Error(resetError.message || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successful!", {
        description: "You can now log in with your new password.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err?.message || "An unexpected error occurred");
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
            </motion.div>
            
            <h3 className="text-2xl font-light text-white mb-2">
              Password Reset!
            </h3>
            <p className="text-white/50 mb-8 font-light">
              Your password has been reset successfully
            </p>
            
            <Link href="/login">
              <Button className="bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium w-full h-14">
                Go to Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-end p-16">
          <h2 className="text-5xl font-light text-white mb-4 leading-tight">
            Reset<br />
            <span className="font-serif italic text-[#D4AF37]">Password</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Create a new password to secure your account.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f0f0f]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-3xl font-serif italic text-[#D4AF37] mb-2">Pizza Palace</h1>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-light text-white mb-2">
              Reset Password
            </h3>
            <p className="text-white/40 font-light">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert className="border-red-800 bg-red-950/30">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor={passwordId} className="text-white/70 text-sm">
                New Password
              </Label>
              <Input
                id={passwordId}
                type="password"
                placeholder="••••••••"
                className="h-14 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 text-lg"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
              />
              <p className="text-xs text-white/40">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={confirmPasswordId} className="text-white/70 text-sm">
                Confirm New Password
              </Label>
              <Input
                id={confirmPasswordId}
                type="password"
                placeholder="••••••••"
                className="h-14 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 text-lg"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium text-lg tracking-wide transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
            <Link href="/login" className="flex items-center justify-center gap-2 text-white/40 hover:text-[#D4AF37] transition-colors font-light">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
