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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getStatusBadge, getKycBadge } from "../utils/badge";
import { ReferralInfo } from "./ReferralInfo";
import { ReferralList } from "./ReferralList";
import { TradeList } from "./TradeList";
import { QuickActions } from "./QuickActions";
import type { UserDetail } from "../types/user";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserDetail | null;
  onStatusChange: (id: number, status: string) => void;
  onViewUser: (id: number) => void;
}

export const UserDetailsDialog = ({
  open,
  onOpenChange,
  user,
  onStatusChange,
  onViewUser,
}: Props) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">{user.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            User ID: {user.id} • Member since {new Date(user.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Balance", value: user.balance },
              { label: "Total Trades", value: user.total_trades },
              { label: "Volume", value: user.total_volume },
              { label: "Referrals", value: user.referral_count },
            ].map((s) => (
              <Card key={s.label} className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User info */}
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="text-foreground">User Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground font-medium">{user.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
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
                  <Badge className={getKycBadge(user.kyc_status)}>{user.kyc_status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Verified</p>
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

          <ReferralInfo user={user} onView={onViewUser} />

          {/* Tabs */}
          <Tabs defaultValue="referrals" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="referrals">
                Referrals ({user.referrals.length})
              </TabsTrigger>
              <TabsTrigger value="trades">
                Trading History ({user.trades.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="referrals">
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-4">
                  <ReferralList referrals={user.referrals} onView={onViewUser} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trades">
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-4">
                  <TradeList trades={user.trades} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <QuickActions />
        </div>
      </DialogContent>
    </Dialog>
  );
};