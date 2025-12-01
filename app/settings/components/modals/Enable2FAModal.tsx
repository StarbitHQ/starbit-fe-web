"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface Enable2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUrl: string;
  backupKey: string;
  token: string | undefined;
  onSuccess: () => void;
}

export function Enable2FAModal({
  open,
  onOpenChange,
  qrCodeUrl,
  backupKey,
  token,
  onSuccess,
}: Enable2FAModalProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(backupKey);
    toast.success("Backup key copied!");
  };

  const verifyCode = async () => {
    if (code.length !== 6) return toast.error("Enter 6-digit code");

    setVerifying(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/2fa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        toast.success("2FA enabled successfully!");
        onSuccess();
        onOpenChange(false);
        setCode("");
      } else {
        toast.error(data.message || "Invalid code");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Scan with Google Authenticator, Authy, Microsoft Authenticator, etc.
            </p>
            {qrCodeUrl && (
              <Image
                src={qrCodeUrl}
                alt="2FA QR Code"
                width={220}
                height={220}
                className="mx-auto rounded-lg border shadow-lg"
              />
            )}
          </div>

          <div>
            <Label>Or enter this key manually</Label>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 font-mono text-center bg-muted px-4 py-3 rounded-lg text-lg tracking-wider">
                {backupKey.match(/.{4}/g)?.join(" ") || backupKey}
              </code>
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="code">Enter 6-digit code from app</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
            <Button
              className="w-full"
              onClick={verifyCode}
              disabled={verifying || code.length !== 6}
            >
              {verifying ? (
                <>Verifying...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Verify & Enable 2FA
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}