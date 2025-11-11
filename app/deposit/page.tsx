"use client";

import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

interface CryptoPaymentMethod {
  id: number;
  coin_name: string;
  wallet_address: string;
  network: string;
  min_amount: number;
  max_amount: number | null;
}

interface User {
  name: string;
  email: string;
  balance: number;
}

export default function DepositPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<CryptoPaymentMethod | null>(null);
  const [proofType, setProofType] = useState<"hash" | "image">("hash");
  const [proofOfPayment, setProofOfPayment] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CryptoPaymentMethod[]>([]);
  const [step, setStep] = useState<"method" | "amount" | "confirm">("method");
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
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    }

    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in to view payment methods");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/deposits/methods`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.data);
        } else {
          throw new Error(data.error || "Failed to load payment methods");
        }
      } catch (err: any) {
        setError(err.message || "Network error. Please check your connection and try again.");
        console.error("Error fetching payment methods:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to load payment methods",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [toast]);

  const convertToSmallestUnit = (amount: number, coin: string): number => {
    if (coin === "Bitcoin") return Math.round(amount * 1e8); // BTC to satoshis
    if (coin === "Ethereum") return Math.round(amount * 1e18); // ETH to wei
    if (coin === "Solana") return Math.round(amount * 1e9); // SOL to lamports
    return amount;
  };

  const formatAmount = (amount: number, coin: string): string => {
    if (coin === "Bitcoin") return (amount / 1e8).toFixed(8) + " " + coin;
    if (coin === "Ethereum") return (amount / 1e18).toFixed(18) + " " + coin;
    if (coin === "Solana") return (amount / 1e9).toFixed(9) + " " + coin;
    return amount.toString();
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      setError("Please select a payment method first");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parsedAmount < selectedMethod.min_amount / (selectedMethod.coin_name === "Bitcoin" ? 1e8 : selectedMethod.coin_name === "Ethereum" ? 1e18 : 1e9)) {
      setError(`Minimum deposit is ${formatAmount(selectedMethod.min_amount, selectedMethod.coin_name)}`);
      return;
    }
    if (selectedMethod.max_amount && parsedAmount > selectedMethod.max_amount / (selectedMethod.coin_name === "Bitcoin" ? 1e8 : selectedMethod.coin_name === "Ethereum" ? 1e18 : 1e9)) {
      setError(`Maximum deposit is ${formatAmount(selectedMethod.max_amount, selectedMethod.coin_name)}`);
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleMethodSelect = (method: CryptoPaymentMethod) => {
    setSelectedMethod(method);
    setAmount("");
    setProofOfPayment("");
    setProofFile(null);
    setStep("amount");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !amount) return;
    if (proofType === "image" && !proofFile) {
      setError("Please upload proof of payment image");
      return;
    }
    if (proofType === "hash" && !proofOfPayment) {
      setError("Please enter a transaction hash");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("crypto_payment_method_id", selectedMethod.id.toString());
      formData.append("amount", convertToSmallestUnit(parseFloat(amount), selectedMethod.coin_name).toString());
      formData.append("proof_type", proofType);
      if (proofType === "hash") {
        formData.append("proof_of_payment", proofOfPayment);
      } else if (proofType === "image" && proofFile) {
        formData.append("proof_file", proofFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/deposits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        toast({
          title: "Deposit Submitted",
          description: "Your deposit has been submitted and is pending admin approval.",
        });
      } else {
        throw new Error(data.error || "Deposit failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection and try again.");
      console.error("Error submitting deposit:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit deposit",
        variant: "destructive",
      });
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
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Deposit Submitted!</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your deposit of {amount} {selectedMethod?.coin_name} is pending admin approval.
                  </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                    Current Balance: ${user?.balance || "0.00"}
                  </Badge>
                  <div className="flex gap-2">
                    <Link href="/dashboard">
                      <Button className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSuccess(false);
                        setStep("method");
                        setAmount("");
                        setProofOfPayment("");
                        setProofFile(null);
                        setSelectedMethod(null);
                      }}
                    >
                      Make Another Deposit
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

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Wallet className="h-6 w-6 text-primary" />
                Deposit Cryptocurrency
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Deposit cryptocurrency to start trading. Select a payment method to begin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading payment methods...</p>
                </div>
              ) : error && step !== "confirm" ? (
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <>
                  {step === "method" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Select Payment Method</h3>
                      <div className="grid gap-3">
                        {paymentMethods.length === 0 ? (
                          <p className="text-muted-foreground">No payment methods available.</p>
                        ) : (
                          paymentMethods.map((method) => (
                            <Button
                              key={method.id}
                              variant="outline"
                              className="justify-start h-auto p-4 space-y-2 border-2 hover:border-primary"
                              onClick={() => handleMethodSelect(method)}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Wallet className="h-5 w-5" />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-medium text-foreground">
                                    {method.coin_name} ({method.network})
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Min: {formatAmount(method.min_amount, method.coin_name)} | Max:{" "}
                                    {method.max_amount
                                      ? formatAmount(method.max_amount, method.coin_name)
                                      : "No limit"}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {step === "amount" && selectedMethod && (
                    <form onSubmit={handleAmountSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-foreground">
                          Deposit Amount ({selectedMethod.coin_name})
                        </Label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-10 bg-background border-border text-foreground"
                            step="0.00000001"
                            min="0"
                            required
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Minimum: {formatAmount(selectedMethod.min_amount, selectedMethod.coin_name)} | Maximum:{" "}
                          {selectedMethod.max_amount
                            ? formatAmount(selectedMethod.max_amount, selectedMethod.coin_name)
                            : "No limit"}
                        </p>
                        {error && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Current Balance: ${user?.balance || "0.00"}</span>
                        <span>Fee: Free</span>
                      </div>
                      <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
                        Continue
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setStep("method")}
                        className="w-full gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Change Method
                      </Button>
                    </form>
                  )}

                  {step === "confirm" && selectedMethod && (
                    <form onSubmit={handleDeposit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-semibold text-foreground">Confirm Deposit</h3>
                          <p className="text-muted-foreground">
                            You're about to deposit {amount} {selectedMethod.coin_name} to {selectedMethod.network}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-lg font-semibold">{amount} {selectedMethod.coin_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Method</p>
                            <div className="flex items-center gap-2">
                              <Wallet className="h-5 w-5" />
                              <span className="font-medium">{selectedMethod.coin_name} ({selectedMethod.network})</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Wallet Address</p>
                            <p className="text-sm font-mono break-all">{selectedMethod.wallet_address}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Fee</p>
                            <p className="text-lg font-semibold text-green-600">Free</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground">Proof of Payment</Label>
                          <div className="flex gap-2 mb-2">
                            <Button
                              variant={proofType === "hash" ? "default" : "outline"}
                              onClick={() => setProofType("hash")}
                              type="button"
                            >
                              Transaction Hash
                            </Button>
                            <Button
                              variant={proofType === "image" ? "default" : "outline"}
                              onClick={() => setProofType("image")}
                              type="button"
                            >
                              Upload Image
                            </Button>
                          </div>
                          {proofType === "hash" ? (
                            <Input
                              value={proofOfPayment}
                              onChange={(e) => setProofOfPayment(e.target.value)}
                              placeholder="Enter transaction hash"
                              className="bg-background border-border text-foreground"
                            />
                          ) : (
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="bg-background border-border text-foreground"
                              />
                              {proofFile && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Selected: {proofFile.name}
                                </p>
                              )}
                            </div>
                          )}
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
                          onClick={() => setStep("amount")}
                          className="flex-1 gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Deposit"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}