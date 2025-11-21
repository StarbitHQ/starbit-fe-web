import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Eye } from "lucide-react";
import { getStatusBadge } from "../utils/badge";
import type { UserDetail } from "@/types/user";   // your existing types

interface Props {
  // We receive the whole user detail object (or just the referrals part)
  user: UserDetail;
  onView: (referralId: number) => void;
}

export const ReferralList = ({ user, onView }: Props) => {
  // Safely extract the array we really want to render
  const referralItems = user.referrals?.referrals ?? [];

  if (referralItems.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No referrals yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {referralItems.map((item) => {
        const referee = item.referee; // the person who was referred

        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:bg-accent/50 transition-colors"
          >
            {/* Left side – referee info */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{referee.name}</p>
                <p className="text-sm text-muted-foreground">{referee.email}</p>
              </div>
            </div>

            {/* Right side – date, status, earnings, view button */}
            <div className="flex items-center gap-4">
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <div className="flex items-center gap-2 justify-end">
                  <Badge
                    variant="secondary"
                    className={getStatusBadge(item.status)}
                  >
                    {item.status}
                  </Badge>
                  {item.earnings !== "0.00" && (
                    <span className="text-xs font-medium text-green-600">
                      +${item.earnings}
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onView(item.id)}   // referral record id
                // onClick={() => onView(referee.id)} // user id – choose what you need
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};