"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StarBitLogo } from "./starbit-logo";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut, Settings, Sun, Moon } from "lucide-react"; 
import { useState, useEffect } from "react"; 
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { useTheme } from "next-themes"; 

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// --- Dark Mode Toggle Component ---
function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="w-9 h-9" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
// ---------------------------------

// --- Mobile Theme Toggle (For Mobile Menu List) ---
// This is a special version to render as a full-width list item
function MobileThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (!mounted) {
      return null; 
    }
  
    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 justify-start w-full"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? (
                <>
                    <Sun className="h-4 w-4" />
                    Light Mode
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                    Dark Mode
                </>
            )}
        </Button>
    );
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

  // Clean the user role by removing quotes and trimming whitespace
  const userRole = Cookies.get("user_role")
    ?.trim()
    .replace(/^["']|["']$/g, "");

  const isSuperAdmin = userRole === "super_admin" || userRole === "superadmin";

  const baseLinks = isAuthenticated
    ? [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/kyc", label: "KYC" },
        { href: "/admin/support", label: "Support" },
      ]
    : [];

  const superAdminExtras = isSuperAdmin
    ? [
        { href: "/admin/trading", label: "Trading" },

        { href: "/admin/users", label: "Users" },
        { href: "/admin/deposits", label: "Deposits" },
        { href: "/admin/withdrawals", label: "Withdrawals" },
        // { href: "/admin/referrals", label: "Referrals" },
      ]
    : [];

  const navLinks = [...baseLinks, ...superAdminExtras];

  const handleLogout = () => {
    deleteCookie("auth_token");
    deleteCookie("user_data");
    deleteCookie("user_role");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });

    setMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LOGO */}
        <Link
          href={isAuthenticated ? "/admin/dashboard" : "/"}
          className="flex items-center"
        >
          <StarBitLogo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle /> 
          {isAuthenticated ? (
            <>
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
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

        {/* Mobile Menu Toggle & Theme Toggle in Header (Only menu button remains) */}
        <div className="flex items-center gap-2 md:hidden">
            {/* ThemeToggle is REMOVED from the header bar on mobile
               and placed inside the mobile menu for a cleaner look. 
               Only the menu button remains here: */}
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
            {/* NAV LINKS */}
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
                  <MobileThemeToggle /> {/* <-- Added Mobile Theme Toggle here */}
                  
                  {/* The rest of the authenticated links */}
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

                  <Link href="/admin/settings">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 justify-start w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
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
                // Unauthenticated links remain the same
                <>
                  <MobileThemeToggle /> {/* <-- Added Mobile Theme Toggle here for unauthenticated users too */}
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