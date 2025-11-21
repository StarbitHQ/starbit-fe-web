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

// Utility: get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
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
    current: string           // ← Now a string: "Bronze", "Silver", etc.
    progress: number
    nextTierThreshold: number
    bonus: string             // e.g. "5% bonus"
  }
}

export default function ReferralPage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setIsLoading(true)
        const token = getCookie("auth_token")
        if (!token) throw new Error("No authentication token found")

        const response = await fetch(`${API_BASE_URL}/api/referrals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch referral data")
        }

        const data = await response.json()

        // Use the exact shape returned by your backend
        setReferralData({
          ...data,
          referral_link: `${window.location.origin}/register?ref=${data.referral_code}`,
          tier: data.tier || {
            current: "Bronze",
            progress: 0,
            nextTierThreshold: 25,
            bonus: "5% bonus",
          },
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load referral data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferralData()
  }, [toast])

  const handleCopy = () => {
    if (!referralData) return
    navigator.clipboard.writeText(referralData.referral_link)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: "twitter" | "whatsapp" | "telegram") => {
    if (!referralData) return
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
        <p className="text-foreground">Loading referral data...</p>
      </div>
    )
  }

  if (!referralData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Failed to load referral data</p>
      </div>
    )
  }

  const { tier } = referralData
  const referralsNeeded = Math.max(tier.nextTierThreshold - referralData.stats.totalReferrals, 0)

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards together</p>
        </div>

        {/* Referred By */}
        {referralData.referred_by && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Referred By</CardTitle>
              <CardDescription>You were invited by this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold">{referralData.referred_by}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralData.stats.totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-2xl font-bold">{referralData.stats.activeReferrals}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">{referralData.stats.totalEarnings}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Bonus</p>
                  <p className="text-2xl font-bold">{referralData.stats.pendingBonus}</p>
                </div>
                <Gift className="h-8 w-8 text-purple-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Referral Link Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>Share this link to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Code</label>
                <div className="flex gap-2">
                  <Input value={referralData.referral_code} readOnly className="font-mono" />
                  <Button onClick={handleCopy} className="gap-2 min-w-[100px]">
                    {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Link</label>
                <div className="flex gap-2">
                  <Input value={referralData.referral_link} readOnly className="text-sm" />
                  <Button onClick={handleCopy} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Share on Social Media</p>
                <div className="grid grid-cols-3 gap-3">
                  <Button onClick={() => handleShare("twitter")} className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90">
                    <Share2 className="h-4 w-4 mr-2" /> Twitter
                  </Button>
                  <Button onClick={() => handleShare("whatsapp")} className="bg-[#25D366] hover:bg-[#25D366]/90">
                    <Share2 className="h-4 w-4 mr-2" /> WhatsApp
                  </Button>
                  <Button onClick={() => handleShare("telegram")} className="bg-[#0088cc] hover:bg-[#0088cc]/90">
                    <Share2 className="h-4 w-4 mr-2" /> Telegram
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/5">
            <CardHeader>
              <CardTitle>Referral Tier</CardTitle>
              <CardDescription>Your current level & progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Current Tier: <strong className="text-foreground">{tier.current}</strong>
                  </span>
                  <span className="font-mono">
                    {referralData.stats.totalReferrals} / {tier.nextTierThreshold}
                  </span>
                </div>
                <Progress value={tier.progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {tier.progress >= 100 ? (
                    "You’ve reached the highest tier!"
                  ) : (
                    <>Need <strong>{referralsNeeded}</strong> more referral{referralsNeeded !== 1 && "s"} to level up</>
                  )}
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
                <p className="text-lg font-bold text-primary">{tier.bonus}</p>
                <p className="text-xs text-muted-foreground mt-1">on all referral initial deposits</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>Users who joined using your link</CardDescription>
          </CardHeader>
          <CardContent>
            {referralData.referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No referrals yet. Start sharing your link!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referralData.referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{ref.name}</p>
                        <p className="text-sm text-muted-foreground">Joined {ref.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{ref.earnings}</p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                      <Badge variant={ref.status === "active" ? "default" : "secondary"}>
                        {ref.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}