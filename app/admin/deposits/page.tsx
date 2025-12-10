"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2, AlertCircle, CheckCircle, XCircle, ExternalLink, Image as ImageIcon, RefreshCw, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

interface Deposit {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  cryptocurrency: {
    id: number;
    coin_name: string;
    network: string;
  } | null;
  transaction_hash: string | null;
  from_address: string | null;
  to_address: string;
  expected_amount: string;
  actual_amount: string | null;
  credited_amount: string | null;
  proof_of_payment: string | null;
  status: "pending" | "verifying" | "confirmed" | "failed" | "mismatch";
  confirmations: number;
  verification_error: string | null;
  verified_at: string | null;
  created_at: string;
}

export default function DepositManagementPage() {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [failReason, setFailReason] = useState("");
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [confirmingDepositId, setConfirmingDepositId] = useState<number | null>(null);

  const fetchDeposits = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/api/admin/deposits`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch deposits");
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Unknown error");

      const data = result.data;
      setAllDeposits(data);
      setDeposits(data);
    } catch (err: any) {
      setError(err.message || "Failed to load deposits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDeposits(allDeposits);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allDeposits.filter((d) => {
      return (
        d.id.toString().includes(query) ||
        d.user?.name?.toLowerCase().includes(query) ||
        d.user?.email?.toLowerCase().includes(query) ||
        d.transaction_hash?.toLowerCase().includes(query) ||
        d.cryptocurrency?.coin_name?.toLowerCase().includes(query) ||
        d.cryptocurrency?.network?.toLowerCase().includes(query) ||
        d.expected_amount.includes(query)
      );
    });

    setDeposits(filtered);
  }, [searchQuery, allDeposits]);

  const handleManualConfirm = async (depositId: number) => {
    setConfirmingDepositId(depositId);
    try {
      const authToken = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/deposits/${depositId}/manual-confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to confirm");

      toast({ title: "Success", description: "Deposit manually confirmed & credited" });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setConfirmingDepositId(null);
    }
  };

  const handleFail = async () => {
    if (!selectedDepositId || !failReason.trim()) {
      toast({ title: "Error", description: "Reason is required", variant: "destructive" });
      return;
    }

    try {
      const authToken = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/deposits/${selectedDepositId}/fail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: failReason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      toast({ title: "Success", description: "Deposit marked as failed" });
      setFailReason("");
      setSelectedDepositId(null);
      fetchDeposits();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: Deposit["status"]) => {
    const map = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      verifying: { color: "bg-blue-100 text-blue-800", icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
      confirmed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
      mismatch: { color: "bg-orange-100 text-orange-800", icon: <AlertCircle className="h-3 w-3" /> },
    };
    const { color, icon } = map[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const explorerUrl = (deposit: Deposit) => {
    if (!deposit.transaction_hash || !deposit.cryptocurrency) return null;
    const hash = deposit.transaction_hash;
    const coin = deposit.cryptocurrency.coin_name;

    const explorers: Record<string, string> = {
      Bitcoin: `https://blockchair.com/bitcoin/transaction/${hash}`,
      Ethereum: `https://etherscan.io/tx/${hash}`,
      "Binance Coin": `https://bscscan.com/tx/${hash}`,
      Polygon: `https://polygonscan.com/tx/${hash}`,
      Solana: `https://solscan.io/tx/${hash}`,
      Tron: `https://tronscan.org/#/transaction/${hash}`,
    };

    return explorers[coin] || `https://blockchair.com/search?q=${hash}`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Wallet className="h-7 w-7" />
                  Deposit Management
                </CardTitle>
                <CardDescription>Review on-chain deposits and manual proof submissions</CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by ID, name, email, tx hash, coin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Coin</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {searchQuery ? "No deposits match your search" : "No deposits found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono">#{d.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{d.user?.name || "Deleted"}</p>
                          <p className="text-xs text-muted-foreground">{d.user?.email || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {d.cryptocurrency?.coin_name} ({d.cryptocurrency?.network})
                      </TableCell>
                      <TableCell className="font-mono">{d.expected_amount}</TableCell>
                      <TableCell>
                        {d.proof_of_payment ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setImagePreviewUrl(d.proof_of_payment!)}
                            className="h-8 px-3 text-primary hover:bg-primary/10 gap-1.5 font-medium"
                          >
                            <ImageIcon className="h-4 w-4" />
                            View Image
                          </Button>
                        ) : d.transaction_hash ? (
                          <a
                            href={explorerUrl(d)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Tx
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>{d.created_at}</TableCell>
                      <TableCell>{getStatusBadge(d.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {["pending", "verifying", "mismatch"].includes(d.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleManualConfirm(d.id)}
                              disabled={confirmingDepositId === d.id}
                            >
                              {confirmingDepositId === d.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Confirm
                            </Button>
                          )}
                          {d.status !== "confirmed" && d.status !== "failed" && (
                            <Button size="sm" variant="destructive" onClick={() => setSelectedDepositId(d.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Fail
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Image Preview Modal */}
        <Dialog open={!!imagePreviewUrl} onOpenChange={() => setImagePreviewUrl(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Proof of Payment</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-96 md:h-full min-h-96">
              <Image
                src={imagePreviewUrl!}
                alt="Proof of payment"
                fill
                className="object-contain rounded-lg"
                unoptimized
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => {
                  const deposit = deposits.find(d => d.proof_of_payment === imagePreviewUrl);
                  if (deposit) handleManualConfirm(deposit.id);
                  setImagePreviewUrl(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Credit Balance
              </Button>
              <Button variant="outline" onClick={() => setImagePreviewUrl(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fail Modal */}
        <Dialog open={!!selectedDepositId} onOpenChange={(open) => !open && (setSelectedDepositId(null), setFailReason(""))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Deposit #{selectedDepositId} as Failed</DialogTitle>
            </DialogHeader>
            <Label>Reason for failure</Label>
            <Input value={failReason} onChange={(e) => setFailReason(e.target.value)} placeholder="e.g., Fake screenshot, wrong network" />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleFail}>Confirm Fail</Button>
              <Button variant="outline" onClick={() => { setSelectedDepositId(null); setFailReason(""); }}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}