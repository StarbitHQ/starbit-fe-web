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
  QrCode, Loader2, LogOut, Trash2, X, KeyRound, Check, User, Phone, Mail as MailIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface UserSettings {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  two_factor_enabled: boolean;
  anti_phishing_code: string | null;
  transfer_pin: string | null;
  account_bal: number;
  email_verified_at: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Transaction PIN states
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showUpdatePinModal, setShowUpdatePinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  // 2FA states
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupKey, setBackupKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Anti-phishing state
  const [antiPhishingCode, setAntiPhishingCode] = useState("");

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  // PIN status
  const [hasPin, setHasPin] = useState(false);

  const token = Cookies.get("auth_token");

  // Load user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const userData = data.data || data.user || data;
          
          setUser(userData);
          
          // PIN status detection
          const pinStatus = userData.transfer_pin !== null && userData.transfer_pin !== undefined;
          setHasPin(pinStatus);
          
          // 2FA status
          setTwoFAEnabled(userData.two_factor_enabled || false);
          
          // Anti-phishing code
          setAntiPhishingCode(userData.anti_phishing_code || "");
          
          console.log("🔐 Settings loaded:", { 
            transfer_pin: userData.transfer_pin, 
            hasPin: pinStatus,
            two_factor_enabled: userData.two_factor_enabled 
          });
        } else {
          toast.error("Failed to load user settings");
        }
      } catch (err) {
        console.error("Settings fetch error:", err);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  // ========== TRANSACTION PIN FUNCTIONS ==========

  const handleSetPin = async () => {
    if (pin !== confirmPin) {
      toast.error("PINs don't match");
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      toast.error("PIN must be 4-6 digits");
      return;
    }

    if (!/^\d+$/.test(pin)) {
      toast.error("PIN must contain only digits");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/transfer/pin/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pin: pin,
          pin_confirmation: confirmPin,
        }),
      });

      const data = await res.json();

      if (res.ok || data.success) {
        toast.success("✅ Transaction PIN set successfully!");
        setHasPin(true);
        setShowSetPinModal(false);
        setPin("");
        setConfirmPin("");
        
        // Refresh page after short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorMessage = data.message || data.error || "Failed to set PIN";
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("Set PIN error:", err);
      toast.error(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePin = async () => {
    if (newPin !== confirmNewPin) {
      toast.error("New PINs don't match");
      return;
    }

    if (newPin.length < 4 || newPin.length > 6) {
      toast.error("PIN must be 4-6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/transfer/pin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_pin: oldPin,
          new_pin: newPin,
          new_pin_confirmation: confirmNewPin,
        }),
      });

      const data = await res.json();

      if (res.ok || data.success) {
        toast.success("✅ Transaction PIN updated successfully!");
        setShowUpdatePinModal(false);
        setOldPin("");
        setNewPin("");
        setConfirmNewPin("");
      } else {
        toast.error(data.message || "Failed to update PIN");
      }
    } catch (err: any) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== PASSWORD FUNCTIONS ==========
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
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
      if (data.success || res.ok) {
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

  // ========== 2FA FUNCTIONS ==========
  const handle2FAToggle = async () => {
    if (twoFAEnabled) {
      // Disable 2FA
      setIsSubmitting(true);
      try {
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
          toast.success("2FA disabled successfully");
        } else {
          toast.error("Failed to disable 2FA");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Enable 2FA
      setIsSubmitting(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/settings/2fa`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: true }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          setQrCodeUrl(data.data.qr_code);
          setBackupKey(data.data.secret);
          setShow2FAModal(true);
        } else {
          toast.error("Failed to generate 2FA setup");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const verify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/settings/2fa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        setTwoFAEnabled(true);
        setShow2FAModal(false);
        setVerificationCode("");
        toast.success("✅ 2FA enabled successfully!");
      } else {
        toast.error(data.message || "Invalid verification code");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // ========== ANTI-PHISHING ==========
  const updateAntiPhishing = async () => {
    if (!antiPhishingCode.trim()) {
      toast.error("Please enter an anti-phishing code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/settings/anti-phishing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ anti_phishing_code: antiPhishingCode }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        toast.success("Anti-phishing code updated successfully");
      } else {
        toast.error("Failed to update anti-phishing code");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account security and preferences
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user?.username || user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 mb-8">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* ========== SECURITY TAB ========== */}
          <TabsContent value="security" className="space-y-6">
            {/* Transaction PIN - TOP PRIORITY */}
            <Card className={hasPin ? "border-primary/20 bg-primary/5" : "border-amber-500/30 bg-gradient-to-br from-amber-50/80 to-amber-50/50"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Transaction PIN
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {hasPin ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <span>
                    {hasPin 
                      ? "Secure your transfers with PIN protection" 
                      : "Required for transfers, withdrawals & sensitive actions"
                    }
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">PIN Status</p>
                    <p className="text-sm text-muted-foreground">
                      {hasPin 
                        ? "Your account is protected with transaction PIN" 
                        : "No PIN set - transfers are blocked until configured"
                      }
                    </p>
                  </div>
                  <Badge 
                    className={`
                      ${hasPin 
                        ? "bg-green-500/10 text-green-700 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse"
                      }
                      font-semibold
                    `}
                  >
                    {hasPin ? "✅ Enabled" : "⚠️ Not Set"}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {hasPin ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUpdatePinModal(true)}
                      className="gap-2 justify-start"
                    >
                      <Lock className="h-4 w-4" />
                      Change PIN
                    </Button>
                  ) : (
                    <Button 
                      className="col-span-2 bg-gradient-to-r from-primary to-amber-600 
                               hover:from-primary/90 hover:to-amber-600/90 
                               text-primary-foreground shadow-lg hover:shadow-primary/25
                               transition-all duration-300"
                      size="lg"
                      onClick={() => setShowSetPinModal(true)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Set Transaction PIN Now</span>
                    </Button>
                  )}
                </div>

                {!hasPin && (
                  <div className="p-6 bg-gradient-to-r from-amber-500/10 to-amber-600/10 
                                border border-amber-500/20 rounded-xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-0.5">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-1">
                          Action Required
                        </h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          You must set a transaction PIN to:
                          <span className="ml-1 font-medium block">• Send money to other users</span>
                          <span className="ml-1 font-medium block">• Withdraw funds</span>
                          <span className="ml-1 font-medium block">• Perform other sensitive actions</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account login password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add extra security to your account with 2FA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Google Authenticator</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFAEnabled 
                        ? "Your account is protected with 2FA" 
                        : "Add extra layer of security to your account"
                      }
                    </p>
                  </div>
                  <Switch 
                    checked={twoFAEnabled} 
                    onCheckedChange={handle2FAToggle}
                    disabled={isSubmitting}
                  />
                </div>

                {twoFAEnabled && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        2FA is active and protecting your account
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anti-Phishing Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Anti-Phishing Code
                </CardTitle>
                <CardDescription>
                  Helps you identify legitimate emails from our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input
                    value={antiPhishingCode}
                    onChange={(e) => setAntiPhishingCode(e.target.value)}
                    placeholder="Enter your secret code (e.g. MySecret123)"
                    className="flex-1"
                    maxLength={20}
                  />
                  <Button onClick={updateAntiPhishing} disabled={!antiPhishingCode.trim()}>
                    Save Code
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  We'll include this code in all official emails to verify authenticity
                </p>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Verification Status
                </CardTitle>
                <CardDescription>Account verification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MailIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Verified
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone Verification</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                    {user?.phone ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== NOTIFICATIONS TAB ========== */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about important account activity
                      </p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get real-time updates on your mobile device
                      </p>
                    </div>
                    <Switch 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive text messages for critical alerts
                      </p>
                    </div>
                    <Switch 
                      checked={smsNotifications} 
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== ACCOUNT TAB ========== */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      value={user?.username || ""} 
                      disabled 
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      value={user?.email || ""} 
                      disabled 
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      value={user?.phone || ""} 
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <Button className="w-full" disabled>
                  Update Account Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-destructive" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Account deletion and other dangerous actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Trash2 className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-destructive mb-1">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. 
                        This action cannot be undone.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" disabled>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ========== SET PIN MODAL ========== */}
      <Dialog open={showSetPinModal} onOpenChange={setShowSetPinModal}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-blue-600 
                          rounded-full flex items-center justify-center mb-6">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Set Transaction PIN</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a 4-6 digit PIN for secure transactions
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="pin" className="text-sm font-medium">
                  Create your PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPin(value);
                  }}
                  className="text-center text-3xl tracking-widest h-16 bg-background 
                            border-2 border-border focus:border-primary rounded-xl"
                  placeholder="••••••"
                />
                <p className={`text-xs text-center ${
                  pin.length >= 4 ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {pin.length >= 4 ? `✓ ${pin.length} digits entered` : 'Enter 4-6 digits'}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPin" className="text-sm font-medium">
                  Confirm your PIN
                </Label>
                <Input
                  id="confirmPin"
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setConfirmPin(value);
                  }}
                  className={`text-center text-3xl tracking-widest h-16 bg-background 
                            border-2 rounded-xl ${
                              confirmPin && pin && confirmPin !== pin 
                                ? 'border-destructive focus:border-destructive' 
                                : 'border-border focus:border-primary'
                            }`}
                  placeholder="••••••"
                />
                {confirmPin && pin && confirmPin !== pin ? (
                  <p className="text-xs text-destructive text-center">
                    ❌ PINs do not match
                  </p>
                ) : confirmPin && pin && confirmPin === pin ? (
                  <p className="text-xs text-green-600 text-center">
                    ✓ PINs match
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSetPinModal(false);
                  setPin("");
                  setConfirmPin("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-blue-600 
                          hover:from-primary/90 hover:to-blue-600/90"
                disabled={
                  isSubmitting || 
                  pin.length < 4 || 
                  pin !== confirmPin || 
                  !/^\d+$/.test(pin)
                }
                onClick={handleSetPin}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting PIN...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Set PIN
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <p>This PIN will protect your transfers and withdrawals</p>
              <p className="mt-1 font-medium">Keep it safe and don't share it with anyone</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== UPDATE PIN MODAL ========== */}
      <Dialog open={showUpdatePinModal} onOpenChange={setShowUpdatePinModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Update Transaction PIN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPin">Current PIN</Label>
                <Input
                  id="oldPin"
                  type="password"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-widest"
                  placeholder="••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPin">New PIN (4-6 digits)</Label>
                <Input
                  id="newPin"
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-widest"
                  placeholder="••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPin">Confirm New PIN</Label>
                <Input
                  id="confirmNewPin"
                  type="password"
                  maxLength={6}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-widest"
                  placeholder="••••"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowUpdatePinModal(false);
                  setOldPin("");
                  setNewPin("");
                  setConfirmNewPin("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdatePin}
                disabled={isSubmitting || newPin.length < 4 || newPin !== confirmNewPin}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update PIN
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== 2FA SETUP MODAL ========== */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute right-4 top-4" 
              onClick={() => setShow2FAModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with Google Authenticator, Authy, or similar
              </p>
              {qrCodeUrl && (
                <Image 
                  src={qrCodeUrl} 
                  alt="2FA QR Code" 
                  width={200} 
                  height={200} 
                  className="mx-auto rounded-lg border" 
                />
              )}
            </div>
            <div>
              <Label>Or enter this key manually</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 text-center font-mono text-lg tracking-wider 
                               bg-muted px-4 py-3 rounded">
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
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-widest mt-2"
              />
              <Button 
                onClick={verify2FA} 
                className="w-full mt-4" 
                disabled={verificationCode.length !== 6}
              >
                Verify & Enable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}