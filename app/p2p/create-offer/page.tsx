"use client"

import type React from "react"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateOfferPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    type: "buy",
    coin: "",
    price: "",
    minLimit: "",
    maxLimit: "",
    duration: "30",
    terms: "",
    paymentMethods: [] as string[],
  })

  const paymentOptions = ["Bank Transfer", "PayPal", "Wise", "Venmo", "Cash App", "Zelle"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Offer created!",
      description: "Your P2P offer is now live",
      className: "bg-primary text-primary-foreground",
    })
    router.push("/p2p")
  }

  const togglePaymentMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/p2p">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to P2P
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create P2P Offer</h1>
          <p className="text-muted-foreground">Set up your buy or sell offer</p>
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
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">I want to buy</SelectItem>
                    <SelectItem value="sell">I want to sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Coin Selection */}
              <div className="space-y-2">
                <Label htmlFor="coin" className="text-foreground">
                  Cryptocurrency
                </Label>
                <Select value={formData.coin} onValueChange={(value) => setFormData({ ...formData, coin: value })}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Select coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="xrp">Ripple (XRP)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="45250.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-background border-input text-foreground"
                  required
                />
              </div>

              {/* Limits */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minLimit" className="text-foreground">
                    Minimum Limit (USD)
                  </Label>
                  <Input
                    id="minLimit"
                    type="number"
                    placeholder="500"
                    value={formData.minLimit}
                    onChange={(e) => setFormData({ ...formData, minLimit: e.target.value })}
                    className="bg-background border-input text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLimit" className="text-foreground">
                    Maximum Limit (USD)
                  </Label>
                  <Input
                    id="maxLimit"
                    type="number"
                    placeholder="5000"
                    value={formData.maxLimit}
                    onChange={(e) => setFormData({ ...formData, maxLimit: e.target.value })}
                    className="bg-background border-input text-foreground"
                    required
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label className="text-foreground">Payment Methods</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {paymentOptions.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={method}
                        checked={formData.paymentMethods.includes(method)}
                        onCheckedChange={() => togglePaymentMethod(method)}
                      />
                      <label htmlFor={method} className="text-sm text-foreground cursor-pointer">
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground">
                  Payment Window (minutes)
                </Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger className="bg-background border-input text-foreground">
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
                  Terms & Conditions (Optional)
                </Label>
                <Textarea
                  id="terms"
                  placeholder="Enter any specific terms or requirements for this trade..."
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="bg-background border-input text-foreground resize-none"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Create Offer
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
