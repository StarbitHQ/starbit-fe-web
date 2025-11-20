"use client";

import { NavHeader } from "@/components/nav-header";
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

interface UsdtPaymentMethod {
  id: number;
  network: string;               // e.g. "ERC-20", "TRC-20"
  wallet_address: string;
  min_amount: number;           // in **cents** (1 USDT = 100 cents)
  max_amount: number | null;    // in **cents** (null = no limit)
}

interface User {
  name: string;
  email: string;
  balance: number;
}

/* --------------------------------------------------------------- */
export default function DepositPage() {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");                 // human-readable USDT
  const [selectedMethod, setSelectedMethod] = useState<UsdtPaymentMethod | null>(null);
  const [proofType, setProofType] = useState<"hash" | "image">("hash");
  const [proofOfPayment, setProofOfPayment] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<UsdtPaymentMethod[]>([]);
  const [step, setStep] = useState<"method" | "amount" | "confirm">("method");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* -------------------------- Load user & methods -------------------------- */
  useEffect(() => {
    // ---- user ----
    const userData = Cookies.get("user_data");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        toast({ title: "Error", description: "Failed to load user data", variant: "destructive" });
      }
    }

    // ---- payment methods (USDT only) ----
    const fetchMethods = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get("auth_token");
        if (!token) throw new Error("Please log in");

        const res = await fetch(`${API_BASE_URL}/api/deposits/methods`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Failed to load methods");

        // Backend may return many coins – filter to USDT only
        const usdtOnly = json.data.filter((m: any) => m.coin_name === "USDT");
        setPaymentMethods(usdtOnly);
      } catch (err: any) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMethods();
  }, [toast]);

  /* -------------------------- Helpers -------------------------- */
  const toCents = (usd: number) => Math.round(usd * 100);
  const fromCents = (cents: number) => (cents / 100).toFixed(2);

  const formatAmount = (cents: number) => `${fromCents(cents)} USDT`;

  /* -------------------------- Validation -------------------------- */
  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return setError("Select a method first");

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return setError("Enter a valid amount");

    const minUsd = selectedMethod.min_amount / 100;
    const maxUsd = selectedMethod.max_amount !== null ? selectedMethod.max_amount / 100 : null;

    if (parsed < minUsd) return setError(`Minimum deposit is ${formatAmount(selectedMethod.min_amount)}`);
    if (maxUsd !== null && parsed > maxUsd) return setError(`Maximum deposit is ${formatAmount(selectedMethod.max_amount!)}`);

    setError("");
    setStep("confirm");
  };

  const handleMethodSelect = (method: UsdtPaymentMethod) => {
    setSelectedMethod(method);
    setAmount("");
    setProofOfPayment("");
    setProofFile(null);
    setStep("amount");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setProofFile(e.target.files[0]);
  };

  /* -------------------------- Submit deposit -------------------------- */
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !amount) return;
    if (proofType === "image" && !proofFile) return setError("Upload proof image");
    if (proofType === "hash" && !proofOfPayment) return setError("Enter transaction hash");

    setIsLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("crypto_payment_method_id", selectedMethod.id.toString());
      form.append("amount", toCents(parseFloat(amount)).toString());
      form.append("proof_type", proofType);
      if (proofType === "hash") form.append("proof_of_payment", proofOfPayment);
      if (proofType === "image" && proofFile) form.append("proof_file", proofFile);

      const res = await fetch(`${API_BASE_URL}/api/deposits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
        body: form,
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.error ?? "Deposit failed");

      setSuccess(true);
      toast({ title: "Submitted", description: "Deposit pending admin approval." });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------- Success UI -------------------------- */
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader isAuthenticated />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card classDestroy="bg-card border-border">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Deposit Submitted!</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {amount} USDT ({selectedMethod?.network}) is pending approval.
                  </CardDescription>
                </CardHeader>

                <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                  Balance: ${user?.balance ?? "0.00"}
                </Badge>

                <div className="flex gap-2 mt-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSuccess(false);
                      setStep("method");
                      setAmount("");
                      setProofOfPayment("");
                      setProofFile(null);
                      setSelectedMethod(null);
                    }}
                  >
                    New Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  /* -------------------------- Main UI -------------------------- */
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
                Deposit USDT
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose a network and send USDT to the address shown.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* ----- Loading / Global error ----- */}
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading USDT methods...</p>
                </div>
              ) : error && step !== "confirm" ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <>
                  {/* ----- STEP 1: Choose network ----- */}
                  {step === "method" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Select Network</h3>
                      <div className="grid gap-3">
                        {paymentMethods.length === 0 ? (
                          <p className="text-muted-foreground">No USDT methods available.</p>
                        ) : (
                          paymentMethods.map((m) => (
                            <Button
                              key={m.id}
                              variant="outline"
                              className="justify-start h-auto p-4 space-y-2 border-2 hover:border-primary"
                              onClick={() => handleMethodSelect(m)}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Wallet className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-medium text-foreground">{m.network}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Min: {formatAmount(m.min_amount)} | Max:{" "}
                                    {m.max_amount ? formatAmount(m.max_amount) : "No limit"}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ----- STEP 2: Enter amount ----- */}
                  {step === "amount" && selectedMethod && (
                    <form onSubmit={handleAmountSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-foreground">
                          Deposit Amount (USDT)
                        </Label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-10 bg-background border-border text-foreground"
                            required
                          />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Min: {formatAmount(selectedMethod.min_amount)} | Max:{" "}
                          {selectedMethod.max_amount ? formatAmount(selectedMethod.max_amount) : "No limit"}
                        </p>

                        {error && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Balance: ${user?.balance ?? "0.00"}</span>
                        <span>Fee: Free</span>
                      </div>

                      <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
                        Continue
                      </Button>

                      <Button variant="ghost" type="button" className="w-full" onClick={() => setStep("method")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Change Network
                      </Button>
                    </form>
                  )}

                  {/* ----- STEP 3: Confirm & proof ----- */}
                  {step === "confirm" && selectedMethod && (
                    <form onSubmit={handleDeposit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-foreground">Confirm Deposit</h3>
                          <p className="text-muted-foreground">
                            {amount} USDT → {selectedMethod.network}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold">{amount} USDT</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Network</p>
                            <p className="font-medium">{selectedMethod.network}</p>
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
                              type="button"
                              variant={proofType === "hash" ? "default" : "outline"}
                              onClick={() => setProofType("hash")}
                            >
                              Tx Hash
                            </Button>
                            <Button
                              type="button"
                              variant={proofType === "image" ? "default" : "outline"}
                              onClick={() => setProofType("image")}
                            >
                              Image
                            </Button>
                          </div>

                          {proofType === "hash" ? (
                            <Input
                              placeholder="Paste transaction hash"
                              value={proofOfPayment}
                              onChange={(e) => setProofOfPayment(e.target.value)}
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
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {proofFile.name}
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
                          className="flex-1"
                          onClick={() => setStep("amount")}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
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