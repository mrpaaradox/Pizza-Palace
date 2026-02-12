"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pizza, Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <Pizza className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900">Pizza Palace</span>
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium text-gray-900 mb-4">{email}</p>
            <p className="text-sm text-gray-600 mb-6">
              Please click the link in the email to verify your account. 
              If you don&apos;t see the email, check your spam folder.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p>
                <strong>Note:</strong> You must verify your email before you can log in and place orders.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
            <Link 
              href="/" 
              className="text-sm text-center text-gray-500 hover:text-gray-700"
            >
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
