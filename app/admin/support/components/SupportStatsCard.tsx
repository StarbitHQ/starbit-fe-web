import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  stats: {
    total_tickets: number;
    open_tickets: number;
    closed_tickets: number;
  } | null;
  loading?: boolean;
}

export const SupportStatsCards = ({ stats, loading }: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.total_tickets ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.open_tickets ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Closed Tickets</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? "Loading..." : stats?.closed_tickets ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};