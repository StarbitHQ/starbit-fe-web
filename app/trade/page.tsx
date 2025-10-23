"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NavHeader } from "@/components/nav-header";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  History,
  Settings,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

// Utility function to get cookie by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

interface TradingPair {
  id: number;
  coingecko_id: string;
  base_symbol: string;
  base_name: string;
  quote_symbol: string;
  base_icon_url: string | null;
  min_investment: number;
  max_investment: number;
  min_return_percentage: number;
  max_return_percentage: number;
  investment_duration: number;
}

interface Trade {
  id: number;
  trading_pair_id: number;
  investment_amount: number;
  expected_return: number;
  status: "pending" | "active" | "completed" | "cancelled";
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  created_at: string;
  tradingPair?: TradingPair;
}

interface PortfolioSummary {
  active_trades_count: number;
  total_invested: number;
  total_expected_return: number;
  active_investment: number;
  completed_trades_count: number;
  total_returned: number;
  wallet_balance: number;
}

interface FormData {
  trading_pair_id: number;
  investment_amount: number;
}

export default function TradingDashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [availablePairs, setAvailablePairs] = useState<TradingPair[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tradesPerPage = 6;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const investmentAmount = watch("investment_amount");

  useEffect(() => {
    // Fetch user data from cookies
    const userData = getCookie("user_data");
    console.log("Raw user_data cookie:", userData);
    if (userData) {
      try {
        // Try decoding as URL-encoded and base64-encoded
        let decodedUserData = userData;
        try {
          decodedUserData = decodeURIComponent(userData);
          console.log("URL-decoded user_data:", decodedUserData);
        } catch (decodeError) {
          console.warn("URL decoding failed:", decodeError);
        }

        // Try parsing as JSON
        try {
          const parsedUser = JSON.parse(decodedUserData);
          setUser(parsedUser);
          console.log("Parsed user data:", parsedUser);
        } catch (jsonError) {
          // If JSON parsing fails, try base64 decoding
          try {
            const base64Decoded = atob(decodedUserData);
            const parsedBase64 = JSON.parse(base64Decoded);
            setUser(parsedBase64);
            console.log("Base64-decoded and parsed user data:", parsedBase64);
          } catch (base64Error) {
            console.error("Base64 decoding failed:", base64Error);
            throw new Error("Invalid user data format");
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast({
          title: "Error",
          description: "Failed to parse user data. Please re-authenticate.",
          variant: "destructive",
        });
      }
    } else {
      console.warn("No user_data cookie found");
      toast({
        title: "Warning",
        description: "No user data found. Please log in.",
        variant: "destructive",
      });
      // Optionally redirect to login
      // window.location.href = "/login";
    }

    fetchData();
  }, [currentPage]);

  const getAuthHeaders = () => {
    const token = getCookie("auth_token");
    console.log("auth_token:", token);
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      // Fetch trading pairs
      let pairsData: any = { data: [] };
      try {
        const pairsRes = await fetch(
          `${API_BASE_URL}/api/trading-pairs/available`,
          { headers }
        );
        console.log("Trading Pairs Response Status:", pairsRes.status);
        if (!pairsRes.ok) {
          const errorData = await pairsRes.json();
          console.error("Trading Pairs Error Response:", errorData);
          throw new Error(
            errorData.error ||
              `Failed to fetch trading pairs: ${pairsRes.status}`
          );
        }
        pairsData = await pairsRes.json();
        console.log("Raw Trading Pairs Data:", pairsData);
      } catch (error) {
        console.error("Trading Pairs Fetch Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch trading pairs",
          variant: "destructive",
        });
      }

      // Fetch trades
      let tradesData: any = { data: [], meta: { last_page: 1 } };
      try {
        const tradesRes = await fetch(
          `${API_BASE_URL}/api/trades?page=${currentPage}&per_page=${tradesPerPage}`,
          { headers }
        );
        console.log("Trades Response Status:", tradesRes.status);
        if (!tradesRes.ok) {
          const errorData = await tradesRes.json();
          console.error("Trades Error Response:", errorData);
          throw new Error(
            errorData.error || `Failed to fetch trades: ${tradesRes.status}`
          );
        }
        tradesData = await tradesRes.json();
        console.log("Raw Trades Data:", tradesData);
      } catch (error) {
        console.error("Trades Fetch Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch trades",
          variant: "destructive",
        });
        // Continue to set other data even if trades fail
      }

      // Fetch summary
      let summaryData: any = { data: null };
      try {
        const summaryRes = await fetch(`${API_BASE_URL}/api/trades/summary`, {
          headers,
        });
        console.log("Summary Response Status:", summaryRes.status);
        if (!summaryRes.ok) {
          const errorData = await summaryRes.json();
          console.error("Summary Error Response:", errorData);
          throw new Error(
            errorData.error || `Failed to fetch summary: ${summaryRes.status}`
          );
        }
        summaryData = await summaryRes.json();
        console.log("Raw Summary Data:", summaryData);
      } catch (error) {
        console.error("Summary Fetch Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch summary",
          variant: "destructive",
        });
        // Continue to set other data
      }

      // Fetch wallet balance
      let walletData: any = { balance: 0 };
      try {
        const walletRes = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
          headers,
        });
        console.log("Wallet Balance Response Status:", walletRes.status);
        if (!walletRes.ok) {
          const errorData = await walletRes.json();
          console.error("Wallet Balance Error Response:", errorData);
          throw new Error(
            errorData.error || `Failed to fetch wallet balance: ${walletRes.status}`
          );
        }
        walletData = await walletRes.json();
        console.log("Raw Wallet Balance Data:", walletData);
      } catch (error) {
        console.error("Wallet Balance Fetch Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch wallet balance",
          variant: "destructive",
        });
        // Continue to set other data
      }

      // Convert string values to numbers for trading pairs
      const parsedPairs = (pairsData.data || []).map((pair: any) => ({
        ...pair,
        min_investment: parseFloat(pair.min_investment),
        max_investment: parseFloat(pair.max_investment),
        min_return_percentage: parseFloat(pair.min_return_percentage),
        max_return_percentage: parseFloat(pair.max_return_percentage),
      }));

      // Debug the parsed data
      console.log("Parsed Trading Pairs:", parsedPairs);
      console.log("Parsed Trades Data:", tradesData);
      console.log("Parsed Summary Data:", summaryData);
      console.log("Parsed Wallet Balance:", walletData);

      setAvailablePairs(parsedPairs);
      setActiveTrades(
        tradesData.data?.filter(
          (trade: Trade) =>
            trade.status === "active" || trade.status === "pending"
        ) || []
      );
      setCompletedTrades(
        tradesData.data?.filter(
          (trade: Trade) => trade.status === "completed"
        ) || []
      );
      setSummary({
        ...summaryData.data,
        wallet_balance: walletData.balance || 0,
      });
      setTotalPages(tradesData.meta?.last_page || 1);
    } catch (error: any) {
      console.error("Fetch Data Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load trading data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const headers = getAuthHeaders();
      console.log("Submitting trade with headers:", headers);
      const response = await fetch(`${API_BASE_URL}/api/trades`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      console.log("Trade Submission Response Status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Trade Submission Error Response:", errorData);
        throw new Error(errorData.error || "Failed to start trade");
      }

      const responseData = await response.json();
      console.log("Trade Submission Response:", responseData);
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Trade started successfully!",
          className: "bg-primary text-primary-foreground",
        });
        reset();
        setSelectedPair(null);
        await fetchData();
      }
    } catch (error: any) {
      console.error("Submit Trade Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start trade",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTrade = async (tradeId: number) => {
    if (!confirm("Are you sure you want to cancel this trade?")) return;

    try {
      const headers = getAuthHeaders();
      console.log("Cancelling trade with headers:", headers);
      const response = await fetch(
        `${API_BASE_URL}/api/trades/${tradeId}/cancel`,
        {
          method: "POST",
          headers,
        }
      );

      console.log("Trade Cancel Response Status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Trade Cancel Error Response:", errorData);
        throw new Error(errorData.error || "Failed to cancel trade");
      }

      const responseData = await response.json();
      console.log("Trade Cancel Response:", responseData);
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Trade cancelled successfully",
          className: "bg-primary text-primary-foreground",
        });
        await fetchData();
      }
    } catch (error: any) {
      console.error("Cancel Trade Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel trade",
        variant: "destructive",
      });
    }
  };

  const handleSelectPair = (pair: TradingPair) => {
    setSelectedPair(pair);
    setValue("trading_pair_id", pair.id);
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

  // Stats for the dashboard
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

  // Debug availablePairs state
  useEffect(() => {
    console.log("Available Pairs State:", availablePairs);
  }, [availablePairs]);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground">
            Manage your investments and track your portfolio
          </p>
        </div>

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
                  <div className={`p-3 rounded-lg bg-muted`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Start New Trade
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose a trading pair to invest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-4">
                  Loading trading pairs...
                </p>
              ) : availablePairs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No active trading pairs available.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availablePairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectPair(pair)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {pair.base_icon_url ? (
                            <img
                              src={pair.base_icon_url}
                              alt={pair.base_symbol}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {pair.base_symbol[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">
                              {pair.base_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {pair.base_symbol}/{pair.quote_symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ${pair.min_investment.toFixed(2)} - $
                            {pair.max_investment.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pair.investment_duration} days
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedPair && (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-2">
                    <Label className="text-foreground">Selected Pair</Label>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {selectedPair.base_icon_url ? (
                        <img
                          src={selectedPair.base_icon_url}
                          alt={selectedPair.base_symbol}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {selectedPair.base_symbol[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {selectedPair.base_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPair.base_symbol}/{selectedPair.quote_symbol}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="investment_amount"
                      className="text-foreground"
                    >
                      Investment Amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="investment_amount"
                        type="number"
                        step="0.01"
                        placeholder={`Min: ${selectedPair.min_investment.toFixed(
                          2
                        )}`}
                        className="pl-10 bg-background border-input text-foreground"
                        {...register("investment_amount", {
                          required: "Investment amount is required",
                          min: {
                            value: selectedPair.min_investment,
                            message: `Minimum investment is ${selectedPair.min_investment.toFixed(
                              2
                            )}`,
                          },
                          max: {
                            value: selectedPair.max_investment,
                            message: `Maximum investment is ${selectedPair.max_investment.toFixed(
                              2
                            )}`,
                          },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.investment_amount && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.investment_amount.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {investmentAmount && selectedPair && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Duration: {selectedPair.investment_duration} day
                        {selectedPair.investment_duration !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expected Return: $
                        {(
                          investmentAmount *
                          (selectedPair.min_return_percentage / 100)
                        ).toFixed(2)}{" "}
                        - $
                        {(
                          investmentAmount *
                          (selectedPair.max_return_percentage / 100)
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent text-sm h-8 px-3 py-1 rounded-md border-muted-foreground/20 hover:bg-muted/30 transition-colors"
                      onClick={() => {
                        setSelectedPair(null);
                        reset();
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-8 px-3 py-1 gap-1 rounded-md transition-colors"
                      disabled={submitting || !investmentAmount}
                    >
                      <DollarSign className="h-3 w-3" />
                      {submitting ? "Starting..." : "Start Trade"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

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
                    {activeTrades.map((trade) => {
                      // Add safety check for tradingPair
                      if (!trade.tradingPair) {
                        console.warn(`Trade ${trade.id} missing tradingPair data`);
                        return null;
                      }

                      return (
                        <div
                          key={trade.id}
                          className="p-4 rounded-lg bg-muted/50"
                        >
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
                                  {trade.tradingPair.base_symbol}/
                                  {trade.tradingPair.quote_symbol}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-1 flex items-center gap-3">
                              <div>
                                <p className="font-semibold text-foreground">
                                  ${trade.investment_amount.toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expected: ${trade.expected_return.toFixed(2)}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  trade.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  trade.status === "active"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {trade.status.charAt(0).toUpperCase() +
                                  trade.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <p>Progress: {Math.round(getProgress(trade))}%</p>
                            <p>
                              Duration: {trade.tradingPair.investment_duration}{" "}
                              days
                            </p>
                            <p>
                              Started:{" "}
                              {new Date(trade.started_at).toLocaleDateString()}
                            </p>
                            <p>
                              Ends: {new Date(trade.ends_at).toLocaleDateString()}
                            </p>
                          </div>
                          {trade.status !== "completed" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-3 w-full"
                              onClick={() => handleCancelTrade(trade.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Trade
                            </Button>
                          )}
                          <Progress value={getProgress(trade)} className="mt-2" />
                        </div>
                      );
                    })}
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

          <Card className="lg:col-span-3 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Navigate to key features
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link href="/dashboard/portfolio">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <Wallet className="h-4 w-4 text-primary" />
                  View Portfolio
                </Button>
              </Link>
              <Link href="/dashboard/trade-history">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <History className="h-4 w-4 text-secondary" />
                  Trade History
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <Settings className="h-4 w-4 text-primary" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {completedTrades.length > 0 && (
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
                {completedTrades.map((trade) => {
                  // Add safety check for tradingPair
                  if (!trade.tradingPair) {
                    console.warn(`Trade ${trade.id} missing tradingPair data`);
                    return null;
                  }

                  return (
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
                              {trade.tradingPair.base_symbol}/
                              {trade.tradingPair.quote_symbol}
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
                        <p>
                          Profit: $
                          {(
                            trade.expected_return - trade.investment_amount
                          ).toFixed(2)}
                        </p>
                        <p>
                          Completed:{" "}
                          {new Date(trade.completed_at!).toLocaleDateString()}
                        </p>
                        <p>
                          Duration: {trade.tradingPair.investment_duration} days
                        </p>
                      </div>
                    </div>
                  );
                })}
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
        )}
      </main>
    </div>
  );
}