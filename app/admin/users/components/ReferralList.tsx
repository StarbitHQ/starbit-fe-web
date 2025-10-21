import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Eye } from "lucide-react";
import { getStatusBadge } from "../utils/badge";
import type { Referral } from "../types/user";

interface Props {
  referrals: Referral[];
  onView: (id: number) => void;
}

export const ReferralList = ({ referrals, onView }: Props) => {
  if (referrals.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No referrals yet</p>;
  }

  return (
    <div className="space-y-3">
      {referrals.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
              <Badge className={getStatusBadge(r.status)} size="sm">
                {r.status}
              </Badge>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onView(r.id)}>
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};