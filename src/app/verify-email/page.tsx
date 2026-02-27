"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pizza, Mail, ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [status, setStatus] = useState<"loading" | "pending" | "success" | "error">(
    token ? "loading" : email ? "pending" : "error"
  );

  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          const response = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            setStatus("success");
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1500);
          } else {
            setStatus("error");
          }
        } catch (error) {
          console.error("Verification error:", error);
          setStatus("error");
        }
      };
      verifyEmail();
    }
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="pt-6 flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mb-4" />
              <p className="text-white/50">Verifying your email...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 to-transparent" />
          
          <div className="relative z-10 flex flex-col justify-end p-16">
            <h2 className="text-5xl font-light text-white mb-4 leading-tight">
              Verify<br />
              <span className="font-serif italic text-[#D4AF37]">Email</span>
            </h2>
            <p className="text-white/60 text-lg max-w-md">
              Confirm your email to start ordering delicious pizzas.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f0f0f]">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-12 text-center">
              <h1 className="text-3xl font-serif italic text-[#D4AF37] mb-2">Pizza Palace</h1>
            </div>

            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-light text-white">Check Your Email</CardTitle>
                <CardDescription className="text-white/50">
                  We've sent a verification link to
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-light text-[#D4AF37] mb-4">{email}</p>
                <p className="text-white/40 text-sm mb-6">
                  Please click the link in the email to verify your account. 
                  If you don't see the email, check your spam folder.
                </p>
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg p-4 text-sm text-white/70">
                  <p>
                    <strong>Note:</strong> You must verify your email before you can log in and place orders.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full border-[#2a2a2a] text-white hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
                <Link href="/" className="text-sm text-center text-white/40 hover:text-white">
                  Back to home
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 to-transparent" />
          
          <div className="relative z-10 flex flex-col justify-end p-16">
            <h2 className="text-5xl font-light text-white mb-4 leading-tight">
              Welcome<br />
              <span className="font-serif italic text-[#D4AF37]">Home!</span>
            </h2>
            <p className="text-white/60 text-lg max-w-md">
              Your email has been verified. Redirecting to dashboard...
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f0f0f]">
          <div className="w-full max-w-md text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
            </motion.div>
            <h2 className="text-2xl font-light text-white mb-2">Email Verified!</h2>
            <p className="text-white/50 mb-4">Your email has been successfully verified.</p>
            <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37] mx-auto" />
          </div>
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
            Verification<br />
            <span className="font-serif italic text-[#D4AF37]">Failed</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Something went wrong with your email verification.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f0f0f]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-3xl font-serif italic text-[#D4AF37] mb-2">Pizza Palace</h1>
          </div>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-light text-white">Verification Failed</CardTitle>
              <CardDescription className="text-white/50">
                We couldn't verify your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/40 text-sm mb-4">
                The verification link may be invalid or expired.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full border-[#2a2a2a] text-white hover:bg-[#1a1a1a] hover:border-[#D4AF37]/30">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
