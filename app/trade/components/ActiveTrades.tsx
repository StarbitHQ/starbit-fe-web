import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, XCircle } from "lucide-react";
import { Trade } from "../lib/types";
import { API_BASE_URL } from "@/lib/api";
import { getCookie } from "../lib/utils";
import { TradeCard } from "./TradeCard";

interface ActiveTradesProps {
  activeTrades: Trade[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  fetchData: () => Promise<void>;
}

export function ActiveTrades({
  activeTrades,
  loading,
  currentPage,
  totalPages,
  setCurrentPage,
  fetchData,
}: ActiveTradesProps) {
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = getCookie("auth_token");
    if (!token)
      throw new Error("No authentication token found. Please log in.");
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  };

  const handleCancelTrade = async (tradeId: number) => {
    if (!confirm("Are you sure you want to cancel this trade?")) return;
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/trades/${tradeId}/cancel`,
        {
          method: "POST",
          headers,
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel trade");
      }
      const responseData = await response.json();
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Trade cancelled successfully",
          className: "bg-primary text-primary-foreground",
        });
        await fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel trade",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getProgress = (trade: Trade) => {
    if (trade.status !== "active") return 0;
    const startedAt = new Date(trade.started_at);
    const endsAt = new Date(trade.ends_at);
    const now = new Date();
    if (now < startedAt) return 0;
    if (now > endsAt) return 100;
    const total = endsAt.getTime() - startedAt.getTime();
    const elapsed = now.getTime() - startedAt.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <Card className="lg:col-span-2 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Active Trades ({activeTrades.length})
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your ongoing investments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">
            Loading active trades...
          </p>
        ) : activeTrades.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active trades yet.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {activeTrades.map((trade) =>
                
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    getProgress={getProgress}
                    handleCancelTrade={handleCancelTrade}
                    showCancelButton={trade.status !== "completed"}
                  />
                
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
