"use client"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Star, Shield, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function P2PPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCoin, setSelectedCoin] = useState("all")
  const [selectedFiat, setSelectedFiat] = useState("all")

  const offers = [
    {
      id: 1,
      type: "buy",
      seller: "CryptoKing",
      rating: 4.8,
      trades: 234,
      verified: true,
      coin: "BTC",
      price: "$45,250",
      available: "0.5 BTC",
      limit: "$500 - $5,000",
      payment: ["Bank Transfer", "PayPal"],
    },
    {
      id: 2,
      type: "sell",
      seller: "TraderPro",
      rating: 4.9,
      trades: 567,
      verified: true,
      coin: "ETH",
      price: "$2,850",
      available: "5.2 ETH",
      limit: "$200 - $3,000",
      payment: ["Bank Transfer", "Wise"],
    },
    {
      id: 3,
      type: "buy",
      seller: "BitMaster",
      rating: 4.7,
      trades: 189,
      verified: true,
      coin: "BTC",
      price: "$45,180",
      available: "0.8 BTC",
      limit: "$1,000 - $10,000",
      payment: ["Bank Transfer"],
    },
    {
      id: 4,
      type: "sell",
      seller: "CoinDealer",
      rating: 4.6,
      trades: 423,
      verified: false,
      coin: "XRP",
      price: "$0.62",
      available: "10,000 XRP",
      limit: "$100 - $2,000",
      payment: ["PayPal", "Venmo"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">P2P Trading</h1>
            <p className="text-muted-foreground">Trade directly with other users</p>
          </div>
          <Link href="/p2p/create-offer">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search traders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Select Coin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coins</SelectItem>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                  <SelectItem value="xrp">Ripple (XRP)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedFiat} onValueChange={setSelectedFiat}>
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Fiat Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Offers Tabs */}
        <Tabs defaultValue="buy" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted">
            <TabsTrigger value="buy" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy Offers
            </TabsTrigger>
            <TabsTrigger value="sell" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell Offers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            {offers
              .filter((offer) => offer.type === "buy")
              .map((offer) => (
                <Card key={offer.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-primary">{offer.seller[0]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{offer.seller}</h3>
                            {offer.verified && <Shield className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-secondary text-secondary" />
                              {offer.rating}
                            </span>
                            <span>{offer.trades} trades</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {offer.payment.map((method) => (
                              <Badge key={method} variant="outline" className="text-xs">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Price</p>
                          <p className="text-xl font-bold text-foreground">{offer.price}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Available</p>
                          <p className="font-semibold text-foreground">{offer.available}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Limit</p>
                          <p className="text-sm text-foreground">{offer.limit}</p>
                        </div>
                        <Link href={`/p2p/trade/${offer.id}`}>
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]">
                            Trade
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            {offers
              .filter((offer) => offer.type === "sell")
              .map((offer) => (
                <Card key={offer.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-secondary">{offer.seller[0]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{offer.seller}</h3>
                            {offer.verified && <Shield className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-secondary text-secondary" />
                              {offer.rating}
                            </span>
                            <span>{offer.trades} trades</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {offer.payment.map((method) => (
                              <Badge key={method} variant="outline" className="text-xs">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Price</p>
                          <p className="text-xl font-bold text-foreground">{offer.price}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Available</p>
                          <p className="font-semibold text-foreground">{offer.available}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Limit</p>
                          <p className="text-sm text-foreground">{offer.limit}</p>
                        </div>
                        <Link href={`/p2p/trade/${offer.id}`}>
                          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 min-w-[100px]">
                            Trade
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
