import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, Eye } from "lucide-react";
import { getStatusBadge, getKycBadge } from "../utils/badge";
import type { User } from "../types/user";

interface Props {
  user: User;
  onView: (user: User) => void;  
}

export const UserRow = ({ user, onView }: Props) => {
  return (
    <TableRow className="border-border hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[150px]">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
      </TableCell>

      <TableCell>
        <Badge className={getKycBadge(user.kyc_status)}>
          {user.kyc_status}
        </Badge>
      </TableCell>

      <TableCell className="font-semibold text-foreground">
        {user.balance}
      </TableCell>
      <TableCell className="text-foreground">{user.total_trades}</TableCell>
      <TableCell className="text-foreground">{user.referral_count}</TableCell>

      <TableCell>
        <div className="text-sm">
          <p className="text-foreground">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          {user.last_login && (
            <p className="text-xs text-muted-foreground">
              Last: {new Date(user.last_login).toLocaleDateString()}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Button
          size="sm"
          onClick={() => onView(user)}
          disabled={!user.id} 
          className="..."
        >
          <Eye className="h-3 w-3" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};
