"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { NavHeader } from "@/components/nav-header";
import { StatsCards } from "./components/StatsCards";
import { TradeForm } from "./components/TradeForm";
import { ActiveTrades } from "./components/ActiveTrades";
import { CompletedTrades } from "./components/CompletedTrades";
import { QuickActions } from "./components/QuickActions";
import { useTradingData } from "./hooks/useTradingData";
import { getCookie } from "./lib/utils";
import { TradingPair, Trade, PortfolioSummary } from "./lib/types";

export default function TradingDashboard() {
  const { toast } = useToast();
  const {
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
  } = useTradingData();

  useEffect(() => {
    // Fetch user data from cookies
    const userData = getCookie("user_data");
    if (userData) {
      try {
        let decodedUserData = userData;
        try {
          decodedUserData = decodeURIComponent(userData);
        } catch (decodeError) {
          console.warn("URL decoding failed:", decodeError);
        }
        try {
          const parsedUser = JSON.parse(decodedUserData);
          setUser(parsedUser);
        } catch (jsonError) {
          try {
            const base64Decoded = atob(decodedUserData);
            const parsedBase64 = JSON.parse(base64Decoded);
            setUser(parsedBase64);
          } catch (base64Error) {
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
      toast({
        title: "Warning",
        description: "No user data found. Please log in.",
        variant: "destructive",
      });
    }
  }, [toast, setUser]);

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

        <StatsCards summary={summary} />
        <div className="grid gap-6 lg:grid-cols-3">
          <TradeForm
            availablePairs={availablePairs}
            loading={loading}
            fetchData={fetchData}
          />
          <ActiveTrades
            activeTrades={activeTrades}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            fetchData={fetchData}
          />
          {/* <QuickActions /> */}
        </div>
        {completedTrades.length > 0 && (
          <CompletedTrades
            completedTrades={completedTrades}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}
