// app/settings/page.tsx
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Image from "next/image";
import {
  Shield, Lock, Smartphone, Mail, Bell, AlertTriangle, Copy, CheckCircle2,
  QrCode, Loader2, LogOut, Trash2, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface UserSettings {
  email: string;
  phone: string | null;
  two_factor_enabled: boolean;
  anti_phishing_code: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [antiPhishingCode, setAntiPhishingCode] = useState("");

  // 2FA states
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupKey, setBackupKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const token = Cookies.get("auth_token");

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          setTwoFAEnabled(data.data.two_factor_enabled);
          setAntiPhishingCode(data.data.anti_phishing_code || "");
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  // Update Password
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle 2FA
  const handle2FAToggle = async () => {
    if (twoFAEnabled) {
      // Disable 2FA
      const res = await fetch(`${API_BASE_URL}/api/user/settings/2fa`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: false }),
      });

      if (res.ok) {
        setTwoFAEnabled(false);
        toast.success("2FA disabled");
      }
    } else {
      // Enable 2FA - show QR
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/user/settings/2fa`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: true }),
      });

      const data = await res.json();
      if (data.success && data.data.qr_code) {
        setQrCodeUrl(data.data.qr_code);
        setBackupKey(data.data.secret);
        setShow2FAModal(true);
      }
      setIsSubmitting(false);
    }
  };

  // Verify 2FA code
  const verify2FA = async () => {
    const res = await fetch(`${API_BASE_URL}/api/user/settings/2fa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code: verificationCode }),
    });

    const data = await res.json();
    if (data.success) {
      setTwoFAEnabled(true);
      setShow2FAModal(false);
      toast.success("2FA enabled successfully!");
      setVerificationCode("");
    } else {
      toast.error(data.message || "Invalid code");
    }
  };

  // Update Anti-Phishing Code
  const updateAntiPhishing = async () => {
    const res = await fetch(`${API_BASE_URL}/api/user/settings/anti-phishing`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ anti_phishing_code: antiPhishingCode }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Anti-phishing code updated");
    } else {
      toast.error("Failed to update");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account security and preferences</p>
        </div>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Change Password
                </CardTitle>
                <CardDescription>Update your login password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleUpdatePassword} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            {/* 2FA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" /> Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Google Authenticator</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFAEnabled ? "Your account is protected with 2FA" : "Add extra security"}
                    </p>
                  </div>
                  <Switch checked={twoFAEnabled} onCheckedChange={handle2FAToggle} />
                </div>

                {twoFAEnabled && backupKey && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">Backup Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-3 py-2 rounded">
                        {backupKey.match(/.{4}/g)?.join("-")}
                      </code>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(backupKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anti-Phishing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Anti-Phishing Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    value={antiPhishingCode}
                    onChange={(e) => setAntiPhishingCode(e.target.value)}
                    placeholder="e.g. MySecret123"
                    maxLength={20}
                  />
                  <Button onClick={updateAntiPhishing}>Save</Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Verified</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5" />
                    <p className="font-medium">Phone Number</p>
                  </div>
                  <Badge variant="secondary">{user?.phone || "Not added"}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain the same */}
          <TabsContent value="notifications"> {/* Same as before */} </TabsContent>
          <TabsContent value="account"> {/* Same as before */} </TabsContent>
        </Tabs>
      </main>

      {/* 2FA Setup Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <Button size="icon" variant="ghost" className="absolute right-4 top-4" onClick={() => setShow2FAModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with Google Authenticator, Authy, or similar
              </p>
              {qrCodeUrl && (
                <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} className="mx-auto rounded-lg" />
              )}
            </div>
            <div>
              <Label>Or enter this key manually</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 text-center font-mono text-lg tracking-wider bg-muted px-4 py-3 rounded">
                  {backupKey.match(/.{4}/g)?.join(" ")}
                </code>
                <Button size="icon" onClick={() => copyToClipboard(backupKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Enter verification code</Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              <Button onClick={verify2FA} className="w-full mt-4" disabled={verificationCode.length !== 6}>
                Verify & Enable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}