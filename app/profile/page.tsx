// app/profile/page.tsx
"use client";

import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL } from "@/lib/api";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  Shield,
  Settings,
  MessageCircle,
  Crown,
  Mail,
  User,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const cached = Cookies.get("user_data");
      if (cached) {
        setUser(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      const token = Cookies.get("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data.user);
            Cookies.set("user_data", JSON.stringify(data.data.user));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Generate random but consistent avatar based on user ID or email
  const generateAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=1e40af,3b82f6,6366f1&size=120`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Not Logged In</p>
            <p className="text-muted-foreground mb-6">
              Please log in to view your profile.
            </p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarSeed = user.id || user.email || "user";
  const avatarUrl = generateAvatarUrl(avatarSeed);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

        {/* Profile Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 text-center">
            <Avatar className="h-28 w-28 mx-auto mb-4 ring-4 ring-background">
              <AvatarImage src={avatarUrl} alt={user.name} />
              <AvatarFallback className="text-3xl bg-primary/10">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-2xl font-bold text-foreground">
              {user.name || "User"}
            </h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>

            <div className="mt-4 flex justify-center gap-3">
              <Badge variant="secondary" className="text-xs">
                User ID: {user.id || "N/A"}
              </Badge>
              {user.referral_code && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Ref: {user.referral_code}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Action Links Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* KYC Verification */}
          <Link href="/kyc">
            <Card className="hover:bg-muted/50 transition-all cursor-pointer border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-500/10">
                      <Shield className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        KYC Verification
                      </CardTitle>
                      <CardDescription>
                        {user.kyc_status === "verified"
                          ? "Verified – Full access granted"
                          : "Verify identity for higher limits"}
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Settings */}
          <Link href="/settings">
            <Card className="hover:bg-muted/50 transition-all cursor-pointer border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-500/10">
                      <Settings className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Account Settings
                      </CardTitle>
                      <CardDescription>
                        Security, password, 2FA & preferences
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Support */}
          <Link href="/support">
            <Card className="hover:bg-muted/50 transition-all cursor-pointer border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-500/10">
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Support Center</CardTitle>
                      <CardDescription>
                        Get help & submit tickets
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Upgrade Account */}
          <Link href="/vendors">
            <Card className="hover:bg-muted/50 transition-all cursor-pointer border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-yellow-500/10">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Become a vendor</CardTitle>
                      <CardDescription>
                        Unlock VIP features & benefits
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* <Link href="/upgrade">
            <Card className="hover:bg-muted/50 transition-all cursor-pointer border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-yellow-500/10">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Upgrade Account</CardTitle>
                      <CardDescription>
                        Unlock VIP features & benefits
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link> */}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/support" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
