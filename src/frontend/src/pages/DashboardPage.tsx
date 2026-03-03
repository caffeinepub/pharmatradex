import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { UserRole } from "../backend.d";
import BuyerDashboard from "../components/dashboard/BuyerDashboard";
import CompanyDashboard from "../components/dashboard/CompanyDashboard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isLoginSuccess, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();

  useEffect(() => {
    if (!isInitializing && !isLoginSuccess) {
      navigate({ to: "/" });
    }
  }, [isLoginSuccess, isInitializing, navigate]);

  useEffect(() => {
    if (!profileLoading && isLoginSuccess && profile === null) {
      navigate({ to: "/register" });
    }
  }, [profile, profileLoading, isLoginSuccess, navigate]);

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground text-sm">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {profile.role === UserRole.Company ? (
        <CompanyDashboard profile={profile} />
      ) : (
        <BuyerDashboard profile={profile} />
      )}
    </div>
  );
}
