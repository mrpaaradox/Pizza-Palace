"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, MapPin, Phone, Building, Home, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const COUNTRIES = [
  { code: "+1", name: "United States", flag: "🇺🇸", postalLength: 5 },
  { code: "+1", name: "Canada", flag: "🇨🇦", postalLength: 6 },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", postalLength: 6 },
  { code: "+91", name: "India", flag: "🇮🇳", postalLength: 6 },
  { code: "+61", name: "Australia", flag: "🇦🇺", postalLength: 4 },
  { code: "+49", name: "Germany", flag: "🇩🇪", postalLength: 5 },
  { code: "+33", name: "France", flag: "🇫🇷", postalLength: 5 },
  { code: "+81", name: "Japan", flag: "🇯🇵", postalLength: 7 },
  { code: "+86", name: "China", flag: "🇨🇳", postalLength: 6 },
  { code: "+82", name: "South Korea", flag: "🇰🇷", postalLength: 5 },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].code);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Parse phone to extract country code
        if (userData.phone) {
          const matchedCountry = COUNTRIES.find(c => userData.phone.startsWith(c.code));
          if (matchedCountry) {
            setSelectedCountry(matchedCountry.code);
            setFormData({
              phone: userData.phone.replace(matchedCountry.code, ""),
              address: userData.address || "",
              city: userData.city || "",
              postalCode: userData.postalCode || "",
            });
          } else {
            setFormData({
              phone: userData.phone || "",
              address: userData.address || "",
              city: userData.city || "",
              postalCode: userData.postalCode || "",
            });
          }
        } else {
          setFormData({
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            postalCode: userData.postalCode || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session, isPending, router, fetchUserProfile]);

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
  };

  const handlePostalCodeChange = (value: string) => {
    const maxLength = currentCountry.postalLength;
    setFormData({ ...formData, postalCode: value.slice(0, maxLength) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const fullPhone = `${selectedCountry}${formData.phone}`;
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated!", {
        description: "Your delivery information has been saved.",
      });
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const isProfileComplete = formData.address && formData.city && formData.postalCode && formData.phone;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and delivery information</p>
      </div>

      {!isProfileComplete && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            <strong>Complete your profile:</strong> Please add your delivery address to place orders.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-500">Name</Label>
              <p className="font-medium">{user?.name || "Not set"}</p>
            </div>
            <div>
              <Label className="text-gray-500">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-gray-500">Role</Label>
              <p className="font-medium capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            {user?.emailVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Email verified</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number <span className="text-red-500 text-sm">*</span>
                </Label>
                <div className="flex gap-2 mt-1">
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-24 h-10 bg-gray-50 border-gray-200">
                      <SelectValue>
                        {COUNTRIES.find(c => c.code === selectedCountry)?.flag} {selectedCountry}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="w-32">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code} className="py-2">
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="1234567890"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="flex-1"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formData.phone.length}/10 digits</p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Street Address <span className="text-red-500 text-sm">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="123 Pizza Street"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    City <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>Postal Code <span className="text-red-500 text-sm">*</span></Label>
                  <Input
                    type="text"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={(e) => handlePostalCodeChange(e.target.value)}
                    className="mt-1"
                    maxLength={currentCountry.postalLength}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{currentCountry.postalLength} digits for {currentCountry.name}</p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-500 hover:bg-red-600"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
