"use client"

import { useState, useEffect } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Copy, Share2, DollarSign, TrendingUp, Gift, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/api"

// Utility function to get cookie by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface Referral {
  id: number
  name: string
  date: string
  earnings: string
  status: "active" | "inactive"
}

interface ReferralData {
  referral_code: string
  referral_link: string
  referred_by: string | null
  stats: {
    totalReferrals: number
    activeReferrals: number
    totalEarnings: string
    pendingBonus: string
  }
  referrals: Referral[]
  tier: {
    current: "Bronze" | "Silver" | "Gold"
    progress: number
    nextTierThreshold: number | null
    bonus: string
  }
}

export default function ReferralPage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData>({
    referral_code: "",
    referral_link: "",
    referred_by: "",
    stats: {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: "$0.00",
      pendingBonus: "$0.00",
    },
    referrals: [],
    tier: {
      current: "Bronze",
      progress: 0,
      nextTierThreshold: 25,
      bonus: "5% bonus",
    },
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch referral data on component mount
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setIsLoading(true)
        const token = getCookie('auth_token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${API_BASE_URL}/api/referrals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch referral data')
        }

        const data = await response.json()
        setReferralData({
          ...data,
          referral_link: `${window.location.origin}/register?ref=${data.referral_code}`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch referral data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferralData()
  }, [toast])

  const handleCopy = () => {
    navigator.clipboard.writeText(referralData.referral_link)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
      className: "bg-primary text-primary-foreground",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: "twitter" | "whatsapp" | "telegram") => {
    const text = `Join me on StarBit, the best crypto trading platform! Use my referral code: ${referralData.referral_code}`
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralData.referral_link)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + referralData.referral_link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralData.referral_link)}&text=${encodeURIComponent(text)}`,
    }
    window.open(urls[platform], "_blank")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards together</p>
        </div>

        {/* Referred By Card */}
        {referralData.referred_by && (
          <Card className="mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Referred By</CardTitle>
              <CardDescription className="text-muted-foreground">
                You were referred to StarBit by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground">{referralData.referred_by}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-foreground">{referralData.stats.totalReferrals}</p>
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
                  <p className="text-2xl font-bold text-foreground">{referralData.stats.activeReferrals}</p>
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
                  <p className="text-2xl font-bold text-foreground">{referralData.stats.totalEarnings}</p>
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
                  <p className="text-2xl font-bold text-foreground">{referralData.stats.pendingBonus}</p>
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
                  <Input value={referralData.referral_code} readOnly className="bg-muted border-input text-foreground font-mono" />
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
                  <Input value={referralData.referral_link} readOnly className="bg-muted border-input text-foreground text-sm" />
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
                  <span className="text-muted-foreground">Current Tier: {referralData.tier.current}</span>
                  <span className="font-semibold text-foreground">{referralData.stats.totalReferrals}/{referralData.tier.nextTierThreshold || "∞"}</span>
                </div>
                <Progress value={referralData.tier.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {referralData.tier.nextTierThreshold
                    ? `${referralData.tier.nextTierThreshold - referralData.stats.totalReferrals} more referrals to reach ${referralData.tier.current === "Bronze" ? "Silver" : "Gold"} tier`
                    : "Max tier reached"}
                </p>
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
              {referralData.referrals.map((referral) => (
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