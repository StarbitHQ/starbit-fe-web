import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, KeyRound, Shield, Lock } from "lucide-react";

interface TransactionPinCardProps {
  hasPin: boolean;
  onSetPin: () => void;
  onUpdatePin: () => void;
}

export function TransactionPinCard({ hasPin, onSetPin, onUpdatePin }: TransactionPinCardProps) {
  return (
    <Card className={hasPin ? "border-primary/20 bg-primary/5" : "border-amber-500/30 bg-gradient-to-br from-amber-50/80 to-amber-50/50"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Transaction PIN
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {hasPin ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          )}
          <span>
            {hasPin
              ? "Secure your transfers with PIN protection"
              : "Required for transfers, withdrawals & sensitive actions"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-semibold text-foreground">PIN Status</p>
            <p className="text-sm text-muted-foreground">
              {hasPin
                ? "Your account is protected with transaction PIN"
                : "No PIN set - transfers are blocked until configured"}
            </p>
          </div>
          <Badge className={`${hasPin ? "bg-green-500/10 text-green-700 border-green-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse"} font-semibold`}>
            {hasPin ? "Enabled" : "Not Set"}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {hasPin ? (
            <Button variant="outline" onClick={onUpdatePin} className="gap-2 justify-start">
              <Lock className="h-4 w-4" />
              Change PIN
            </Button>
          ) : (
            <Button
              className="col-span-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 text-primary-foreground shadow-lg"
              size="lg"
              onClick={onSetPin}
            >
              <Shield className="h-4 w-4 mr-2" />
              <span className="font-semibold">Set Transaction PIN Now</span>
            </Button>
          )}
        </div>

        {!hasPin && (
          <div className="p-6 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 pt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Action Required</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  You must set a transaction PIN to:<br />
                  <span className="font-medium">• Send money to other users</span><br />
                  <span className="font-medium">• Withdraw funds</span><br />
                  <span className="font-medium">• Perform other sensitive actions</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}