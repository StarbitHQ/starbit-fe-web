"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function AppSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    platform_name: "StarBit",
    maintenance_mode: false,
    coingecko_cache_duration: 60,
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

        // const userData = Cookies.get("user_data");
        // if (userData && JSON.parse(userData).role !== "admin") {
        //   setError("Unauthorized: Admin access required");
        //   return;
        // }

        const response = await fetch(`${API_BASE_URL}/api/admin/settings/app`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch app settings");
        }

        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        } else {
          throw new Error(data.error || "Failed to load app settings");
        }
      } catch (err: any) {
        setError(err.message || "Network error. Please check your connection and try again.");
        console.error("Error fetching app settings:", err);
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

      const response = await fetch(`${API_BASE_URL}/api/admin/settings/app`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update app settings");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "App Settings Updated",
          description: "App settings have been updated successfully.",
        });
        setSettings(data.data);
      } else {
        throw new Error(data.error || "Failed to update app settings");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection and try again.");
      console.error("Error updating app settings:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading app settings...</p>
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
              <Smartphone className="h-5 w-5 text-primary" />
              App Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure platform name and maintenance mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform_name" className="text-foreground">
                  Platform Name
                </Label>
                <Input
                  id="platform_name"
                  value={settings.platform_name}
                  onChange={(e) =>
                    setSettings({ ...settings, platform_name: e.target.value })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Enter platform name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance_mode" className="text-foreground">
                  Maintenance Mode
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenance_mode: checked })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {settings.maintenance_mode
                      ? "Maintenance mode is enabled"
                      : "Maintenance mode is disabled"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coingecko_cache_duration" className="text-foreground">
                  CoinGecko Cache Duration (minutes)
                </Label>
                <Input
                  id="coingecko_cache_duration"
                  type="number"
                  value={settings.coingecko_cache_duration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      coingecko_cache_duration: parseInt(e.target.value) || 60,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Enter cache duration in minutes"
                  min="1"
                  max="1440"
                />
                <p className="text-sm text-muted-foreground">
                  Cache duration for CoinGecko API data (1–1440 minutes).
                </p>
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
                  "Save App Settings"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}