"use client";

import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  Banknote,
  Shield,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface WithdrawalMethod {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  processingTime: string;
}

export default function WithdrawPage() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [step, setStep] = useState<"amount" | "method" | "confirm">("amount");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userData = Cookies.get("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: 1,
      name: "Bank Transfer",
      icon: <Banknote className="h-5 w-5" />,
      description: "Direct transfer to your bank account",
      minAmount: 50,
      maxAmount: 50000,
      fee: 1.5,
      processingTime: "1-3 business days"
    },
    {
      id: 2,
      name: "Crypto Wallet",
      icon: <DollarSign className="h-5 w-5" />,
      description: "Withdraw to your cryptocurrency wallet",
      minAmount: 20,
      maxAmount: 100000,
      fee: 0.5,
      processingTime: "Instant"
    }
  ];

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount < 20) {
      setError("Minimum withdrawal amount is $20");
      return;
    }
    
    if (numAmount > (parseFloat(user?.balance || 0))) {
      setError("Insufficient balance");
      return;
    }

    if (selectedMethod && numAmount < selectedMethod.minAmount) {
      setError(`Minimum withdrawal amount for this method is $${selectedMethod.minAmount}`);
      return;
    }

    setError("");
    setStep("method");
  };

  const handleMethodSelect = (method: WithdrawalMethod) => {
    const numAmount = parseFloat(amount);
    if (numAmount < method.minAmount || numAmount > method.maxAmount) {
      setError(`Amount must be between $${method.minAmount} and $${method.maxAmount} for this method`);
      return;
    }
    setSelectedMethod(method);
    setStep("confirm");
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !amount) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method: selectedMethod.name,
          currency: "USD"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Update user balance in cookies
        if (user) {
          const updatedUser = { ...user, balance: (parseFloat(user.balance) - parseFloat(amount)).toFixed(2) };
          Cookies.set("user_data", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setError(data.message || "Withdrawal request failed. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader isAuthenticated />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardHeader>
                  <CardTitle className="text-2xl">Withdrawal Requested!</CardTitle>
                  <CardDescription>
                    Your withdrawal request of ${amount} has been submitted successfully.
                  </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                    Processing Time: {selectedMethod?.processingTime}
                  </Badge>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Fee: {selectedMethod?.fee}% (${((parseFloat(amount) * selectedMethod?.fee) / 100).toFixed(2)})
                  </Badge>
                  <div className="flex gap-2">
                    <Link href="/dashboard">
                      <Button className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => setSuccess(false)}>
                      Request Another Withdrawal
                    </Button>
                  </div>
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
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Withdraw funds from your trading account. Minimum withdrawal: $20
              </CardDescription>
              {/* <div className="flex items-center gap-2 pt-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  KYC verification required for withdrawals above $1,000
                </span>
              </div> */}
            </CardHeader>
            <CardContent className="space-y-6">
              {step === "amount" && (
                <form onSubmit={handleAmountSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10"
                        step="0.01"
                        min="20"
                        max={user?.balance}
                        required
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Available Balance: <span className="font-semibold">${user?.balance || "0.00"}</span>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    )}
                  </div>
                  
                  {/* <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Est. Fee</p>
                      <p className="font-semibold text-destructive">1.5%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Processing</p>
                      <p className="font-semibold">1-3 days</p>
                    </div>
                  </div> */}

                  <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) > (parseFloat(user?.balance || 0))}>
                    Continue
                  </Button>
                </form>
              )}

              {step === "method" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Withdrawal Method</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Amount: <span className="font-semibold">${amount}</span></p>
                    <p>Available Balance: <span className="font-semibold">${user?.balance || "0.00"}</span></p>
                  </div>
                  
                  <div className="grid gap-3">
                    {withdrawalMethods.map((method) => {
                      const feeAmount = (parseFloat(amount) * method.fee) / 100;
                      const netAmount = parseFloat(amount) - feeAmount;
                      
                      return (
                        <Button
                          key={method.id}
                          variant="outline"
                          className="justify-start h-auto p-4 space-y-2 border-2 hover:border-primary"
                          onClick={() => handleMethodSelect(method)}
                          disabled={parseFloat(amount) < method.minAmount || parseFloat(amount) > method.maxAmount}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {method.icon}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{method.name}</h4>
                                {parseFloat(amount) < method.minAmount && (
                                  <Badge variant="destructive" className="text-xs">
                                    Below min
                                  </Badge>
                                )}
                                {parseFloat(amount) > method.maxAmount && (
                                  <Badge variant="destructive" className="text-xs">
                                    Above max
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                <div>
                                  <p className="text-muted-foreground">Min/Max</p>
                                  <p>${method.minAmount} - ${method.maxAmount}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Fee</p>
                                  <p className="text-destructive">{method.fee}% (${feeAmount.toFixed(2)})</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-muted-foreground">Processing</p>
                                  <p>{method.processingTime}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setStep("amount")}
                      className="gap-2 w-full"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Change Amount
                    </Button>
                  </div>
                </div>
              )}

              {step === "confirm" && selectedMethod && (
                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">Confirm Withdrawal</h3>
                      <p className="text-muted-foreground">
                        You're about to withdraw ${amount} using {selectedMethod.name}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-semibold">${amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Method</p>
                        <div className="flex items-center gap-2">
                          {selectedMethod.icon}
                          <span className="font-medium">{selectedMethod.name}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fee</p>
                        <p className="text-lg font-semibold text-destructive">
                          ${((parseFloat(amount) * selectedMethod.fee) / 100).toFixed(2)} ({selectedMethod.fee}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">You'll Receive</p>
                        <p className="text-lg font-semibold text-primary">
                          ${(parseFloat(amount) - (parseFloat(amount) * selectedMethod.fee / 100)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Processing Time: <span className="font-semibold">{selectedMethod.processingTime}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your new balance will be: 
                        <span className="font-semibold text-foreground">
                          ${((parseFloat(user?.balance || 0) - parseFloat(amount))).toFixed(2)}
                        </span>
                      </p>
                      {error && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("method")}
                      className="flex-1 gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Change Method
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm & Withdraw"
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