"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pizza, Crown, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <Pizza className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900">Pizza Palace</span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Make Admin</CardTitle>
            <CardDescription className="text-center">
              Promote a user to administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result?.success ? (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {result.message}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {result?.message && (
                  <Alert variant="destructive">
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter setup key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Default key: <code className="bg-gray-100 px-1 py-0.5 rounded">pizza-admin-2025</code>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600"
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

            <div className="mt-6 pt-6 border-t text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Back to home
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This page is for initial setup only.</p>
          <p>Make sure to change the secret key in production!</p>
        </div>
      </div>
    </div>
  );
}
