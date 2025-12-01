"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, CheckCircle2 } from "lucide-react";

interface User {
  email: string;
  email_verified_at: string | null;
  phone: string | null;
}

interface VerificationStatusCardProps {
  user: User | null;
}

export function VerificationStatusCard({ user }: VerificationStatusCardProps) {
  const emailVerified = !!user?.email_verified_at;
  const hasPhone = !!user?.phone;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Verification Status
        </CardTitle>
        <CardDescription>Your account verification details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            Verified
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone Number</p>
              <p className="text-sm text-muted-foreground">
                {hasPhone ? user.phone : "Not added"}
              </p>
            </div>
          </div>
          <Badge
            variant={hasPhone ? "default" : "secondary"}
            className={
              hasPhone
                ? "bg-green-500/10 text-green-700 border-green-500/20"
                : "bg-orange-500/10 text-orange-700 border-orange-500/20"
            }
          >
            {hasPhone ? "Verified" : "Not Verified"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}