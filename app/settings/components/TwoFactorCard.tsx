"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface TwoFactorCardProps {
  enabled: boolean;
  token: string | undefined;
  onEnable: (qrCode: string, secret: string) => void;
  onDisable: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export function TwoFactorCard({
  enabled,
  token,
  onEnable,
  onDisable,
  isSubmitting,
  setIsSubmitting,
}: TwoFactorCardProps) {
  const handleToggle = async () => {
    if (enabled) {
      // Disable
      setIsSubmitting(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/2fa`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: false }),
        });

        if (res.ok) {
          onDisable();
          toast.success("2FA disabled");
        } else {
          toast.error("Failed to disable 2FA");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Enable – fetch QR code
      setIsSubmitting(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings/2fa`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: true }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          onEnable(data.data.qr_code, data.data.secret);
        } else {
          toast.error(data.message || "Failed to enable 2FA");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Google Authenticator / Authy</p>
            <p className="text-sm text-muted-foreground">
              {enabled
                ? "Your account is protected with 2FA"
                : "Recommended for maximum security"}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isSubmitting}
          />
        </div>

        {enabled && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                2FA is active and protecting your account
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}