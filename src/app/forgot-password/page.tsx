"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: requestError } =
        await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });

      if (requestError) {
        console.error("Request password reset error:", requestError);
        throw new Error(requestError.message || "Failed to send reset email");
      }

      setIsSuccess(true);
      toast.success("Reset email sent!", {
        description: "Please check your email for the reset link.",
      });
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err?.message || "An unexpected error occurred");
      toast.error("Failed to send reset email");
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
            Forgot your
            <br />
            <span className="font-serif italic text-[#D4AF37]">Password?</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            No worries. Enter your email and we'll send you a link to reset your
            password.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f0f0f]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-3xl font-serif italic text-[#D4AF37] mb-2">
              Pizza Palace
            </h1>
          </div>

          <div className="mb-10">
            {isSuccess ? (
              <div className="text-center">
                <h3 className="text-2xl font-light text-white mb-2">
                  Check Your Email
                </h3>
                <p className="text-white/40">
                  We've sent you a password reset link
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-light text-white mb-2">
                  Reset Password
                </h3>
                <p className="text-white/40">
                  Enter your email to receive a reset link
                </p>
              </div>
            )}
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="text-center p-8 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <p className="text-white/70 mb-2">
                  We've sent a password reset link to{" "}
                  <span className="text-[#D4AF37]">{email}</span>
                </p>
                <p className="text-white/40 text-sm">
                  Please check your email and click the link to reset your
                  password.
                </p>
              </div>

              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full h-14 border-white/20 text-white hover:bg-white/10"
              >
                <Mail className="w-5 h-5 mr-2" />
                Try Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-800 bg-red-950/30">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
