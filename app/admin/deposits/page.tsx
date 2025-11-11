"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2, AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface Deposit {
  id: number;
  user_name: string;
  user_email: string;
  amount: number;
  crypto_payment_method: {
    id: number;
    coin_name: string;
    network: string;
  };
  proof_of_payment: string;
  status: "pending" | "processed" | "declined";
  decline_reason?: string;
  created_at: string;
}

export default function DepositManagementPage() {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>("");
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in as an admin to view deposits");
          return;
        }


        const response = await fetch(`${API_BASE_URL}/api/admin/deposits`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch deposits");
        }

        const data = await response.json();
        if (data.success) {
          setDeposits(data.data);
        } else {
          throw new Error(data.error || "Failed to load deposits");
        }
      } catch (err: any) {
        setError(err.message || "Network error. Please check your connection and try again.");
        console.error("Error fetching deposits:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  const handleProcess = async (id: number) => {
    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        throw new Error("Please log in as an admin to process deposits");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/deposits/${id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to process deposit");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Deposit Processed",
          description: "The deposit has been processed successfully.",
        });
        setDeposits(
          deposits.map((deposit) =>
            deposit.id === id ? { ...deposit, status: data.data.status } : deposit
          )
        );
      } else {
        throw new Error(data.error || "Failed to process deposit");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to process deposit",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (id: number) => {
    if (!declineReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for declining the deposit",
        variant: "destructive",
      });
      return;
    }

    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        throw new Error("Please log in as an admin to decline deposits");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/deposits/${id}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ decline_reason: declineReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline deposit");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Deposit Declined",
          description: "The deposit has been declined successfully.",
        });
        setDeposits(
          deposits.map((deposit) =>
            deposit.id === id
              ? { ...deposit, status: data.data.status, decline_reason: data.data.decline_reason }
              : deposit
          )
        );
        setDeclineReason("");
        setSelectedDepositId(null);
      } else {
        throw new Error(data.error || "Failed to decline deposit");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to decline deposit",
        variant: "destructive",
      });
    }
  };

  const formatAmount = (amount: number, coin: string) => {
    if (coin === "Bitcoin") return (amount / 1e8).toFixed(8) + " BTC";
    if (coin === "Ethereum") return (amount / 1e18).toFixed(18) + " ETH";
    if (coin === "Solana") return (amount / 1e9).toFixed(9) + " SOL";
    return amount.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading deposits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Deposit Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Review and manage user deposits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Client Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Proof of Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No deposits found
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>{deposit.id}</TableCell>
                      <TableCell>{deposit.user_name}</TableCell>
                      <TableCell>{deposit.user_email}</TableCell>
                      <TableCell>
                        {formatAmount(deposit.amount, deposit.crypto_payment_method.coin_name)}
                      </TableCell>
                      <TableCell>
                        {deposit.crypto_payment_method.coin_name} ({deposit.crypto_payment_method.network})
                      </TableCell>
                      <TableCell>
                        {deposit.proof_of_payment.startsWith("http") ? (
                          <a
                            href={deposit.proof_of_payment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Image <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <a
                            href={`https://blockchair.com/${deposit.crypto_payment_method.network.toLowerCase().replace(" ", "-")}/transaction/${deposit.proof_of_payment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Tx <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            deposit.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : deposit.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {deposit.status === "processed" && <CheckCircle className="h-3 w-3" />}
                          {deposit.status === "declined" && <XCircle className="h-3 w-3" />}
                          {deposit.status === "pending" && <Loader2 className="h-3 w-3 animate-spin" />}
                          {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {deposit.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcess(deposit.id)}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Process
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDepositId(deposit.id)}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        )}
                        {deposit.status === "declined" && deposit.decline_reason && (
                          <p className="text-sm text-muted-foreground">
                            Reason: {deposit.decline_reason}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {selectedDepositId && (
              <div className="mt-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <Label htmlFor="decline_reason" className="text-foreground">
                      Reason for Declining Deposit
                    </Label>
                    <Input
                      id="decline_reason"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="bg-background border-border text-foreground mt-2"
                      placeholder="e.g., Invalid transaction hash"
                    />
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleDecline(selectedDepositId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirm Decline
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeclineReason("");
                          setSelectedDepositId(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}