import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { XCircle } from "lucide-react";
import { Trade } from "../lib/types";

interface TradeCardProps {
  trade: Trade;
  getProgress: (trade: Trade) => number;
  handleCancelTrade?: (tradeId: number) => void;
  showCancelButton?: boolean;
}

export function TradeCard({ trade, getProgress, handleCancelTrade, showCancelButton }: TradeCardProps) {
  // Debug log to verify data
  console.log("TradeCard Data:", trade);

  // Fallback for tradingPair if missing
  const tradingPair = trade.tradingPair || { base_name: "Unknown Pair", base_symbol: "N/A", quote_symbol: "N/A", investment_duration: 0, base_icon_url: null };

  // Validate and construct a valid image URL
  const isValidUrl = (url: string | null) => url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));
  const iconUrl = isValidUrl(tradingPair.base_icon_url) ? tradingPair.base_icon_url : "/placeholder-icon.png";

  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={iconUrl}
            alt={tradingPair.base_symbol}
            className="h-8 w-8 rounded-full"
            // onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-icon.png"; }} // Fallback image
          />
          <div>
            <p className="font-semibold text-foreground">
              {tradingPair.base_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {tradingPair.base_symbol}/{tradingPair.quote_symbol}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1 flex items-center gap-3">
          <div>
            <p className="font-semibold text-foreground">
              ${trade.investment_amount}
            </p>
            
          </div>
          <Badge
            variant={trade.status === "active" ? "default" : "secondary"}
            className={
              trade.status === "active"
                ? "bg-primary/10 text-primary"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
          </Badge>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
        {/* <p>Progress: {Math.round(getProgress(trade))}%</p> */}
        <p>Duration: {tradingPair.investment_duration} days</p>
        <p>Started: {new Date(trade.started_at).toLocaleDateString()}</p>
        <p>Ends: {new Date(trade.ends_at).toLocaleDateString()}</p>
      </div>
      {/* {showCancelButton && handleCancelTrade && (
        <Button
          variant="destructive"
          size="sm"
          className="mt-3 w-full"
          onClick={() => handleCancelTrade(trade.id)}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Trade
        </Button>
      )} */}
      {/* <Progress value={getProgress(trade)} className="mt-2" /> */}
    </div>
  );
}