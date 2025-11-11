"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function ReferralSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    referral_bonus_percentage: 5.0,
    min_referral_payout: 100.0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in as an admin to view settings");
          return;
        }

       

        const response = await fetch(`${API_BASE_URL}/api/admin/settings/referrals`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch referral settings");
        }

        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        } else {
          throw new Error(data.error || "Failed to load referral settings");
        }
      } catch (err: any) {
        setError(err.message || "Network error. Please check your connection and try again.");
        console.error("Error fetching referral settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        throw new Error("Please log in as an admin to update settings");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/settings/referrals`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update referral settings");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Referral Settings Updated",
          description: "Referral settings have been updated successfully.",
        });
        setSettings(data.data);
      } else {
        throw new Error(data.error || "Failed to update referral settings");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection and try again.");
      console.error("Error updating referral settings:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading referral settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
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
              <Users className="h-5 w-5 text-primary" />
              Referral Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure referral bonuses and payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="referral_bonus_percentage" className="text-foreground">
                  Referral Bonus Percentage (%)
                </Label>
                <Input
                  id="referral_bonus_percentage"
                  type="number"
                  value={settings.referral_bonus_percentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      referral_bonus_percentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Enter referral bonus percentage"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_referral_payout" className="text-foreground">
                  Minimum Referral Payout (USD)
                </Label>
                <Input
                  id="min_referral_payout"
                  type="number"
                  value={settings.min_referral_payout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      min_referral_payout: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Enter minimum referral payout"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Referral Settings"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}