// UserRow.tsx
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

  const getStatusBadge = () => {
    if (isBlocked) {
      return (
        <Badge className="bg-red-500 text-white hover:bg-red-600">
          Suspended
        </Badge>
      );
    }
    if (!user.email_verified_at) {
      return (
        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
          Inactive
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500 text-white hover:bg-green-600">
        Active
      </Badge>
    );
  };

  const getKycBadge = () => {
    const status = user.kyc_status;

    if (status === "verified") {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Verified
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Pending
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-gray-400 text-gray-400">
        None
      </Badge>
    );
  };

  const formatBalance = (balance: number | string | null | undefined) => {
    if (balance === null || balance === undefined) return "$0.00";
    const num = typeof balance === "string" ? parseFloat(balance) : balance;
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <TableRow className="border-border hover:bg-muted/50">
      {/* User Info */}
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

      {/* Contact */}
      <TableCell>
        <div className="text-sm">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[150px]" title={user.email}>
              {user.email}
            </span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>{getStatusBadge()}</TableCell>

      {/* KYC */}
      <TableCell>{getKycBadge()}</TableCell>

      {/* Balance */}
      <TableCell className="font-semibold text-foreground">
        {formatBalance(user.account_bal)}
      </TableCell>

      {/* Trades */}
      <TableCell className="text-foreground">{user.trades_count ?? 0}</TableCell>

      {/* Referrals */}
      <TableCell className="text-foreground">
        {user.referred_users_count ?? 0}
      </TableCell>

      {/* Joined Date */}
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

      {/* Actions */}
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