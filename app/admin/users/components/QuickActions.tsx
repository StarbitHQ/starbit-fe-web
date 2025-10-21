import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  DollarSign,
  CheckCircle,
  ExternalLink,
  Calendar,
  Ban,
} from "lucide-react";

export const QuickActions = () => (
  <Card className="bg-muted/30 border-border">
    <CardHeader>
      <CardTitle className="text-foreground">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3 md:grid-cols-3">
        <Button variant="outline" className="justify-start gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
        <Button variant="outline" className="justify-start gap-2">
          <DollarSign className="h-4 w-4" />
          Adjust Balance
        </Button>
        <Button variant="outline" className="justify-start gap-2">
          <CheckCircle className="h-4 w-4" />
          Verify KYC
        </Button>
        <Button variant="outline" className="justify-start gap-2">
          <ExternalLink className="h-4 w-4" />
          View Wallet
        </Button>
        <Button variant="outline" className="justify-start gap-2">
          <Calendar className="h-4 w-4" />
          Activity Log
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-2 text-red-500 hover:text-red-500"
        >
          <Ban className="h-4 w-4" />
          Suspend Account
        </Button>
      </div>
    </CardContent>
  </Card>
);