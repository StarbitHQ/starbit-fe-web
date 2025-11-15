"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavHeader } from "@/components/admin-nav";
import { API_BASE_URL } from "@/lib/api";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Loader2, Search, ArrowUpDown, DollarSign, User, Calendar, Activity } from "lucide-react";

interface Trade {
  id: number;
  user_name: string;
  user_email: string;
  account_bal: string;
  investment_amount: string;
  expected_return: string;
  status: string;
  notes: string;
  created_at: string;
  trading_pair?: {
    base_symbol: string;
    quote_symbol: string;
  };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const fetchTrades = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("auth_token");
      if (!token) throw new Error("Unauthorized");

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "15",
        sort_by: sortBy,
        sort_dir: sortDir,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/trades?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch trades");

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setTrades(json.data);
      setMeta(json.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [page, sortBy, sortDir, statusFilter, search]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: any; label: string; icon: any }> = {
      active: { variant: "default", label: "Active", icon: Activity },
      pending: { variant: "secondary", label: "Pending", icon: Clock },
      completed: { variant: "default", label: "Completed", icon: CheckCircle2 },
      cancelled: { variant: "destructive", label: "Cancelled", icon: XCircle },
    };
    const config = map[status] || map.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Trades</h1>
          <p className="text-muted-foreground">View and manage all trading activity</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by user, email, or notes..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trades List</CardTitle>
            <CardDescription>
              {meta && `${meta.total} total trades`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <p className="text-center text-destructive py-8">{error}</p>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => { setSortBy('user_name'); setSortDir(sortBy === 'user_name' && sortDir === 'asc' ? 'desc' : 'asc'); }}>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" /> User
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Pair</TableHead>
                        <TableHead className="text-right cursor-pointer" onClick={() => { setSortBy('investment_amount'); setSortDir(sortBy === 'investment_amount' && sortDir === 'asc' ? 'desc' : 'asc'); }}>
                          <div className="flex items-center gap-1 justify-end">
                            <DollarSign className="h-4 w-4" /> Amount
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Return</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => { setSortBy('status'); setSortDir(sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc'); }}>
                          <div className="flex items-center gap-1">
                            Status
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => { setSortBy('created_at'); setSortDir(sortBy === 'created_at' && sortDir === 'asc' ? 'desc' : 'asc'); }}>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Date
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{trade.user_name}</p>
                              <p className="text-sm text-muted-foreground">{trade.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {trade.trading_pair?.base_symbol || "BTC"}/{trade.trading_pair?.quote_symbol || "USDT"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${parseFloat(trade.investment_amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            +${parseFloat(trade.expected_return).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(trade.status)}</TableCell>
                          <TableCell>
                            <span className="font-medium">${parseFloat(trade.account_bal).toFixed(2)}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(trade.created_at), "MMM d, yyyy h:mm a")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {(meta.current_page - 1) * meta.per_page + 1} to{" "}
                      {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                        disabled={page === meta.last_page}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}