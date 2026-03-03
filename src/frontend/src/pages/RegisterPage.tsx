import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Loader2, Pill, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useRegisterUser } from "../hooks/useQueries";

const ROLE_OPTIONS = [
  {
    value: UserRole.Company,
    label: "Pharmaceutical Company",
    icon: Building2,
    description: "Manufacture and list pharmaceutical products",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    value: UserRole.Distributor,
    label: "Distributor",
    icon: Truck,
    description: "Distribute products across your network",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    value: UserRole.Retailer,
    label: "Retailer / Pharmacy",
    icon: Store,
    description: "Retail pharmaceutical products to end-consumers",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isLoginSuccess, login } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const registerMutation = useRegisterUser();

  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contactEmail: "",
    phone: "",
    address: "",
    description: "",
  });

  // Redirect if already has profile
  useEffect(() => {
    if (!profileLoading && profile) {
      navigate({ to: "/dashboard" });
    }
  }, [profile, profileLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select your role.");
      return;
    }
    if (!formData.name || !formData.companyName || !formData.contactEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        ...formData,
        role: selectedRole as UserRole,
      });
      toast.success("Account registered successfully! Welcome to Pharmact.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    }
  };

  if (!isLoginSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-card">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl pharma-gradient-bg flex items-center justify-center">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Login Required
              </h2>
              <p className="text-muted-foreground">
                Please login with Internet Identity to create your Pharmact
                account.
              </p>
            </div>
            <Button onClick={() => login()} className="w-full" size="lg">
              Login with Internet Identity
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl pharma-gradient-bg flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Create Your Account
          </h1>
          <p className="text-muted-foreground">Join the Pharmact marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Select Your Role</CardTitle>
              <CardDescription>
                Choose how you participate in the pharmaceutical supply chain
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40 hover:bg-muted/50"
                  }`}
                  data-ocid="auth.role.select"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <role.icon className={`w-5 h-5 ${role.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{role.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                  {selectedRole === role.value && (
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      Selected
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Pharma Corp Ltd."
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        companyName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        contactEmail: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  placeholder="123 Medical District, City, Country"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your business, specialties, and products..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold"
            disabled={registerMutation.isPending || !selectedRole}
            data-ocid="auth.register.submit_button"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account & Get Started"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
