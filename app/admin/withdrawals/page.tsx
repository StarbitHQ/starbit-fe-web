"use client";

import { NavHeader } from "@/components/admin-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface Withdrawal {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  amount: string;
  method: string;
  network: string | null;
  fee: string;
  net_amount: string;
  wallet_address: string | null;
  tx_hash: string | null;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  processed_at: string | null;
}

export default function WithdrawalManagementPage() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [txHash, setTxHash] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = Cookies.get("auth_token");
      if (!token) throw new Error("Please log in again");

      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch withdrawals");

      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unknown error");

      const data = result.data;
      setAllWithdrawals(data);
      setWithdrawals(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setWithdrawals(allWithdrawals);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = allWithdrawals.filter((w) => {
      return (
        w.id.toString().includes(q) ||
        w.user.name.toLowerCase().includes(q) ||
        w.user.email.toLowerCase().includes(q) ||
        w.wallet_address?.toLowerCase().includes(q) ||
        w.tx_hash?.toLowerCase().includes(q) ||
        w.amount.includes(q) ||
        w.method.toLowerCase().includes(q)
      );
    });
    setWithdrawals(filtered);
  }, [searchQuery, allWithdrawals]);

  const handleProcess = async () => {
    if (!processingId) return;

    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/withdrawals/${processingId}/process`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tx_hash: txHash.trim() || null }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      toast({
        title: "Success",
        description: "Withdrawal processed successfully",
      });
      setProcessingId(null);
      setTxHash("");
      fetchWithdrawals();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!cancellingId) return;

    if (!confirm("Cancel this withdrawal and refund the full amount?")) return;

    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/withdrawals/${cancellingId}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      toast({
        title: "Cancelled",
        description: "Withdrawal cancelled & balance refunded",
      });
      setCancellingId(null);
      fetchWithdrawals();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Withdrawal["status"]) => {
    const map = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
    };
    const { color, icon } = map[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="h-7 w-7" />
                  Withdrawal Management
                </CardTitle>
                <CardDescription>
                  Review and process user withdrawal requests
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, name, email, wallet, tx..."
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Wallet / Tx</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchQuery ? "No withdrawals match your search" : "No withdrawals found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w) => (
                    <TableRow key={w.id} className={w.status === "pending" ? "bg-yellow-50" : ""}>
                      <TableCell className="font-mono">#{w.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{w.user.name}</p>
                          <p className="text-xs text-muted-foreground">{w.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">${w.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          Net: ${w.net_amount} (Fee: ${w.fee})
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{w.method}</span>
                          {w.network && <span className="text-xs block text-muted-foreground">({w.network})</span>}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {w.wallet_address && (
                          <p className="font-mono text-xs truncate">{w.wallet_address}</p>
                        )}
                        {w.tx_hash && (
                          <a
                            href={`https://tronscan.org/#/transaction/${w.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary text-xs hover:underline mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Tx
                          </a>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(w.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {w.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setProcessingId(w.id);
                                  setTxHash(w.tx_hash || "");
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Process
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setCancellingId(w.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {w.status !== "pending" && (
                            <span className="text-muted-foreground text-xs">Done</span>
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

        {/* Process Modal */}
        <Dialog open={!!processingId} onOpenChange={() => setProcessingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Withdrawal #{processingId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Transaction Hash (Optional)</Label>
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="e.g. 0xabc123..."
                  className="font-mono"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Leave empty if payout was done off-chain or manually.
              </div>
              <div className="flex gap-3">
                <Button onClick={handleProcess} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
                <Button variant="outline" onClick={() => setProcessingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation */}
        <Dialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Withdrawal #{cancellingId}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                This will <strong>refund the full amount</strong> back to the user's balance.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleCancel} className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Yes, Cancel & Refund
              </Button>
              <Button variant="outline" onClick={() => setCancellingId(null)}>
                Keep Pending
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}