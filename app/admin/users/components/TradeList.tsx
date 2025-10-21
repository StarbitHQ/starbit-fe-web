import { TrendingUp, TrendingDown } from "lucide-react";
import type { Trade } from "../types/user";

interface Props {
  trades: Trade[];
}

export const TradeList = ({ trades }: Props) => {
  if (trades.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No trades yet</p>;
  }

  const displayed = trades.slice(0, 10);

  return (
    <div className="space-y-3">
      {displayed.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                t.type === "buy" ? "bg-green-500/10" : "bg-red-500/10"
              }`}
            >
              {t.type === "buy" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {t.type.toUpperCase()} {t.pair}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.amount} @ {t.price}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-semibold text-foreground">{t.total}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(t.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}

      {trades.length > 10 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          Showing 10 of {trades.length} trades
        </p>
      )}
    </div>
  );
};