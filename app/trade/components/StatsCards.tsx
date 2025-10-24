import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Activity, Wallet, CheckCircle2 } from "lucide-react";
import { PortfolioSummary } from "@/lib/types";

interface StatsCardsProps {
  summary: PortfolioSummary | null;
}

export function StatsCards({ summary }: StatsCardsProps) {
  const displayStats = [
    {
      label: "Active Trades",
      value: summary?.active_trades_count || 0,
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Total Invested",
      value: summary ? `$${summary.total_invested}` : "$0.00",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Wallet Balance",
      value: summary ? `$${summary.wallet_balance}` : "$0.00",
      icon: Wallet,
      color: "text-blue-500",
    },
    {
      label: "Completed Trades",
      value: summary?.completed_trades_count || 0,
      icon: CheckCircle2,
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {displayStats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
