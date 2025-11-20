"use client";

import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";

interface WithdrawalMethod {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  minAmount: number;
  maxAmount: number;
  fee: number; // now comes from backend
  processingTime: string;
}

export default function WithdrawPage() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [step, setStep] = useState<"amount" | "method" | "confirm">("amount");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletError, setWalletError] = useState("");
  const [success, setSuccess] = useState(false);

  // These will be updated from backend response
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [processingTime, setProcessingTime] = useState<string>("");

  useEffect(() => {
    const userData = Cookies.get("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Only one method for now – but fee comes from API later
  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: 2,
      name: "Crypto Wallet",
      icon: <DollarSign className="h-5 w-5" />,
      description: "Withdraw to your cryptocurrency wallet (USDT, BTC, ETH, TRC20, etc.)",
      minAmount: 20,
      maxAmount: 100000,
      fee: 0, // placeholder – real fee comes from API
      processingTime: "Loading...",
    },
  ];

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount < 20) {
      setError("Minimum withdrawal amount is $20");
      return;
    }

    if (numAmount > parseFloat(user?.balance || "0")) {
      setError("Insufficient balance");
      return;
    }

    setError("");
    setStep("method");
  };

  const handleMethodSelect = async (method: WithdrawalMethod) => {
    const numAmount = parseFloat(amount);

    if (numAmount < method.minAmount || numAmount > method.maxAmount) {
      setError(`Amount must be between $${method.minAmount} and $${method.maxAmount}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/withdraw/fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
        body: JSON.stringify({
          amount: numAmount,
          method: method.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedMethod({
          ...method,
          fee: data.fee_percent,
          processingTime: data.processing_time,
        });
        setFeeAmount(data.fee_amount);
        setNetAmount(data.net_amount);
        setProcessingTime(data.processing_time);
        setError("");
        setStep("confirm");
      } else {
        setError(data.message || "Could not fetch withdrawal fee");
      }
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateWalletAddress = (addr: string): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) return false;

    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    const btcLegacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const btcBech32Regex = /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
    const tronRegex = /^T[a-zA-HJ-NP-Z0-9]{33}$/;

    return ethRegex.test(trimmed) ||
           btcLegacyRegex.test(trimmed) ||
           btcBech32Regex.test(trimmed) ||
           tronRegex.test(trimmed);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;

    if (selectedMethod.name === "Crypto Wallet") {
      if (!walletAddress.trim()) {
        setWalletError("Wallet address is required");
        return;
      }
      if (!validateWalletAddress(walletAddress)) {
        setWalletError("Invalid wallet address format");
        return;
      }
      setWalletError("");
    }

    setIsLoading(true);
    setError("");

    try {
      const payload: any = {
        amount: parseFloat(amount),
        method: selectedMethod.name,
        currency: "USD",
        walletAddress: selectedMethod.name === "Crypto Wallet" ? walletAddress.trim() : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (user) {
          const newBalance = (parseFloat(user.balance) - parseFloat(amount)).toFixed(2);
          const updatedUser = { ...user, balance: newBalance };
          Cookies.set("user_data", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setError(data.message || "Withdrawal failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader isAuthenticated />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <CardTitle className="text-2xl mb-2">Withdrawal Requested!</CardTitle>
                <CardDescription className="text-base mb-6">
                  Your ${amount} withdrawal has been submitted successfully.
                </CardDescription>

                <div className="space-y-4 text-left bg-muted/50 p-5 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-bold text-destructive">${feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>You'll Receive</span>
                    <span className="text-primary">${netAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <Badge className="w-full py-2 text-center">
                      {processingTime}
                    </Badge>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setStep("amount");
                      setAmount("");
                      setSelectedMethod(null);
                      setFeeAmount(0);
                      setNetAmount(0);
                    }}
                  >
                    New Withdrawal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <DollarSign className="h-7 w-7 text-primary" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>Minimum withdrawal: $20</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">

              {/* Step 1: Amount */}
              {step === "amount" && (
                <form onSubmit={handleAmountSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="20"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 text-lg"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available: <span className="font-bold">${user?.balance || "0.00"}</span>
                    </p>
                    {error && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {error}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Continue
                  </Button>
                </form>
              )}

              {/* Step 2: Method */}
              {step === "method" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">Select Method</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Amount: <strong>${amount}</strong>
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {withdrawalMethods.map((method) => {
                      const numAmount = parseFloat(amount);
                      const disabled = numAmount < method.minAmount || numAmount > method.maxAmount;

                      return (
                        <Button
                          key={method.id}
                          variant="outline"
                          className={`p-6 text-left border-2 ${disabled ? "opacity-50" : "hover:border-primary"}`}
                          onClick={() => handleMethodSelect(method)}
                          disabled={disabled || isLoading}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              {method.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{method.name}</h4>
                              <p className="text-sm text-muted-foreground/70">{method.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Min $20 • Max $100,000
                              </p>
                            </div>
                          </div>
                          {isLoading && <Loader2 className="ml-auto h-5 h-5 animate-spin" />}
                        </Button>
                      );
                    })}
                  </div>

                  <Button variant="ghost" onClick={() => setStep("amount")} className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Change Amount
                  </Button>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === "confirm" && selectedMethod && (
                <form onSubmit={handleWithdraw} className="space-y-7">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">Confirm Withdrawal</h3>
                  </div>

                  {selectedMethod.name === "Crypto Wallet" && (
                    <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                      <Label htmlFor="wallet">Wallet Address</Label>
                      <Input
                        id="wallet"
                        type="text"
                        placeholder="e.g. 0x... or T..."
                        value={walletAddress}
                        onChange={(e) => {
                          setWalletAddress(e.target.value);
                          setWalletError("");
                        }}
                        className="font-mono"
                        required
                      />
                      {walletError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> {walletError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Warning: Double-check address — funds are irreversible
                      </p>
                    </div>
                  )}

                  <div className="p-6 bg-muted/50 rounded-lg space-y-4">
                    <div className="flex justify-between text-lg">
                      <span>Amount</span>
                      <span className="font-bold">${amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee</span>
                      <span className="text-destructive font-bold">${feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>You Receive</span>
                      <span>${netAmount.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t text-sm text-muted-foreground">
                      <Badge variant="secondary" className="w-full py-2">
                        {processingTime}
                      </Badge>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep("method")} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Withdrawal"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}