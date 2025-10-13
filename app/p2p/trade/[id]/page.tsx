"use client"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Star, Clock, AlertTriangle, Send, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TradePage() {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [tradeStatus, setTradeStatus] = useState<"pending" | "paid" | "completed">("pending")
  const [messages, setMessages] = useState([
    { id: 1, sender: "seller", text: "Hello! Ready to trade?", time: "2 min ago" },
    { id: 2, sender: "buyer", text: "Yes, let me send the payment now", time: "1 min ago" },
  ])

  const offer = {
    seller: "CryptoKing",
    rating: 4.8,
    trades: 234,
    verified: true,
    coin: "BTC",
    price: "$45,250",
    available: "0.5 BTC",
    limit: "$500 - $5,000",
    payment: ["Bank Transfer", "PayPal"],
  }

  const handleSendMessage = () => {
    if (!message.trim()) return
    setMessages([...messages, { id: messages.length + 1, sender: "buyer", text: message, time: "Just now" }])
    setMessage("")
  }

  const handleMarkPaid = () => {
    setTradeStatus("paid")
    toast({
      title: "Payment marked!",
      description: "Waiting for seller to confirm receipt",
      className: "bg-secondary text-secondary-foreground",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trade Details</h1>
          <p className="text-muted-foreground">Complete your P2P trade securely</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trade Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seller Info */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{offer.seller[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-foreground">{offer.seller}</h3>
                      {offer.verified && <Shield className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-secondary text-secondary" />
                        {offer.rating} rating
                      </span>
                      <span>{offer.trades} completed trades</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Amount */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Enter Amount</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Price: {offer.price} | Limit: {offer.limit}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground">
                    Amount (USD)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background border-input text-foreground"
                  />
                  {amount && (
                    <p className="text-sm text-muted-foreground">
                      You will receive: {(Number.parseFloat(amount) / 45250).toFixed(6)} BTC
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Payment Methods</Label>
                  <div className="flex flex-wrap gap-2">
                    {offer.payment.map((method) => (
                      <Badge key={method} className="bg-primary/10 text-primary hover:bg-primary/20">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                {tradeStatus === "pending" && (
                  <Button
                    onClick={handleMarkPaid}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={!amount}
                  >
                    I Have Paid
                  </Button>
                )}

                {tradeStatus === "paid" && (
                  <Alert className="bg-secondary/10 border-secondary/20">
                    <Clock className="h-4 w-4 text-secondary" />
                    <AlertDescription className="text-foreground">
                      Waiting for seller to confirm payment receipt...
                    </AlertDescription>
                  </Alert>
                )}

                {tradeStatus === "completed" && (
                  <Alert className="bg-primary/10 border-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground">Trade completed successfully!</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Chat with Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "buyer" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender === "buyer"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border text-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background border-input text-foreground resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Escrow Status */}
            <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Escrow Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground font-medium">Funds are secured in escrow</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your crypto is held safely until both parties confirm the trade. This protects both buyer and seller.
                </p>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">14:32</p>
                  <p className="text-sm text-muted-foreground">Complete payment before timer expires</p>
                </div>
              </CardContent>
            </Card>

            {/* Dispute */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you encounter any issues with this trade, you can open a dispute.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent border-destructive text-destructive hover:bg-destructive/10"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Open Dispute
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
