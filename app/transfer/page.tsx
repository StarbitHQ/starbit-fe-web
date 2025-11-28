"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  User,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface TransferPreview {
  amount: number;
  receiver: {
    username: string;
    email: string;
  };
}

interface TransferHistory {
  id: number;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
  type: 'sent' | 'received';
  sender?: { username: string; email?: string };
  receiver?: { username: string; email?: string };
}

interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  account_bal: number;
  transfer_pin: string | null;
  // ... other fields
}

export default function TransferPage() {
  const router = useRouter();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [transferPreview, setTransferPreview] = useState<TransferPreview | null>(null);
  const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  // Fetch user data and transfer history on mount
  useEffect(() => {
    fetchUserBalance();
    fetchTransferHistory();
  }, []);

  // ✅ FIXED: Proper balance fetching function
  const fetchUserBalance = async () => {
    setIsFetchingBalance(true);
    try {
      const authToken = Cookies.get("auth_token");
      
      // Method 1: Try API call first (most reliable)
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const user = data.data;
          setUserData(user);
          setUserBalance(user.account_bal || 0);
          setHasPin(user.transfer_pin !== null);
          // Update cookies with fresh data
          Cookies.set("user_data", JSON.stringify(user));
          return;
        }
      }

      // Method 2: Fallback to cookies
      const userDataCookie = Cookies.get("user_data");
      if (userDataCookie) {
        try {
          const user = JSON.parse(userDataCookie);
          // ✅ FIXED: Correct field name and parsing
          const balance = parseFloat(user.account_bal || user.balance || "0");
          setUserBalance(balance);
          setUserData(user);
          setHasPin(user.transfer_pin !== null);
          console.log("Balance from cookies:", balance); // Debug log
        } catch (parseError) {
          console.error("Error parsing user data from cookies:", parseError);
        }
      }
    } catch (err) {
      console.error("Error fetching user balance:", err);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  // Refresh balance button handler
  const handleRefreshBalance = () => {
    fetchUserBalance();
  };

  const fetchTransferHistory = async () => {
    try {
      const authToken = Cookies.get("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/transfers`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allTransfers: TransferHistory[] = [];
        
        if (data.sent) {
          data.sent.forEach((transfer: any) => {
            allTransfers.push({
              ...transfer,
              type: 'sent' as const,
              sender: { username: 'You' },
              receiver: transfer.receiver
            });
          });
        }
        
        if (data.received) {
          data.received.forEach((transfer: any) => {
            allTransfers.push({
              ...transfer,
              type: 'received' as const,
              sender: transfer.sender,
              receiver: { username: 'You' }
            });
          });
        }
        
        allTransfers.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setTransferHistory(allTransfers);
      }
    } catch (err) {
      console.error("Error fetching transfer history:", err);
    }
  };

  const attemptTransfer = async () => {
    if (!username.trim() || !amount.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum > userBalance) {
      setError(`Insufficient balance. Available: $${userBalance.toLocaleString()}`);
      return;
    }

    if (!hasPin) {
      setError("Please set a transaction PIN first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/transfer/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          amount: amountNum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTransferPreview(data.transfer);
        setShowPinModal(true);
        setError(null);
      } else {
        setError(data.message || "Failed to validate transfer");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Transfer attempt error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmTransfer = async () => {
    if (!pin.trim()) {
      setError("Please enter your transaction PIN");
      return;
    }

    setIsConfirmLoading(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token"); // ✅ FIXED: Correct token name
      const response = await fetch(`${API_BASE_URL}/api/transfer/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: transferPreview!.receiver.username,
          amount: transferPreview!.amount,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Transfer successful! Reference: ${data.reference}`);
        setTransferPreview(null);
        setUsername("");
        setAmount("");
        setPin("");
        setShowPinModal(false);
        
        // ✅ Refresh balance after successful transfer
        await fetchUserBalance();
        fetchTransferHistory();
        
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message || "Transfer failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Transfer confirm error:", err);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  // Format balance for display
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Transfer Funds</h1>
              <p className="text-muted-foreground mt-2">
                Send money instantly to other users
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* ✅ FIXED: Enhanced Balance Display */}
              <div className="relative group">
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-muted-foreground block truncate">
                      Available Balance
                    </span>
                    <span className="font-bold text-lg text-foreground">
                      ${formatBalance(userBalance)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshBalance}
                    disabled={isFetchingBalance}
                    className="h-8 w-8 p-0"
                  >
                    {isFetchingBalance ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {/* Debug info on hover */}
                <div className="absolute -top-2 -right-2 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full hidden group-hover:block">
                  Debug: ${userBalance}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transfer Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                New Transfer
              </CardTitle>
              <CardDescription>
                Enter recipient details and amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Recipient Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available balance: <span className="font-mono">${formatBalance(userBalance)}</span>
                  </p>
                </div>
              </div>

              <Button
                onClick={attemptTransfer}
                disabled={isLoading || !username.trim() || !amount.trim() || isFetchingBalance}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Continue
                  </>
                )}
              </Button>

              {!hasPin && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      You need to set a transaction PIN to transfer funds.{" "}
                      <button
                        onClick={() => router.push("/security")}
                        className="underline font-medium hover:no-underline"
                      >
                        Set PIN now
                      </button>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transfers - SAME AS BEFORE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Transfers
              </CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {transferHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No transfers yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transferHistory.slice(0, 5).map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transfer.type === 'sent' 
                            ? 'bg-red-500/10 text-red-600' 
                            : 'bg-green-500/10 text-green-600'
                        }`}>
                          {transfer.type === 'sent' ? (
                            <Send className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {transfer.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                            {transfer.receiver?.username || transfer.sender?.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transfer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transfer.type === 'sent' ? 'text-destructive' : 'text-green-600'
                        }`}>
                          ${transfer.amount}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {transfer.reference}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/transfer/history")}
              >
                View All Transfers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PIN Confirmation Modal - SAME AS BEFORE */}
      {showPinModal && transferPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Confirm Transfer</CardTitle>
              <CardDescription>
                Verify this transaction with your PIN
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-semibold">You</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-semibold">{transferPreview.receiver.username}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-lg font-semibold text-primary">Amount</span>
                  <span className="text-2xl font-bold">${transferPreview.amount}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-muted-foreground">New Balance</span>
                  <span className="font-semibold">
                    ${formatBalance(userBalance - transferPreview.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-6 digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPinModal(false)}
                  disabled={isConfirmLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmTransfer}
                  disabled={isConfirmLoading || !pin.trim()}
                >
                  {isConfirmLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Transfer'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}