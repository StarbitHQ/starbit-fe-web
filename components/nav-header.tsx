"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StarBitLogo } from "./starbit-logo";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut, Sun, Moon } from "lucide-react"; // Import Sun and Moon icons
import { useState, useEffect } from "react"; // Import useEffect
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

// --- Theme Toggle Component (Requires 'next-themes') ---
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by returning a placeholder or null initially
    return <Button variant="ghost" size="icon" disabled className="w-9 h-9" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label="Toggle dark mode"
      className="p-0" // Use minimal padding for an icon-only button
    >
      {/* Sun icon for Light mode, rotates out when in Dark mode */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* Moon icon for Dark mode, rotates in when in Dark mode */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
// ----------------------------------------------------

// Helper function to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function NavHeader({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/trade", label: "Trade" },
        // { href: "/p2p", label: "P2P Trading" },
        { href: "/referral", label: "Referral" },
        { href: "/kyc", label: "KYC" },
        { href: "/support", label: "Support" },
      ]
    : [];

  const handleLogout = () => {
    // Delete auth cookies
    deleteCookie("auth_token");
    deleteCookie("user_data");

    // Show logout success message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });

    // Close mobile menu if open
    setMobileMenuOpen(false);

    // Redirect to login page
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center"
        >
          <StarBitLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle /> {/* <-- Added Theme Toggle (Desktop) */}
          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button & Theme Toggle on Mobile */}
        <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle /> {/* <-- Added Theme Toggle (Mobile) */}
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 justify-start w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 justify-start bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}