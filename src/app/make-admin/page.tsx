"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pizza, Crown, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function MakeAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, secretKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
        toast.success("Success!", { description: data.message });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setResult({ success: false, message: data.error || "Failed to make user admin" });
        toast.error("Error", { description: data.error || "Failed to make user admin" });
      }
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred" });
      toast.error("Error", { description: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/3 rounded-full blur-[100px]" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Link href="/" className="group">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Pizza className="w-7 h-7 text-black" />
              </div>
            </Link>
            <span className="text-3xl font-light text-white"><span className="font-serif italic text-[#D4AF37]">Pizza</span> Palace</span>
          </div>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/20">
                  <Crown className="w-8 h-8 text-[#D4AF37]" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center font-light text-white">Make Admin</CardTitle>
              <CardDescription className="text-center text-white/50">
                Promote a user to administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result?.success ? (
                <Alert className="bg-[#D4AF37]/10 border-[#D4AF37]/30">
                  <AlertDescription className="text-[#D4AF37]">
                    {result.message}
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {result?.message && (
                    <Alert variant="destructive" className="bg-red-950/30 border-red-900">
                      <AlertDescription className="text-red-400">{result.message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70">User Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretKey" className="text-white/70">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="Enter setup key"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                      required
                    />
                    <p className="text-xs text-white/40">
                      Default key: <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-[#D4AF37]">pizza-admin-2025</code>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Making Admin...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Make Admin
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-[#2a2a2a] text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#D4AF37] transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to home
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-white/30">
            <p>This page is for initial setup only.</p>
            <p>Make sure to change the secret key in production!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
