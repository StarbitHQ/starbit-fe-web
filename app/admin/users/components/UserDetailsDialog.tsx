import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getStatusBadge, getKycBadge } from "../utils/badge";
import { ReferralInfo } from "./ReferralInfo";
import { ReferralList } from "./ReferralList";
import { TradeList } from "./TradeList";
import { QuickActions } from "./QuickActions";
import type { UserDetail } from "../types/user";
import { useCallback } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserDetail | null;
  /** Called when the admin changes the user status from the dropdown */
  onStatusChange: (id: number, status: string) => void;
  /** Called when the admin clicks “View” on a referral */
  onViewUser: (id: number) => void;
  /** Called after any mutation that changes the user (balance, suspend, promote…) */
  refetchUser?: () => void;
}

export const UserDetailsDialog = ({
  open,
  onOpenChange,
  user,
  onStatusChange,
  onViewUser,
  refetchUser,
}: Props) => {
  // Guard – nothing to render if no user
  if (!user) return null;

  // Stable callback for QuickActions
  const handleUserUpdate = useCallback(() => {
    refetchUser?.();
  }, [refetchUser]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">
            {user.name}
            {user.admin && (
              <Badge variant="outline" className="ml-2 text-xs">
                {user.admin.role_label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            User ID: {user.id} • Member since{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick stats */}
          {/* Quick stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Balance", value: `$${user.account_bal}` },
              {
                label: "Total Deposits",
                value: `$${Number(user.total_deposits ?? 0).toLocaleString()}`,
              },
              {
                label: "Total Withdrawals",
                value: `$${Number(
                  user.total_withdrawals ?? 0
                ).toLocaleString()}`,
              },
              { label: "Total Trades", value: user.trades?.total_count ?? 0 },
              {
                label: "Volume",
                value: `$${Number(
                  user.trades?.total_invested ?? 0
                ).toLocaleString()}`,
              },
              { label: "Referrals", value: user.referrals?.total_count ?? 0 },
            ].map((s) => (
              <Card key={s.label} className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {s.label}
                  </p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* User info */}
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground font-medium">
                    {user.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusBadge(user.status)}>
                      {user.status}
                    </Badge>
                    <Select
                      value={user.status}
                      onValueChange={(v) => onStatusChange(user.id, v)}
                    >
                      <SelectTrigger className="w-[130px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <Badge className={getKycBadge(user.kyc_status)}>
                    {user.kyc_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Email Verified
                  </p>
                  <Badge
                    className={
                      user.email_verified
                        ? "bg-green-500/10 text-green-500"
                        : "bg-gray-500/10 text-gray-500"
                    }
                  >
                    {user.email_verified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">2FA Enabled</p>
                  <Badge
                    className={
                      user.two_factor_enabled
                        ? "bg-green-500/10 text-green-500"
                        : "bg-gray-500/10 text-gray-500"
                    }
                  >
                    {user.two_factor_enabled ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <QuickActions
            userId={user.id}
            currentBalance={user.account_bal}
            isAdmin={user.type === "admin"}
            onUserUpdate={handleUserUpdate}
          />

          {/* Referral Summary */}
          <ReferralInfo user={user} onView={onViewUser} />
          {/* Tabs */}
          <Tabs defaultValue="referrals" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="referrals">
                Referrals ({user.referrals?.total_count ?? 0})
              </TabsTrigger>
              <TabsTrigger value="trades">
                Trading History ({user.trades?.total_count ?? 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="referrals">
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-4">
                  <ReferralList user={user} onView={onViewUser} />{" "}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trades">
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-4">
                  <TradeList trades={user.trades?.trades ?? []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
