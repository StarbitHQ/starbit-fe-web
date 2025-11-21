import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StarBitLogo } from "@/components/starbit-logo"
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react"


export default function LandingPage() {
  return (
    
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <StarBitLogo />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Next-Gen Crypto Trading
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Trade Crypto with{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
              Join the most advanced P2P crypto trading platform. Copy successful traders, earn referral bonuses, and
              trade securely with escrow protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 text-base bg-transparent">
                  Login to Trade
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Secure Escrow</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All trades protected by smart escrow system. Your funds are safe until both parties confirm.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">P2P Trading</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Trade directly with other users. Set your own prices and payment methods.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Referral Rewards</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn bonuses by inviting friends. Build your network and grow your earnings.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Instant Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quick KYC process. Get verified and start trading in minutes, not days.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20 p-8 md:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Ready to Start Trading?</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of traders already using StarBit for secure P2P crypto trading.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <StarBitLogo className="h-6" />
            <p className="text-sm text-muted-foreground">© 2025 StarBit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
