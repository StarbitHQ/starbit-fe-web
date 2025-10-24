import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, History, Settings } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card className="lg:col-span-3 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
        <CardDescription className="text-muted-foreground">
          Navigate to key features
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link href="/dashboard/portfolio">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <Wallet className="h-4 w-4 text-primary" />
            View Portfolio
          </Button>
        </Link>
        <Link href="/dashboard/trade-history">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <History className="h-4 w-4 text-secondary" />
            Trade History
          </Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <Settings className="h-4 w-4 text-primary" />
            Account Settings
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
