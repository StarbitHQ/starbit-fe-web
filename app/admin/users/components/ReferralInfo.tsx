import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink } from "lucide-react";
import type { UserDetail } from "../types/user";

interface Props {
  user: UserDetail;
  onView: (id: number) => void;
}

export const ReferralInfo = ({ user, onView }: Props) => {
  if (!user.referred_by) return null;

  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Referred By</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.referred_by.name}</p>
              <p className="text-sm text-muted-foreground">User ID: {user.referred_by.id}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(user.referred_by!.id)}
            className="gap-2"
          >
            <ExternalLink className="h-3 w-3" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};