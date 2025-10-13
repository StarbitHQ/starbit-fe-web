"use client"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Copy, Share2, DollarSign, TrendingUp, Gift, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReferralPage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const referralCode = "STARBIT-ALEX2024"
  const referralLink = `https://starbit.app/register?ref=${referralCode}`

  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: "$245.50",
    pendingBonus: "$45.00",
  }

  const referrals = [
    { id: 1, name: "User #1234", status: "active", earnings: "$25.50", date: "2 days ago" },
    { id: 2, name: "User #5678", status: "active", earnings: "$18.00", date: "5 days ago" },
    { id: 3, name: "User #9012", status: "pending", earnings: "$0.00", date: "1 week ago" },
    { id: 4, name: "User #3456", status: "active", earnings: "$32.00", date: "2 weeks ago" },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
      className: "bg-primary text-primary-foreground",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const text = `Join me on StarBit, the best crypto trading platform! Use my referral code: ${referralCode}`
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + referralLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
    }
    window.open(urls[platform as keyof typeof urls], "_blank")
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards together</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeReferrals}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalEarnings}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Bonus</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingBonus}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Gift className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Referral Link Card */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Your Referral Link</CardTitle>
              <CardDescription className="text-muted-foreground">
                Share this link with friends to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Referral Code</label>
                <div className="flex gap-2">
                  <Input value={referralCode} readOnly className="bg-muted border-input text-foreground font-mono" />
                  <Button
                    onClick={handleCopy}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 min-w-[100px]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Link</label>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="bg-muted border-input text-foreground text-sm" />
                  <Button onClick={handleCopy} variant="outline" className="bg-transparent gap-2">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Share on Social Media</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleShare("twitter")}
                    className="flex-1 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare("whatsapp")}
                    className="flex-1 bg-[#25D366] text-white hover:bg-[#25D366]/90 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => handleShare("telegram")}
                    className="flex-1 bg-[#0088cc] text-white hover:bg-[#0088cc]/90 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Telegram
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Referral Progress</CardTitle>
              <CardDescription className="text-muted-foreground">Your journey to the next tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Current Tier: Bronze</span>
                  <span className="font-semibold text-foreground">12/25</span>
                </div>
                <Progress value={48} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">13 more referrals to reach Silver tier</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <span className="text-sm text-foreground">Bronze (0-24)</span>
                  <Badge className="bg-[#CD7F32] text-white">5% bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <span className="text-sm text-foreground">Silver (25-49)</span>
                  <Badge className="bg-[#C0C0C0] text-white">10% bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <span className="text-sm text-foreground">Gold (50+)</span>
                  <Badge className="bg-[#FFD700] text-black">15% bonus</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Referrals</CardTitle>
            <CardDescription className="text-muted-foreground">Track your referred users and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{referral.earnings}</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                    <Badge
                      variant={referral.status === "active" ? "default" : "secondary"}
                      className={
                        referral.status === "active"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                      }
                    >
                      {referral.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
