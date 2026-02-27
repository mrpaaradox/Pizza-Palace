"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid credentials");
        toast.error("Login failed", {
          description: result.error.message || "Invalid credentials",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error("Login failed", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-3xl font-serif italic text-[#D4AF37] mb-2">Pizza Palace</h1>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-light text-white mb-2">Sign in</h3>
            <p className="text-white/40">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-800 bg-red-950/30">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor={emailId} className="text-white/70 text-sm">
                Email
              </Label>
              <Input
                id={emailId}
                type="email"
                placeholder="your@email.com"
                className="h-14 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 text-lg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={passwordId} className="text-white/70 text-sm">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id={passwordId}
                type="password"
                placeholder="••••••••"
                className="h-14 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 text-lg"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#2a2a2a]">
            <p className="text-center text-white/40">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#D4AF37] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
