import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe2,
  Loader2,
  Pill,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSeedSampleData } from "../hooks/useQueries";

export default function LandingPage() {
  const { isLoginSuccess, login } = useInternetIdentity();
  const seedMutation = useSeedSampleData();

  const handleSeedData = async () => {
    try {
      await seedMutation.mutateAsync();
      toast.success(
        "Sample data loaded successfully! Browse the catalog to explore.",
      );
    } catch {
      toast.error("Failed to load sample data. Please try again.");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pharma-gradient-bg min-h-[560px] flex items-center"
        style={{
          backgroundImage: `url('/assets/generated/pharma-hero-bg.dim_1600x600.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.15_0.05_255/0.85)] to-[oklch(0.1_0.04_250/0.92)]" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 text-sm px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            B2B Pharmaceutical Marketplace
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
            Connecting Pharma <span className="text-accent">Companies</span>,{" "}
            <span className="text-accent">Distributors</span> &{" "}
            <span className="text-accent">Retailers</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pharmact streamlines pharmaceutical supply chain management — browse
            products, place bulk orders, and grow your network in one secure
            platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="font-semibold text-base px-8 shadow-teal"
              asChild
              data-ocid="landing.browse_catalog.primary_button"
            >
              <Link to="/catalog">
                Browse Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            {!isLoginSuccess ? (
              <Button
                size="lg"
                variant="outline"
                className="font-semibold text-base px-8 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                onClick={() => login()}
                data-ocid="landing.signup.secondary_button"
              >
                Sign Up Free
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="font-semibold text-base px-8 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                asChild
                data-ocid="landing.signup.secondary_button"
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 pt-8 border-t border-white/10">
            {[
              { label: "Active Companies", value: "500+" },
              { label: "Products Listed", value: "10K+" },
              { label: "Monthly Orders", value: "25K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-display font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">
              Platform Features
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Purpose-built for pharmaceutical supply chain stakeholders at
              every level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "For Pharmaceutical Companies",
                description:
                  "List your products, manage inventory, handle incoming orders, and broadcast promotions to distributors and retailers.",
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-950/30",
                features: [
                  "Product catalog management",
                  "Order fulfillment tracking",
                  "Revenue analytics",
                ],
              },
              {
                icon: Truck,
                title: "For Distributors",
                description:
                  "Source products directly from manufacturers, place bulk orders, track deliveries, and manage your supply chain.",
                color: "text-teal-600",
                bg: "bg-teal-50 dark:bg-teal-950/30",
                features: [
                  "Direct manufacturer access",
                  "Bulk order management",
                  "Delivery tracking",
                ],
              },
              {
                icon: Store,
                title: "For Retailers",
                description:
                  "Access a wide range of pharmaceutical products, compare prices, and ensure steady stock for your pharmacy or clinic.",
                color: "text-indigo-600",
                bg: "bg-indigo-50 dark:bg-indigo-950/30",
                features: [
                  "Wide product selection",
                  "Competitive pricing",
                  "Low minimum orders",
                ],
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="border border-border shadow-card card-hover"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Pharmact Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            {[
              {
                step: "01",
                icon: ShieldCheck,
                title: "Create Your Account",
                description:
                  "Register as a Company, Distributor, or Retailer using secure Internet Identity authentication.",
              },
              {
                step: "02",
                icon: Globe2,
                title: "Explore the Marketplace",
                description:
                  "Browse thousands of pharmaceutical products, filter by category, and review company profiles.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Trade & Grow",
                description:
                  "Place orders, track fulfillment in real-time, and build lasting partnerships across the supply chain.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl pharma-gradient-bg flex items-center justify-center shadow-teal">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {step.step.slice(-1)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: ShieldCheck,
                label: "Verified Companies",
                value: "100% KYC",
              },
              { icon: Pill, label: "Product Categories", value: "18+" },
              { icon: Globe2, label: "Countries Served", value: "40+" },
              { icon: TrendingUp, label: "Platform Uptime", value: "99.9%" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 pharma-gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <Pill className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Pharma Business?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of pharmaceutical professionals on Pharmact today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isLoginSuccess ? (
              <Button
                size="lg"
                className="font-semibold px-8 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => login()}
              >
                Get Started Free
              </Button>
            ) : (
              <Button
                size="lg"
                className="font-semibold px-8 bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="font-semibold px-8 border-white/30 text-white hover:bg-white/10"
              onClick={handleSeedData}
              disabled={seedMutation.isPending}
              data-ocid="landing.seed_data.button"
            >
              {seedMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Demo Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Load Demo Data
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
