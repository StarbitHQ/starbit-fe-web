"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  DollarSign,
  Ban,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import Cookies from "js-cookie";

type QuickActionsProps = {
  userId: number;
  currentaccount_bal?: string;
  isAdmin?: boolean;
  onUserUpdate?: () => void;
};

type Action = "email" | "account_bal" | "suspend" | "promote" | null;

type Role = {
  key: string;
  label: string;
  level: number;
  description: string;
  can_assign: boolean;
};

const emailSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject too long"),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message too long"),
});

const account_balSchema = z.object({
  account_bal: z.coerce
    .number()
    .refine(
      (v) =>
        !v.toString().includes(".") || v.toString().split(".")[1].length <= 2,
      {
        message: "Max 2 decimal places",
      }
    ),
});

const promoteSchema = z.object({
  role: z.string().min(1, "Please select a role"),
});

export const QuickActions = ({
  userId,
  currentaccount_bal = "0.00",
  isAdmin = false,
  onUserUpdate,
}: QuickActionsProps) => {
  const [active, setActive] = useState<Action>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [fetchingRoles, setFetchingRoles] = useState(false);
  const { toast } = useToast();

  // Get user role from cookie and clean it
  const userRole = Cookies.get("user_role")?.trim().replace(/^["']|["']$/g, '');
  const isSuperAdmin = userRole === "superadmin" || userRole === "super_admin";

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { subject: "", message: "" },
  });

  const account_balForm = useForm<z.infer<typeof account_balSchema>>({
    resolver: zodResolver(account_balSchema),
    defaultValues: { account_bal: parseFloat(currentaccount_bal) },
  });

  const promoteForm = useForm<z.infer<typeof promoteSchema>>({
    resolver: zodResolver(promoteSchema),
    defaultValues: { role: "" },
  });

  // Fetch roles when promote is selected
  useEffect(() => {
    if (active === "promote" && roles.length === 0) {
      const fetchRoles = async () => {
        setFetchingRoles(true);
        try {
          const response = await api.get("/api/admin/roles");
          console.log("Full API response:", response);
          console.log("Current user role:", userRole);
          console.log("Is superadmin:", isSuperAdmin);
          
          // Handle different response structures
          let rolesData;
          if (response.data?.roles) {
            // Response is { data: { roles: [...] } }
            rolesData = response.data.roles;
          } else if (response.roles) {
            // Response is { roles: [...] }
            rolesData = response.roles;
          } else if (Array.isArray(response.data)) {
            // Response is { data: [...] }
            rolesData = response.data;
          } else if (Array.isArray(response)) {
            // Response is [...]
            rolesData = response;
          } else {
            console.error("Invalid response format:", response);
            throw new Error("Invalid response format");
          }
          
          console.log("Extracted roles data:", rolesData);
          
          // If superadmin, show all roles. Otherwise, filter by can_assign
          const availableRoles = isSuperAdmin 
            ? rolesData 
            : rolesData.filter((r: Role) => r.can_assign);
          
          console.log("Available roles to assign:", availableRoles);
          console.log("Setting roles state with:", availableRoles);
          setRoles(availableRoles);
        } catch (e: any) {
          console.error("Error fetching roles:", e);
          console.error("Error details:", e.response?.data);
          toast({
            title: "Error",
            description: e.response?.data?.message || "Failed to load admin roles",
            variant: "destructive",
          });
        } finally {
          setFetchingRoles(false);
        }
      };
      fetchRoles();
    }
  }, [active, roles.length, toast, userRole, isSuperAdmin]);

  // ---------- Handlers ----------
  const handleEmail = async (data: z.infer<typeof emailSchema>) => {
    setLoading(true);
    setResult(null);
    try {
      await api.post(`/api/admin/users/${userId}/email`, {
        subject: data.subject,
        message: data.message,
      });
      setResult("success");
      toast({ title: "Success", description: "Email sent successfully" });
      emailForm.reset();
      setTimeout(() => setActive(null), 1500);
    } catch (e: any) {
      setResult("error");
      toast({
        title: "Error",
        description: e.message ?? "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Inside handleaccount_bal function — this is the key fix:
const handleaccount_bal = async (data: z.infer<typeof account_balSchema>) => {
  setLoading(true);
  setResult(null);
  try {
    await api.patch(`/api/admin/users/${userId}/balance`, {
      account_bal: parseFloat(data.account_bal.toFixed(2)), // Fixed: send account_bal
    });

    setResult("success");
    toast({ title: "Success", description: "account_bal updated successfully" });
    account_balForm.reset({ account_bal: data.account_bal });
    onUserUpdate?.();
    setTimeout(() => setActive(null), 1500);
  } catch (e: any) {
    setResult("error");
    toast({
      title: "Error",
      description: e.response?.data?.message || "Failed to update account_bal",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const handleSuspend = async () => {
    setLoading(true);
    setResult(null);
    try {
      await api.post(`api/admin/users/${userId}/suspend`, {});
      setResult("success");
      toast({ title: "Success", description: "User suspended" });
      onUserUpdate?.();
      setTimeout(() => setActive(null), 1500);
    } catch (e: any) {
      setResult("error");
      toast({
        title: "Error",
        description: e.message ?? "Failed to suspend user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (data: z.infer<typeof promoteSchema>) => {
    setLoading(true);
    setResult(null);
    try {
      await api.post(`/api/admin/${userId}/promote`, {
        role: data.role,
      });
      setResult("success");
      toast({ title: "Success", description: "User role updated successfully!" });
      promoteForm.reset();
      onUserUpdate?.();
      setTimeout(() => setActive(null), 1500);
    } catch (e: any) {
      setResult("error");
      const msg =
        e.response?.data?.error || e.message || "Failed to update user role";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setActive(null);
    setResult(null);
    emailForm.reset();
    account_balForm.reset();
    promoteForm.reset();
  };

  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Action Buttons */}
        {/* ---------- Action Buttons ---------- */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="flex-1 min-w-[140px] justify-center gap-2"
            onClick={() => setActive("email")}
            disabled={loading}
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>

          <Button
            variant="outline"
            className="flex-1 min-w-[140px] justify-center gap-2"
            onClick={() => setActive("account_bal")}
            disabled={loading}
          >
            <DollarSign className="h-4 w-4" />
            Edit Balance
          </Button>

          <Button
            variant="outline"
            className="flex-1 min-w-[140px] justify-center gap-2 text-red-500 hover:text-red-500"
            onClick={() => setActive("suspend")}
            disabled={loading}
          >
            <Ban className="h-4 w-4" />
            Suspend
          </Button>

          <Button
            variant="outline"
            className="flex-1 min-w-[140px] justify-center gap-2 text-green-600 hover:text-green-600"
            onClick={() => setActive("promote")}
            disabled={loading}
          >
            <Shield className="h-4 w-4" />
            {isAdmin ? "Change Role" : "Promote to Admin"}
          </Button>
        </div>

        {/* ---------- Send Email Form ---------- */}
        {active === "email" && (
          <div className="rounded-md border bg-background p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Send Email
            </h4>

            <form
              onSubmit={emailForm.handleSubmit(handleEmail)}
              className="space-y-3"
            >
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  {...emailForm.register("subject")}
                  className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                {emailForm.formState.errors.subject && (
                  <p className="text-sm text-red-500 mt-1">
                    {emailForm.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  {...emailForm.register("message")}
                  rows={4}
                  placeholder="Type your message..."
                  className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                {emailForm.formState.errors.message && (
                  <p className="text-sm text-red-500 mt-1">
                    {emailForm.formState.errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {result && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    result === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result === "success" ? "Sent!" : "Failed"}
                </div>
              )}
            </form>
          </div>
        )}

        {/* ---------- Edit account_bal Form ---------- */}
        {active === "account_bal" && (
          <div className="rounded-md border bg-background p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Edit Balance
            </h4>

            <form
              onSubmit={account_balForm.handleSubmit(handleaccount_bal)}
              className="space-y-3"
            >
              <input
                type="number"
                step="0.01"
                {...account_balForm.register("account_bal")}
                placeholder="0.00"
                className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              {account_balForm.formState.errors.account_bal && (
                <p className="text-sm text-red-500">
                  {account_balForm.formState.errors.account_bal.message}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {result && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    result === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result === "success" ? "Updated!" : "Failed"}
                </div>
              )}
            </form>
          </div>
        )}

        {/* ---------- Suspend Form ---------- */}
        {active === "suspend" && (
          <div className="rounded-md border bg-background p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-1 text-red-600">
              <Ban className="h-4 w-4" />
              Suspend User
            </h4>

            <p className="text-sm text-muted-foreground">
              This will immediately set the user status to{" "}
              <strong>suspended</strong>.
            </p>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSuspend}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm Suspend"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeForm}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {result && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  result === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {result === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {result === "success" ? "Suspended!" : "Failed"}
              </div>
            )}
          </div>
        )}

        {/* ---------- Promote to Admin Form ---------- */}
        {active === "promote" && (
          <div className="rounded-md border bg-background p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-1 text-green-600">
              <Shield className="h-4 w-4" />
              {isAdmin ? "Change User Role" : "Promote to Admin"}
            </h4>

            <form
              onSubmit={promoteForm.handleSubmit(handlePromote)}
              className="space-y-3"
            >
              {fetchingRoles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm">Loading roles...</span>
                </div>
              ) : roles.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">
                    {isSuperAdmin 
                      ? "No roles available to assign." 
                      : "You don't have permission to assign any admin roles."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Debug: isSuperAdmin={isSuperAdmin ? "true" : "false"}, roles.length={roles.length}, userRole={userRole}
                  </p>
                </div>
              ) : (
                <>
                  <select
                    {...promoteForm.register("role")}
                    className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.key} value={role.key}>
                        {role.label}{" "}
                        {role.description && `— ${role.description}`}
                      </option>
                    ))}
                  </select>
                  {promoteForm.formState.errors.role && (
                    <p className="text-sm text-red-500">
                      {promoteForm.formState.errors.role.message}
                    </p>
                  )}
                  
                  {isSuperAdmin && (
                    <p className="text-xs text-muted-foreground">
                      As a superadmin, you can assign any role including other superadmin roles.
                    </p>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || fetchingRoles || roles.length === 0}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isAdmin ? (
                    "Update Role"
                  ) : (
                    "Promote"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {result && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    result === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result === "success" ? (isAdmin ? "Role Updated!" : "Promoted!") : "Failed"}
                </div>
              )}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};