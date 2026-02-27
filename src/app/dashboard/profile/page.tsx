"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, MapPin, Phone, Building, Home, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const COUNTRIES = [
  { code: "+1", name: "United States", flag: "🇺🇸", postalLength: 5, key: "+1-US" },
  { code: "+1", name: "Canada", flag: "🇨🇦", postalLength: 6, key: "+1-CA" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", postalLength: 6, key: "+44" },
  { code: "+91", name: "India", flag: "🇮🇳", postalLength: 6, key: "+91" },
  { code: "+61", name: "Australia", flag: "🇦🇺", postalLength: 4, key: "+61" },
  { code: "+49", name: "Germany", flag: "🇩🇪", postalLength: 5, key: "+49" },
  { code: "+33", name: "France", flag: "🇫🇷", postalLength: 5, key: "+33" },
  { code: "+81", name: "Japan", flag: "🇯🇵", postalLength: 7, key: "+81" },
  { code: "+86", name: "China", flag: "🇨🇳", postalLength: 6, key: "+86" },
  { code: "+82", name: "South Korea", flag: "🇰🇷", postalLength: 5, key: "+82" },
];

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].key);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const { data: profileData, isLoading, error } = trpc.profile.get.useQuery();

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!", {
        description: "Your delivery information has been saved.",
      });
      utils.profile.get.invalidate();
    },
    onError: (err) => {
      if (err.message?.includes("Unauthorized")) {
        router.push("/login");
        return;
      }
      toast.error("Failed to update profile", {
        description: err.message,
      });
    },
  });

  const requestDeletionMutation = trpc.profile.requestDeletion.useMutation({
    onSuccess: () => {
      toast.success("Account deletion requested", {
        description: "An admin will review your request. You'll be logged out shortly.",
      });
      utils.profile.get.invalidate();
      setShowDeleteDialog(false);
      setTimeout(async () => {
        await fetch("/api/auth/signout", { method: "POST" });
        window.location.href = "/login";
      }, 2000);
    },
    onError: (err) => {
      toast.error("Failed to request deletion", {
        description: err.message,
      });
    },
  });

  const currentCountry = COUNTRIES.find(c => c.key === selectedCountry) || COUNTRIES[0];

  useEffect(() => {
    if (error?.message?.includes("Unauthorized")) {
      router.push("/login");
    }
  }, [error, router]);

  useEffect(() => {
    if (!profileData) return;
    
    const country = COUNTRIES.find(c => profileData.phone?.startsWith(c.code));
    if (country) {
      setSelectedCountry(country.key);
    }
    
    setFormData({
      phone: profileData.phone?.replace(country?.code || "", "") || "",
      address: profileData.address || "",
      city: profileData.city || "",
      postalCode: profileData.postalCode || "",
    });
  }, [profileData]);

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
    const fullPhone = `${currentCountry.code}${formData.phone}`;
    
    updateProfileMutation.mutate({
      phone: fullPhone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const isProfileComplete = formData.address && formData.city && formData.postalCode && formData.phone;

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-white">Profile</h1>
          <p className="text-white/50 mt-1">Manage your account and delivery information</p>
        </div>
      </AnimatedSection>

      {!isProfileComplete && (
        <AnimatedSection>
          <Alert className="bg-amber-950/30 border-amber-800">
            <AlertDescription className="text-amber-400">
              <strong>Complete your profile:</strong> Please add your delivery address to place orders.
            </AlertDescription>
          </Alert>
        </AnimatedSection>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white font-light">
                <User className="w-5 h-5 text-[#D4AF37]" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/50">Name</Label>
                <p className="font-light text-white">{profileData?.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-white/50">Email</Label>
                <p className="font-light text-white">{profileData?.email}</p>
              </div>
              <div>
                <Label className="text-white/50">Role</Label>
                <p className="font-light text-white capitalize">{profileData?.role?.toLowerCase()}</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white font-light">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-white/70">
                    <Phone className="w-4 h-4" />
                    Phone Number <span className="text-[#D4AF37] text-sm">*</span>
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="w-24 h-10 bg-[#1a1a1a] border-[#2a2a2a] text-white">
                        <SelectValue>
                          {COUNTRIES.find(c => c.key === selectedCountry)?.flag} {COUNTRIES.find(c => c.key === selectedCountry)?.code}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.key} value={country.key} className="text-white">
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
                      className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">{formData.phone.length}/10 digits</p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-white/70">
                    <Home className="w-4 h-4" />
                    Street Address <span className="text-[#D4AF37] text-sm">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="123 Pizza Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 text-white/70">
                      <Building className="w-4 h-4" />
                      City <span className="text-[#D4AF37] text-sm">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/70">Postal Code <span className="text-[#D4AF37] text-sm">*</span></Label>
                    <Input
                      type="text"
                      placeholder="10001"
                      value={formData.postalCode}
                      onChange={(e) => handlePostalCodeChange(e.target.value)}
                      className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-white/30 focus:border-[#D4AF37]"
                      maxLength={currentCountry.postalLength}
                      required
                    />
                    <p className="text-xs text-white/40 mt-1">{currentCountry.postalLength} digits for {currentCountry.name}</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#D4AF37] hover:bg-[#c9a227] text-black font-medium"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
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
        </AnimatedSection>

        <AnimatedSection className="lg:col-span-2">
          <Card className="bg-[#1a1a1a] border-red-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white font-light">
                <Trash2 className="w-5 h-5 text-red-500" />
                Delete Account
              </CardTitle>
              <CardDescription className="text-white/50">
                Request to permanently delete your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileData?.deletionRequestedAt ? (
                <Alert className="bg-amber-950/30 border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-400">
                    Your account deletion request is pending review. You'll be notified once an admin processes it.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-red-950/30 border-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      This action cannot be undone. All your data will be permanently removed after admin approval.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    className="w-full border-red-800 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Request Account Deletion
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-[#D4AF37]" />
              Delete Account?
            </DialogTitle>
            <DialogDescription className="text-white/50">
              This will submit a request to permanently delete your account. 
              An admin will review and approve the deletion, after which all your data will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-[#2a2a2a] text-white hover:bg-[#1a1a1a]">
              Cancel
            </Button>
              <Button 
                variant="destructive" 
                onClick={() => requestDeletionMutation.mutate()}
                disabled={requestDeletionMutation.isPending}
              >
                {requestDeletionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Yes, Delete My Account"
                )}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
