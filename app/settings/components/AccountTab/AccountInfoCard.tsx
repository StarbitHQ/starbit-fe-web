"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone } from "lucide-react";

interface AccountInfoCardProps {
  user: {
    name?: string;
    username: string;
    email: string;
    phone: string | null;
  } | null;
}

export function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
        <CardDescription>View and update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={user?.name || "—"} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username || ""} disabled className="bg-muted/50" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user?.email || ""} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={user?.phone || ""}
              placeholder="+1 (555) 000-0000"
              className="bg-background"
            />
          </div>
        </div>

        <Button className="w-full" disabled>
          Save Changes
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Contact support to change username or email
        </p>
      </CardContent>
    </Card>
  );
}