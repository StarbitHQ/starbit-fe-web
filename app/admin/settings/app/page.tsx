"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function AppSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    platform_name: "StarBit",
    contact_email: "",
    contact_phone: "",
    privacy_policy: "",
    terms_and_conditions: "",
    deposit_refund_policy: "",
    maintenance_mode: false,
    coingecko_cache_duration: 60,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const authToken = Cookies.get("auth_token");
        const response = await fetch(`${API_BASE_URL}/api/admin/settings/app`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load settings");
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load settings");
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
      const response = await fetch(`${API_BASE_URL}/api/admin/settings/app`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save settings");
      }

      toast({
        title: "Success",
        description: "App settings updated successfully",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error && isLoading === false && !settings.platform_name) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6" />
              App Settings
            </CardTitle>
            <CardDescription>Manage platform information, policies, and system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Privacy Policy</Label>
                  <Textarea
                    value={settings.privacy_policy}
                    onChange={(e) => setSettings({ ...settings, privacy_policy: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Terms and Conditions</Label>
                  <Textarea
                    value={settings.terms_and_conditions}
                    onChange={(e) => setSettings({ ...settings, terms_and_conditions: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deposit & Refund Policy</Label>
                  <Textarea
                    value={settings.deposit_refund_policy}
                    onChange={(e) => setSettings({ ...settings, deposit_refund_policy: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* System Settings */}
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable access for regular users</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(v) => setSettings({ ...settings, maintenance_mode: v })}
                  />
                </div>

                
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save All Settings"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}