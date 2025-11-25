// app/upgrade/page.tsx
"use client";

import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, Shield, HeadphonesIcon, TrendingUp, Star, ArrowRight } from "lucide-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const tiers = [
  {
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    badge: null,
    popular: false,
    features: [
      "0.20% trading fee",
      "$10,000 daily withdrawal",
      "Standard support",
      "Basic API rate",
      "P2P trading",
    ],
    gradient: "from-gray-500/20 to-gray-600/20",
    icon: Star,
    iconColor: "text-gray-500",
  },
  {
    name: "VIP 1",
    priceMonthly: 29,
    priceAnnual: 290,
    save: "Save $58",
    badge: "Best Value",
    popular: true,
    features: [
      "0.12% trading fee",
      "$100,000 daily withdrawal",
      "Priority email support",
      "2x API rate limit",
      "Early access to new coins",
      "Monthly bonus airdrop",
    ],
    gradient: "from-blue-500/20 to-blue-600/20",
    icon: Crown,
    iconColor: "text-blue-500",
  },
  {
    name: "VIP 2",
    priceMonthly: 99,
    priceAnnual: 950,
    save: "Save $238",
    badge: "Most Popular",
    popular: true,
    features: [
      "0.08% trading fee",
      "$500,000 daily withdrawal",
      "24/7 live chat support",
      "5x API rate limit",
      "Exclusive trading signals",
      "Personal account manager",
      "VIP-only events",
    ],
    gradient: "from-purple-500/20 to-purple-600/20",
    icon: Zap,
    iconColor: "text-purple-500",
  },
  {
    name: "Diamond",
    priceMonthly: 299,
    priceAnnual: 2990,
    save: "Save $598",
    badge: "Elite",
    popular: false,
    features: [
      "0.04% trading fee (lowest)",
      "Unlimited withdrawals",
      "Dedicated VIP manager",
      "10x API rate",
      "Custom trading tools",
      "Invite to private alpha",
      "Lifetime benefits",
      "Physical Diamond card",
    ],
    gradient: "from-cyan-400/30 via-blue-500/30 to-purple-600/30",
    icon: Shield,
    iconColor: "text-cyan-400",
  },
];

export default function UpgradePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [currentTier, setCurrentTier] = useState<string>("Free");

  useEffect(() => {
    const userData = Cookies.get("user_data funcionan");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentTier(user.vip_level || "Free");
    }
  }, []);

  const isCurrentTier = (tierName: string) => currentTier === tierName;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upgrade to <span className="text-primary">VIP</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock lower fees, higher limits, and exclusive perks trusted by top traders
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3 bg-muted/50 rounded-full p-1">
            <Button
              variant={billing === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBilling("monthly")}
              className="rounded-full"
            >
              Monthly
            </Button>
            <Button
              variant={billing === "annual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBilling("annual")}
              className="rounded-full relative"
            >
              Annual
              <Badge className="absolute -top-2 -right-3 text-xs" variant="secondary">
                Save up to 20%
              </Badge>
            </Button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const price = billing === "annual" ? tier.priceAnnual : tier.priceMonthly;
            const perMonth = billing === "annual" && tier.priceMonthly > 0
              ? `$${(tier.priceAnnual / 12).toFixed(0)}/mo`
              : null;

            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl
                  ${tier.popular ? "ring-2 ring-primary" : "border-border"}
                  ${isCurrentTier(tier.name) ? "ring-4 ring-green-500/50" : ""}
                `}
              >
                {/* Popular Badge */}
                {tier.badge && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-bl-lg">
                    {tier.badge}
                  </div>
                )}

                {/* Current Tier Badge */}
                {isCurrentTier(tier.name) && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-xs font-bold rounded-br-lg flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Current Plan
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${tier.gradient}`} />

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Icon className={`h-10 w-10 ${tier.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    {price === 0 ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground">
                          {billing === "annual" ? "/year" : "/month"}
                        </span>
                        {perMonth && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {perMonth} billed annually
                          </p>
                        )}
                        {tier.save && billing === "annual" && (
                          <Badge variant="secondary" className="mt-2">
                            {tier.save}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-6" />
                  <ul className="space-y-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-8 h-12 text-lg font-semibold"
                    variant={
                      isCurrentTier(tier.name)
                        ? "outline"
                        : tier.popular
                        ? "default"
                        : "secondary"
                    }
                    disabled={isCurrentTier(tier.name)}
                  >
                    {isCurrentTier(tier.name) ? (
                      "Current Plan"
                    ) : price === 0 ? (
                      "Downgrade"
                    ) : (
                      <>
                        Upgrade Now <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Footer */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Over <strong className="text-foreground">50,000+</strong> traders trust our VIP program
          </p>
          <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5 text-primary" />
              24/7 VIP support
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}