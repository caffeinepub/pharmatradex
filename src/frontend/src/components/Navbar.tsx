import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  Menu,
  Pill,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export function Navbar() {
  const { login, clear, isLoginSuccess, loginStatus } = useInternetIdentity();
  const { data: profile, isLoading } = useCallerProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggingIn = loginStatus === "logging-in";

  const navLinks = [
    { to: "/", label: "Home", icon: null, ocid: "nav.home.link" },
    { to: "/catalog", label: "Catalog", icon: Pill, ocid: "nav.catalog.link" },
    {
      to: "/companies",
      label: "Companies",
      icon: Building2,
      ocid: "nav.companies.link",
    },
    {
      to: "/announcements",
      label: "Announcements",
      icon: Megaphone,
      ocid: "nav.announcements.link",
    },
  ];

  const getRoleBadgeVariant = (role?: string) => {
    if (role === "Company") return "default";
    if (role === "Distributor") return "secondary";
    return "outline";
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-md pharma-gradient-bg flex items-center justify-center">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block">
              <span className="text-foreground">Pharma</span>
              <span className="text-accent">ct</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "text-foreground bg-muted" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {!isLoginSuccess ? (
              <Button
                onClick={() => login()}
                disabled={isLoggingIn}
                size="sm"
                className="font-medium"
                data-ocid="nav.login.button"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Login
                  </>
                )}
              </Button>
            ) : isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
                        {profile.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {profile.name}
                      </span>
                      <Badge
                        variant={getRoleBadgeVariant(profile.role)}
                        className="text-xs h-4 px-1.5"
                      >
                        {profile.role}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-sm">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.companyName}
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/dashboard"
                      data-ocid="nav.dashboard.link"
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => clear()}
                    className="text-destructive focus:text-destructive"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link to="/register">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Register
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "text-foreground bg-muted" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            {isLoginSuccess && profile && (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
