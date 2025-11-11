"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);
      setError(null);

      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        setError("Please log in as an admin to view settings");
        return;
      }

    //   const userData = Cookies.get("user_data");
    //   if (userData && JSON.parse(userData).role !== "admin") {
    //     setError("Unauthorized: Admin access required");
    //     return;
    //   }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage platform configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/settings/payments">
                <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-foreground">Payment Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure payment methods and limits
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/settings/app">
                <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Smartphone className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-foreground">App Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage platform name and maintenance mode
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/settings/referrals">
                <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-foreground">Referral Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure referral bonuses and payouts
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}