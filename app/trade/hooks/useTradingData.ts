import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TradingPair, Trade, PortfolioSummary } from "../lib/types";
import { API_BASE_URL } from "@/lib/api";
import { getCookie } from "../lib/utils";

export function useTradingData() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [availablePairs, setAvailablePairs] = useState<TradingPair[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tradesPerPage = 6;

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
        if (!pairsRes.ok) {
          const errorData = await pairsRes.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch trading pairs: ${pairsRes.status}`
          );
        }
        pairsData = await pairsRes.json();
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
        if (!tradesRes.ok) {
          const errorData = await tradesRes.json();
          throw new Error(
            errorData.error || `Failed to fetch trades: ${tradesRes.status}`
          );
        }
        tradesData = await tradesRes.json();
      } catch (error) {
        console.error("Trades Fetch Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch trades",
          variant: "destructive",
        });
      }

      // Fetch summary
      let summaryData: any = { data: null };
      try {
        const summaryRes = await fetch(`${API_BASE_URL}/api/trades/summary`, {
          headers,
        });
        if (!summaryRes.ok) {
          const errorData = await summaryRes.json();
          throw new Error(
            errorData.error || `Failed to fetch summary: ${summaryRes.status}`
          );
        }
        summaryData = await summaryRes.json();
      } catch (error) {
        console.error("Summary Fetch Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch summary",
          variant: "destructive",
        });
      }

      // Fetch wallet balance
      let walletData: any = { balance: 0 };
      try {
        const walletRes = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
          headers,
        });
        if (!walletRes.ok) {
          const errorData = await walletRes.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch wallet balance: ${walletRes.status}`
          );
        }
        walletData = await walletRes.json();
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
      }

      // Convert string values to numbers for trading pairs
      const parsedPairs = (pairsData.data || []).map((pair: any) => ({
        ...pair,
        min_investment: parseFloat(pair.min_investment),
        max_investment: parseFloat(pair.max_investment),
        min_return_percentage: parseFloat(pair.min_return_percentage),
        max_return_percentage: parseFloat(pair.max_return_percentage),
      }));

      // Transform trades data to match TypeScript interface
      const transformedTrades = (tradesData.data || []).map((trade: any) => ({
        ...trade,
        investment_amount: parseFloat(trade.investment_amount),
        expected_return: parseFloat(trade.expected_return),
        tradingPair: trade.trading_pair
          ? {
              id: trade.trading_pair.id,
              base_symbol: trade.trading_pair.base_symbol,
              quote_symbol: trade.trading_pair.quote_symbol,
              base_name: trade.trading_pair.base_name,
              base_icon_url: trade.trading_pair.base_icon_url,
              investment_duration: trade.trading_pair.investment_duration,
            }
          : undefined,
      }));

      setAvailablePairs(parsedPairs);
      setActiveTrades(
        transformedTrades.filter(
          (trade: Trade) =>
            trade.status === "active" || trade.status === "pending"
        ) || []
      );
      setCompletedTrades(
        transformedTrades.filter((trade: Trade) => trade.status === "completed") ||
        []
      );
      setSummary({
        ...summaryData.data,
        wallet_balance: walletData.balance || 0,
      });
      setTotalPages(tradesData.meta?.last_page || 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load trading data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  return {
    user,
    setUser,
    availablePairs,
    activeTrades,
    completedTrades,
    summary,
    loading,
    currentPage,
    totalPages,
    fetchData,
    setCurrentPage,
  };
}