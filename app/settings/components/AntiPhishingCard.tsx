"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AntiPhishingCardProps {
  initialCode: string;
  token: string | undefined;
}

export function AntiPhishingCard({ initialCode, token }: AntiPhishingCardProps) {
  const [code, setCode] = useState(initialCode || "");
  const [isSaving, setIsSaving] = useState(false);

  const saveCode = async () => {
    if (!code.trim()) return toast.error("Please enter a code");

    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/settings/anti-phishing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ anti_phishing_code: code.trim() }),
      });

      if (res.ok) {
        toast.success("Anti-phishing code updated!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Anti-Phishing Code
        </CardTitle>
        <CardDescription>
          This code appears in all legitimate emails from us — helps you spot fake ones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MySecret123 or ilovepizza"
            maxLength={30}
            className="flex-1"
          />
          <Button 
            onClick={saveCode} 
            disabled={isSaving || !code.trim() || code === initialCode}
          >
            {isSaving ? "Saving..." : "Save Code"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          We’ll include <span className="font-bold text-foreground">“{code || 'your code'}”</span> in every official email.
        </p>
      </CardContent>
    </Card>
  );
}