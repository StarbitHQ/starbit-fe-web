import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, Eye } from "lucide-react";
import type { User } from "../types/user";

interface Props {
  user: User;
  onView: (user: User) => void;
}

export const UserRow = ({ user, onView }: Props) => {
  const isBlocked = user.is_blocked === 1 || user.is_blocked === true;

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

      {/* Status Badge: Active (green) / Suspended (red) */}
      <TableCell>
        <Badge
          variant={isBlocked ? "destructive" : "default"}
          className={
            isBlocked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }
        >
          {isBlocked ? "Suspended" : "Active"}
        </Badge>
      </TableCell>

      {/* KYC Badge */}
      <TableCell>
        <Badge
          variant="outline"
          className={
            user.kyc_status === "verified"
              ? "border-green-500 text-green-500"
              : user.kyc_status === "pending"
              ? "border-yellow-500 text-yellow-500"
              : "border-red-500 text-red-500"
          }
        >
          {user.kyc_status || "Not Started"}
        </Badge>
      </TableCell>

      <TableCell className="font-semibold text-foreground">
        {user.account_bal}
      </TableCell>
      <TableCell className="text-foreground">{user.trades_count}</TableCell>
      <TableCell className="text-foreground">
        {user.referred_users_count}
      </TableCell>

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
          variant="outline"
          onClick={() => onView(user)}
          disabled={!user.id}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};