// app/p2p/trade/[id]/page.tsx
"use client";

import { use } from "react";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { getEcho } from "@/lib/echo";
import { formatDistanceToNow } from "date-fns";
import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  message: string;
  sender_id: number;
  created_at: string;
  user: { id: number; name: string };
};

type Trade = {
  id: number;
  offer: {
    id: number;
    type: "buy" | "sell";
    coin: string;
    price: string;
    user: { id: number; name: string; verified: boolean };
    payment_methods: string[];
  };
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
  amount_usd: string;
  amount_crypto: string;
  status: "pending" | "paid" | "completed" | "disputed" | "cancelled";
  expires_at: string;
};

export default function TradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tradeId } = use(params);
  const { toast } = useToast();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await api.get<{ id: number }>("/api/user");
        setCurrentUserId(user.id);
      } catch (err) {
        console.error("Failed to load user");
      }
    };
    loadUser();
  }, []);

  // Load trade data
  useEffect(() => {
    if (!currentUserId) return;

    const loadTrade = async () => {
      try {
        const res = await api.get<{ trade: Trade; messages: Message[] }>(
          `/api/p2p/trades/${tradeId}`
        );
        setTrade(res.trade);
        setMessages(res.messages || []);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load trade",
          variant: "destructive",
        });
      }
    };

    loadTrade();
    const interval = setInterval(loadTrade, 15000);
    return () => clearInterval(interval);
  }, [tradeId, currentUserId, toast]);

  // Real-time with Reverb — FIXED
  useEffect(() => {
    if (!trade || !currentUserId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `p2p.trade.${tradeId}`;

    echo
      .join(channelName)
      .here((users: any[]) => {
        console.log("Users online:", users.map(u => u.name));
      })
      .joining((user: any) => {
        if (user.id !== currentUserId) {
          toast({ description: `${user.name} joined the chat` });
        }
      })
      .leaving((user: any) => {
        toast({ description: `${user.name} left the chat` });
      })
      .listen(".P2pMessageSent", (e: { message: Message }) => {
        setMessages((prev) => [...prev, e.message]);
      });

    // CORRECT CLEANUP — use echo.leave(), NOT channel.leave()
    return () => {
      echo.leave(channelName);
    };
  }, [trade, tradeId, currentUserId, toast]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/api/p2p/trades/${tradeId}/messages`, {
        message: newMessage.trim(),
      });
      setNewMessage("");
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message || "Message not sent",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsPaid = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/p2p/trades/${tradeId}/pay`);
      setTrade((t) => (t ? { ...t, status: "paid" } : t));
      toast({ title: "Payment confirmed!", description: "Waiting for seller..." });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const releaseCrypto = async () => {
    setIsReleasing(true);
    try {
      await api.post(`/api/p2p/trades/${tradeId}/release`);
      setTrade((t) => (t ? { ...t, status: "completed" } : t));
      toast({ title: "Crypto released!", description: "Trade completed" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsReleasing(false);
    }
  };

  if (!trade || !currentUserId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isBuyer = trade.buyer.id === currentUserId;
  const isSeller = trade.seller.id === currentUserId;
  const counterpart = isBuyer ? trade.seller : trade.buyer;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {isBuyer ? "Buying from" : "Selling to"} {counterpart.name}
                  {counterpart.verified && <Shield className="h-5 w-5 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trade.offer.payment_methods.map((m) => (
                    <Badge key={m} variant="secondary">{m}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {trade.status === "pending" && isBuyer && (
              <Card className="border-blue-500">
                <CardContent className="pt-6 text-center">
                  <p className="mb-4">Send payment, then confirm</p>
                  <Button size="lg" onClick={markAsPaid} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    I Have Paid
                  </Button>
                </CardContent>
              </Card>
            )}

            {trade.status === "paid" && isSeller && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <p className="text-lg font-medium">Buyer marked as paid</p>
                  <Button size="lg" onClick={releaseCrypto} disabled={isReleasing}>
                    {isReleasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Release {trade.amount_crypto} {trade.offer.coin}
                  </Button>
                </CardContent>
              </Card>
            )}

            {trade.status === "paid" && isBuyer && (
              <Alert className="border-yellow-500">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Waiting for seller to release {trade.amount_crypto} {trade.offer.coin}
                </AlertDescription>
              </Alert>
            )}

            {trade.status === "completed" && (
              <Alert className="border-green-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Trade completed successfully!</AlertDescription>
              </Alert>
            )}

            {/* Chat */}
            <Card>
              <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                  {messages.map((msg) => {
                    const isMine = msg.user.id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${isMine ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                          {!isMine && <p className="text-xs font-medium opacity-80 mb-1">{msg.user.name}</p>}
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim() || isSubmitting}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Trade Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">${trade.amount_usd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You {isBuyer ? "receive" : "send"}</span>
                  <span className="font-semibold">{trade.amount_crypto} {trade.offer.coin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>${Number(trade.offer.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={trade.status === "completed" ? "default" : "secondary"}>
                    {trade.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-primary">
                  <Shield className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Escrow Protected</p>
                    <p className="text-sm">Crypto held safely until confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}