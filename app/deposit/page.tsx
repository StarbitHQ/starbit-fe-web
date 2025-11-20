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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Copy,
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { QRCodeCanvas } from "qrcode.react";

interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  deposit_address: string;
  network?: string;
  min_deposit?: number;
}

export default function DepositPage() {
  const { toast } = useToast();
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "deposit" | "success">("select");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get("auth_token");
        if (!token) throw new Error("Please log in");

        const res = await fetch(`${API_BASE_URL}/api/deposits/methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load");

        const formatted: Cryptocurrency[] = json.data
          .filter((m: any) => m.wallet_address)
          .map((m: any) => ({
            id: m.id,
            name: m.coin_name,
            symbol: m.coin_name,
            deposit_address: m.wallet_address,
            network: m.network,
          }));

        setCryptos(formatted);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMethods();
  }, [toast]);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too large", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setProofImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrypto || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (!txHash.trim() && !proofImage) {
      setError("Provide transaction hash OR upload proof image");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("cryptocurrency_id", selectedCrypto.id.toString());
    formData.append("expected_amount", numAmount.toString());
    formData.append("to_address", selectedCrypto.deposit_address);

    if (txHash.trim()) formData.append("transaction_hash", txHash.trim());
    if (proofImage) formData.append("proof_image", proofImage);

    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/deposits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setLastSubmission({
          crypto: selectedCrypto,
          amount: numAmount,
          txHash: txHash.trim(),
          hasImage: !!proofImage,
          imageUrl: imagePreview,
        });

        toast({
          title: "Success!",
          description: txHash.trim()
            ? "Transaction submitted — auto-verification started"
            : "Proof uploaded — admin will review soon",
        });

        setStep("success");
      } else {
        throw new Error(json.message || "Submission failed");
      }
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep("select");
    setSelectedCrypto(null);
    setAmount("");
    setTxHash("");
    setProofImage(null);
    setImagePreview(null);
    setError("");
    setLastSubmission(null);
  };

  // SUCCESS SCREEN
  if (step === "success" && lastSubmission) {
    const isAuto = !!lastSubmission.txHash;

    return (
      <div className="min-h-screen bg-background">
        <NavHeader isAuthenticated />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              <h1 className="text-4xl font-bold mt-6">Deposit Submitted Successfully!</h1>
              <p className="text-xl text-muted-foreground mt-4">
                {isAuto
                  ? "Your transaction is being verified automatically"
                  : "Your proof has been uploaded — admin will review shortly"}
              </p>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Deposit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cryptocurrency</p>
                    <p className="font-bold text-lg">
                      {lastSubmission.crypto.symbol} ({lastSubmission.crypto.network})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-bold text-2xl text-primary">
                      {lastSubmission.amount} {lastSubmission.crypto.symbol}
                    </p>
                  </div>
                </div>

                {isAuto ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Hash</p>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg font-mono text-sm break-all">
                      {lastSubmission.txHash}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(lastSubmission.txHash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="mt-2" variant="secondary">
                      Auto-Verification Active
                    </Badge>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">Proof Uploaded</p>
                    {lastSubmission.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={lastSubmission.imageUrl}
                          alt="Proof"
                          className="max-h-64 rounded-lg mx-auto border"
                        />
                      </div>
                    )}
                    <Badge className="mt-3" variant="outline">
                      Manual Review Required
                    </Badge>
                  </div>
                )}

                <div className="pt-6 border-t flex gap-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Button onClick={reset} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
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

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <Wallet className="h-9 w-9 text-primary" />
                Deposit Crypto
              </CardTitle>
              <CardDescription>
                Choose on-chain verification or upload proof manually
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {step === "select" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold">Select Cryptocurrency</h3>
                  {cryptos.length === 0 ? (
                    <p className="text-center py-16 text-muted-foreground">No deposit methods available</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {cryptos.map((crypto) => (
                        <Button
                          key={crypto.id}
                          variant="outline"
                          className="h-32 border-2 hover:border-primary transition-all"
                          onClick={() => {
                            setSelectedCrypto(crypto);
                            setStep("deposit");
                          }}
                        >
                          <div className="text-left space-y-2">
                            <div className="font-bold text-xl">{crypto.symbol}</div>
                            {crypto.network && (
                              <Badge variant="secondary">{crypto.network}</Badge>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === "deposit" && selectedCrypto && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <Alert>
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription>
                      Send <strong>only {selectedCrypto.symbol}</strong> ({selectedCrypto.network}) to this address.
                      Wrong network = permanent loss.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted/50 rounded-2xl p-8 text-center space-y-6">
                    <QRCodeCanvas value={selectedCrypto.deposit_address} size={220} level="H" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Deposit Address</p>
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <code className="font-mono text-sm bg-background px-5 py-3 rounded-xl break-all max-w-md">
                          {selectedCrypto.deposit_address}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(selectedCrypto.deposit_address)}>
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount ({selectedCrypto.symbol})</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <Tabs defaultValue="hash" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="hash">Transaction Hash</TabsTrigger>
                      <TabsTrigger value="image">Upload Proof</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hash" className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label>Transaction Hash (optional if uploading image)</Label>
                        <Input
                          placeholder="Paste tx hash (e.g. 0x123...)"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-6">
                      <div
                        className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        {imagePreview ? (
                          <div className="space-y-4">
                            <div className="relative inline-block">
                              <img src={imagePreview} alt="Proof" className="max-h-64 rounded-lg" />
                              <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProofImage(null);
                                  setImagePreview(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Click to change</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                              <p className="font-medium">Drop image here or click to upload</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                JPG, PNG, GIF, WebP · Max 5MB
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={reset} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}