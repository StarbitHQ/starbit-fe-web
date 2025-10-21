import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { SupportTicket } from "../types/support-ticket";

interface Props {
  tickets: SupportTicket[];
  sortField: keyof SupportTicket;
  sortDir: "asc" | "desc";
  onSort: (field: keyof SupportTicket) => void;
  onView: (id: number) => void;
}

export const SupportTicketsTable = ({ tickets, sortField, sortDir, onSort, onView }: Props) => {
  const headerClass = "text-foreground";

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("subject")} className="gap-1">
                Subject
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>User ID</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("status")} className="gap-1">
                Status
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("created_at")} className="gap-1">
                Created
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="border-border">
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>{ticket.user_id}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onView(ticket.id)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};