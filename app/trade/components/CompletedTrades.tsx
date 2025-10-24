import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Trade } from "@/lib/types";
import { TradeCard } from "./TradeCard";

interface CompletedTradesProps {
  completedTrades: Trade[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function CompletedTrades({
  completedTrades,
  currentPage,
  totalPages,
  setCurrentPage,
}: CompletedTradesProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getProgress = () => 100; // Completed trades always have 100% progress

  return (
    <Card className="mt-6 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Completed Trades
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your completed investments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {completedTrades.map((trade) =>
            trade.tradingPair ? (
              <div key={trade.id} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {trade.tradingPair.base_icon_url ? (
                      <img
                        src={trade.tradingPair.base_icon_url}
                        alt={trade.tradingPair.base_symbol}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {trade.tradingPair.base_symbol[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {trade.tradingPair.base_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trade.tradingPair.base_symbol}/{trade.tradingPair.quote_symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-foreground">
                      ${trade.investment_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-500">
                      Returned: ${trade.expected_return.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                  <p>Invested: ${trade.investment_amount.toFixed(2)}</p>
                  <p>Profit: ${(trade.expected_return - trade.investment_amount).toFixed(2)}</p>
                  <p>Completed: {new Date(trade.completed_at!).toLocaleDateString()}</p>
                  <p>Duration: {trade.tradingPair.investment_duration} days</p>
                </div>
              </div>
            ) : null
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="bg-transparent"
            >
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="bg-transparent"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}