// components/StatsCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, CheckCircle, Ban } from "lucide-react";

interface Props {
  stats: {
    total_users: number;
    verified_users: number;
    active_users?: number;
    suspended_users?: number;
  } | null;
  loading?: boolean;
}

export const StatsCards = ({ stats, loading }: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Users</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.total_users ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Active Users</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.active_users ?? stats?.total_users ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <UserCheck className="h-6 w-6 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">KYC Verified</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.verified_users ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10">
            <CheckCircle className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Suspended</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.suspended_users ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <Ban className="h-6 w-6 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};