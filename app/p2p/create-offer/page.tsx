// app/p2p/create-offer/page.tsx
"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CreateOfferPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "buy" as "buy" | "sell",
    coin: "",
    price: "",
    minLimit: "",
    maxLimit: "",
    duration: "30",
    terms: "",
    paymentMethods: [] as string[],
  });

  const paymentOptions = [
    "Bank Transfer",
    "PayPal",
    "Wise",
    "Venmo",
    "Cash App",
    "Zelle",
  ];

  const togglePaymentMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethods.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one payment method",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/api/p2p/offers", {
        type: formData.type,
        coin: formData.coin.toUpperCase(),
        price: Number(formData.price),
        min_amount: Number(formData.minLimit),
        max_amount: Number(formData.maxLimit),
        available_amount: 999, 
        payment_methods: formData.paymentMethods,
        payment_window_minutes: Number(formData.duration),
        terms: formData.terms || null,
      });

      toast({
        title: "Success!",
        description: "Your P2P offer is now live",
      });

      router.push("/p2p");
    } catch (err: any) {
      console.error("Create offer failed:", err);
      toast({
        title: "Failed to create offer",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/p2p">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to P2P
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create P2P Offer
          </h1>
          <p className="text-muted-foreground">
            Set up your buy or sell offer
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Offer Details</CardTitle>
            <CardDescription className="text-muted-foreground">
              Fill in the details for your trading offer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Offer Type */}
              <div className="space-y-2">
                <Label className="text-foreground">Offer Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as "buy" | "sell" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">I want to buy crypto</SelectItem>
                    <SelectItem value="sell">I want to sell crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Coin */}
              <div className="space-y-2">
                <Label htmlFor="coin" className="text-foreground">
                  Cryptocurrency
                </Label>
                <Select
                  value={formData.coin}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, coin: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                    <SelectItem value="xrp">Ripple (XRP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">
                  Price per coin (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="45250.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Limits */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minLimit" className="text-foreground">
                    Minimum amount (USD)
                  </Label>
                  <Input
                    id="minLimit"
                    type="number"
                    placeholder="500"
                    value={formData.minLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, minLimit: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLimit" className="text-foreground">
                    Maximum amount (USD)
                  </Label>
                  <Input
                    id="maxLimit"
                    type="number"
                    placeholder="10000"
                    value={formData.maxLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxLimit: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label className="text-foreground">Payment Methods</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentOptions.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={method}
                        checked={formData.paymentMethods.includes(method)}
                        onCheckedChange={() => togglePaymentMethod(method)}
                      />
                      <label
                        htmlFor={method}
                        className="text-sm font-medium leading-none cursor-pointer select-none"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Window */}
              <div className="space-y-2">
                <Label className="text-foreground">Payment Window</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, duration: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-foreground">
                  Terms & Conditions (optional)
                </Label>
                <Textarea
                  id="terms"
                  placeholder="e.g. Only accept payments from verified accounts..."
                  value={formData.terms}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, terms: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !formData.coin || formData.paymentMethods.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Offer...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Offer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}