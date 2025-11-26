// app/p2p/page.tsx
"use client";

import { useEffect, useState } from "react";
import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle, TrendingUp, TrendingDown, Star, Shield, Plus, Search, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Offer = {
  id: number;
  type: "buy" | "sell";
  user: { name: string; verified: boolean; rating: number; trades_count: number };
  coin: string;
  price: string;
  available_amount: string;
  min_amount: string;
  max_amount: string;
  payment_methods: string[];
};

type ActiveTrade = {
  id: number;
  offer: {
    coin: string;
    type: "buy" | "sell";
    user: { name: string };
  };
  buyer: { name: string };
  seller: { name: string };
  amount_usd: string;
  amount_crypto: string;
  status: "pending" | "paid" | "completed" | "disputed" | "cancelled";
  unread_messages?: number;
  expires_at: string;
};

export default function P2PPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("all");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myTrades, setMyTrades] = useState<ActiveTrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [amountUsd, setAmountUsd] = useState("");
  const [creatingTrade, setCreatingTrade] = useState(false);

  // Load public offers
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCoin !== "all") params.append("coin", selectedCoin.toUpperCase());
    if (searchTerm) params.append("search", searchTerm);

    api.get<Offer[]>(`/api/p2p/offers?${params}`).then(setOffers).catch(() => {
      toast({ title: "Failed to load offers", variant: "destructive" });
    });
  }, [searchTerm, selectedCoin, toast]);

  // Load my active trades
  useEffect(() => {
    const loadMyTrades = async () => {
      try {
        const trades = await api.get<ActiveTrade[]>("/api/p2p/my-trades");
        setMyTrades(trades);
      } catch (err: any) {
        if (err.message !== "Unauthorized") {
          toast({ title: "Failed to load your trades", variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };
    loadMyTrades();
  }, [toast]);

  const openTradeModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setAmountUsd(offer.min_amount);
    setModalOpen(true);
  };

  const startTrade = async () => {
    if (!selectedOffer || !amountUsd || creatingTrade) return;

    const amount = Number(amountUsd);
    const min = Number(selectedOffer.min_amount);
    const max = Number(selectedOffer.max_amount);

    if (amount < min || amount > max) {
      toast({ title: "Invalid amount", description: `$${min} – $${max}`, variant: "destructive" });
      return;
    }

    setCreatingTrade(true);
    try {
      const res = await api.post(`/api/p2p/offers/${selectedOffer.id}/trade`, { amount_usd: amount });
      window.location.href = `/p2p/trade/${res.trade_id}`;
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not create trade", variant: "destructive" });
    } finally {
      setCreatingTrade(false);
      setModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">P2P Trading</h1>
            <p className="text-muted-foreground">Buy and sell crypto directly with users</p>
          </div>
          <Link href="/p2p/create-offer">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="buy" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="buy" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy Crypto
            </TabsTrigger>
            <TabsTrigger value="sell" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell Crypto
            </TabsTrigger>
            <TabsTrigger value="my-trades" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              My Trades{" "}
              {myTrades.length > 0 && (
                <Badge variant="destructive" className="ml-1 px-2">
                  {myTrades.filter(t => (t.unread_messages || 0) > 0).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* BUY CRYPTO */}
          <TabsContent value="buy" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search traders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger><SelectValue placeholder="All Coins" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coins</SelectItem>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                  <SelectItem value="usdt">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {offers.filter(o => o.type === "sell").map(offer => (
              <OfferCard key={offer.id} offer={offer} action="buy" onClick={() => openTradeModal(offer)} />
            ))}
          </TabsContent>

          {/* SELL CRYPTO */}
          <TabsContent value="sell" className="space-y-4">
            {offers.filter(o => o.type === "buy").map(offer => (
              <OfferCard key={offer.id} offer={offer} action="sell" onClick={() => openTradeModal(offer)} />
            ))}
          </TabsContent>

          {/* MY TRADES */}
          <TabsContent value="my-trades" className="space-y-4">
            {myTrades.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No active trades yet</p>
                  <p className="text-sm mt-2">Create an offer or accept one to get started</p>
                </CardContent>
              </Card>
            ) : (
              myTrades.map(trade => (
                <Link key={trade.id} href={`/p2p/trade/${trade.id}`}>
                  <Card className="hover:border-primary transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {trade.offer.type === "sell" ? "Selling" : "Buying"} {trade.offer.coin}
                            </h3>
                            <Badge variant={trade.status === "paid" ? "default" : trade.status === "completed" ? "secondary" : "outline"}>
                              {trade.status}
                            </Badge>
                            {(trade.unread_messages || 0) > 0 && (
                              <Badge variant="destructive" className="animate-pulse">
                                {trade.unread_messages} new
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            With {trade.offer.type === "sell" ? trade.buyer.name : trade.seller.name}
                          </p>
                          <p className="text-sm mt-2">
                            <strong>${trade.amount_usd}</strong> → {trade.amount_crypto} {trade.offer.coin}
                          </p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Trade Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOffer?.type === "sell" ? "Buy" : "Sell"} {selectedOffer?.coin}
            </DialogTitle>
            <DialogDescription>From {selectedOffer?.user.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              placeholder={`Min: $${selectedOffer?.min_amount} | Max: $${selectedOffer?.max_amount}`}
            />
            {selectedOffer && amountUsd && (
              <p className="text-sm text-muted-foreground mt-2">
                You will {selectedOffer.type === "sell" ? "receive" : "send"}{" "}
                {(Number(amountUsd) / Number(selectedOffer.price)).toFixed(6)} {selectedOffer.coin}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startTrade} disabled={creatingTrade || !amountUsd}>
              {creatingTrade ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm Trade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reusable Offer Card
function OfferCard({ offer, action, onClick }: { offer: Offer; action: "buy" | "sell"; onClick: () => void }) {
  return (
    <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {offer.user.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{offer.user.name}</h3>
                {offer.user.verified && <Shield className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  {offer.user.rating}
                </span>
                <span>{offer.user.trades_count} trades</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {offer.payment_methods.map(m => (
                  <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right space-y-2">
            <p className="text-2xl font-bold">${Number(offer.price).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              Limit: ${Number(offer.min_amount).toLocaleString()} – ${Number(offer.max_amount).toLocaleString()}
            </p>
            <Button
              size="lg"
              className={action === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              {action === "buy" ? "Buy" : "Sell"} {offer.coin}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}