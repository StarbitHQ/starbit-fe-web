"use client";

import { NavHeader } from "@/components/nav-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

// Components
import { SettingsHeader } from "./components/SettingHeader";
import { TransactionPinCard } from "./components/TransactionPinCard";
import { ChangePasswordCard } from "./components/ChangePasswordCard";
import { TwoFactorCard } from "./components/TwoFactorCard";
import { AntiPhishingCard } from "./components/AntiPhishingCard";
import { VerificationStatusCard } from "./components/VerificationStatusCard";
import { NotificationPreferencesCard } from "./components/NotificationsTab/NotificationPreferencesCard";
import { AccountInfoCard } from "./components/AccountTab/AccountInfoCard";
import { DangerZoneCard } from "./components/AccountTab/DangerZoneCard";

// Modals
import { SetPinModal } from "./components/modals/SetPinModal";
import { UpdatePinModal } from "./components/modals/UpdatePinModal";
import { Enable2FAModal } from "./components/modals/Enable2FAModal";

import { Loader2, Shield, Bell, User } from "lucide-react";

interface UserSettings {
  id: number;
  name?: string;
  username: string;
  email: string;
  phone: string | null;
  two_factor_enabled: boolean;
  anti_phishing_code: string | null;
  transfer_pin: string | null;
  email_verified_at: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PIN States
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  // 2FA States
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupKey, setBackupKey] = useState("");

  // Modal States
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showUpdatePinModal, setShowUpdatePinModal] = useState(false);

  const token = Cookies.get("auth_token");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const userData = data.data || data.user || data;

          setUser(userData);
          setHasPin(!!userData.transfer_pin);
          setTwoFAEnabled(userData.two_factor_enabled || false);
        } else {
          toast.error("Failed to load settings");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // PIN Handlers
  const handleSetPin = async () => {
    if (pin !== confirmPin) return toast.error("PINs don't match");
    if (pin.length < 4 || pin.length > 6) return toast.error("PIN must be 4–6 digits");
    if (!/^\d+$/.test(pin)) return toast.error("PIN must contain only digits");

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/transfer/pin/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin, pin_confirmation: confirmPin }),
      });

      if (res.ok) {
        toast.success("Transaction PIN set successfully!");
        setHasPin(true);
        setShowSetPinModal(false);
        setPin("");
        setConfirmPin("");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const d = await res.json();
        toast.error(d.message || "Failed to set PIN");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePin = async () => {
    if (newPin !== confirmNewPin) return toast.error("New PINs don't match");
    if (newPin.length < 4 || newPin.length > 6) return toast.error("PIN must be 4–6 digits");
    if (!/^\d+$/.test(newPin)) return toast.error("PIN must contain only digits");

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

      if (res.ok) {
        toast.success("PIN updated successfully!");
        setShowUpdatePinModal(false);
        setOldPin("");
        setNewPin("");
        setConfirmNewPin("");
      } else {
        const d = await res.json();
        toast.error(d.message || "Failed to update PIN");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
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
        <SettingsHeader username={user?.username} email={user?.email} />

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 mb-8">
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-6">
            <TransactionPinCard
              hasPin={hasPin}
              onSetPin={() => setShowSetPinModal(true)}
              onUpdatePin={() => setShowUpdatePinModal(true)}
            />
            {/* <ChangePasswordCard token={token} /> */}
            <TwoFactorCard
              enabled={twoFAEnabled}
              token={token}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onEnable={(qr, secret) => {
                setQrCodeUrl(qr);
                setBackupKey(secret);
                setShow2FAModal(true);
              }}
              onDisable={() => setTwoFAEnabled(false)}
            />
            <AntiPhishingCard initialCode={user?.anti_phishing_code || ""} token={token} />
            <VerificationStatusCard user={user} />
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications">
            <NotificationPreferencesCard />
          </TabsContent>

          {/* ACCOUNT TAB */}
          <TabsContent value="account" className="space-y-6">
            <AccountInfoCard user={user} />
            <DangerZoneCard />
          </TabsContent>
        </Tabs>
      </main>

      {/* MODALS */}
      <SetPinModal
        open={showSetPinModal}
        onOpenChange={setShowSetPinModal}
        pin={pin}
        confirmPin={confirmPin}
        isSubmitting={isSubmitting}
        onPinChange={setPin}
        onConfirmPinChange={setConfirmPin}
        onSubmit={handleSetPin}
      />

      <UpdatePinModal
        open={showUpdatePinModal}
        onOpenChange={setShowUpdatePinModal}
        oldPin={oldPin}
        newPin={newPin}
        confirmNewPin={confirmNewPin}
        isSubmitting={isSubmitting}
        onOldPinChange={setOldPin}
        onNewPinChange={setNewPin}
        onConfirmNewPinChange={setConfirmNewPin}
        onSubmit={handleUpdatePin}
      />

      <Enable2FAModal
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        qrCodeUrl={qrCodeUrl}
        backupKey={backupKey}
        token={token}
        onSuccess={() => setTwoFAEnabled(true)}
      />
    </div>
  );
}