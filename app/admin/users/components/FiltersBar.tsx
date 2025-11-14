// FiltersBar.tsx
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter, Download, Plus } from "lucide-react";
import { exportUsersCsv } from "../utils/exportCsv";
import { api } from "@/lib/api";
import type { User } from "../types/user";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  kyc: string;
  setKyc: (v: string) => void;
  filteredUsers: User[];
}

export const FiltersBar = ({
  search,
  setSearch,
  status,
  setStatus,
  kyc,
  setKyc,
  filteredUsers,
}: Props) => {
  /* ---------- Add-Admin modal state ---------- */
  const [open, setOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const handleAddAdmin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // ---- Basic client-side validation ----
    if (!adminName.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter the admin's full name",
        variant: "destructive",
      });
      return;
    }
    if (!adminEmail.trim()) {
      toast({
        title: "Missing email",
        description: "Please enter the admin's email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/admin/add-admin", {
        name: adminName.trim(),
        email: adminEmail.trim(),
      });

      // ---- Success toast ----
      toast({
        title: "Admin added!",
        description: `${adminName} (${adminEmail}) has been created`,
      });

      // Reset & close
      setAdminName("");
      setAdminEmail("");
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* ---- Search ---- */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-background border-input text-foreground"
        />
      </div>

      {/* ---- Status filter ---- */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full md:w-[180px] bg-background border-input text-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      {/* ---- KYC filter ---- */}
      <Select value={kyc} onValueChange={setKyc}>
        <SelectTrigger className="w-full md:w-[180px] bg-background border-input text-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="KYC Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All KYC</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>

      {/* ---- Export ---- */}
      <Button
        onClick={() => exportUsersCsv(filteredUsers)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      {/* ---- Add Admin Modal ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the admin's full name and email address.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="admin-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="admin-name"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="admin-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                placeholder="john@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddAdmin}
              disabled={isSubmitting || !adminName.trim() || !adminEmail.trim()}
            >
              {isSubmitting ? "Adding…" : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};