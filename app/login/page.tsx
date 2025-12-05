"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StarBitLogo } from "@/components/starbit-logo";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  
  type Step = "login" | "otp";
  const [step, setStep] = useState<Step>("login");


  const [loginLoading, setLoginLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [tempToken, setTempToken] = useState("");


  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);


  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);


 
  // const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // API now returns { temp_token, message }
      setTempToken(data.temp_token);
      setEmailForOtp(formData.email);
      setStep("otp");
      setCountdown(600); // 10 minutes

      toast({
        title: "Check your email!",
        description: `We sent a 6-digit code to ${formData.email}`,
      });
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  // };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.email || !formData.password) {
    toast({
      title: "Missing fields",
      description: "Please enter your email and password",
      variant: "destructive",
    });
    return;
  }

  setLoginLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // TEMPORARY BYPASS: If backend already returns access_token on login, use it directly
    if (data.access_token) {
      const days = formData.rememberMe ? 30 : 7;
      Cookies.set("auth_token", data.access_token, { expires: days });
      Cookies.set("user_data", JSON.stringify(data.user), { expires: days });
      Cookies.set("user_role", JSON.stringify(data.userRole));

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in",
      });

      if (data.user.type === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
      return; // Skip OTP step entirely
    }

    // FALLBACK: Old behavior (OTP flow) — keep this so switching back is 1-line
    setTempToken(data.temp_token);
    setEmailForOtp(formData.email);
    setStep("otp");
    setCountdown(600);

    toast({
      title: "Check your email!",
      description: `We sent a 6-digit code to ${formData.email}`,
    });
  } catch (err: any) {
    toast({
      title: "Login failed",
      description: err.message || "Invalid email or password",
      variant: "destructive",
    });
  } finally {
    setLoginLoading(false);
  }
};

  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Enter 6 digits",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForOtp,
          otp,
          temp_token: tempToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      const days = formData.rememberMe ? 30 : 7;
      Cookies.set("auth_token", data.access_token, { expires: days });
      Cookies.set("user_data", JSON.stringify(data.user), { expires: days });
      Cookies.set("user_role", JSON.stringify(data.userRole));

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in",
      });

      if (data.user.type === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };


  const resendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForOtp, temp_token: tempToken }),
      });

      if (res.ok) {
        setCountdown(600);
        toast({ title: "Sent!", description: "Check your email for new OTP" });
      } else {
        const err = await res.json();
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setOtpLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // Password-reset (unchanged)
  // ──────────────────────────────────────────────────────
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send reset link");
      }

      toast({
        title: "Reset link sent!",
        description: "Check your email for password reset instructions",
      });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // OTP SCREEN (same UI as register)
  // ──────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/">
              <StarBitLogo />
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify your email</CardTitle>
              <CardDescription>
                We sent a 6-digit code to{" "}
                <span className="font-medium">{emailForOtp}</span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={otpLoading || otp.length !== 6}
                >
                  {otpLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                {countdown > 0 ? (
                  <p className="text-muted-foreground">
                    Resend available in {Math.floor(countdown / 60)}:
                    {String(countdown % 60).padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    onClick={resendOtp}
                    disabled={otpLoading}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // LOGIN FORM (original UI)
  // ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <StarBitLogo />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your StarBit account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-background border-input text-foreground"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Password + Forgot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>

                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-secondary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </DialogTrigger>

                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          Reset Password
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Enter your email address and we'll send you a reset link
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="text-foreground">
                            Email
                          </Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="you@example.com"
                            className="bg-background border-input text-foreground"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>

                        <Button
                          onClick={handlePasswordReset}
                          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          disabled={resetLoading}
                        >
                          {resetLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background border-input text-foreground"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, rememberMe: c as boolean })
                  }
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Stay logged in for 30 days
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loginLoading}
              >
                {loginLoading ? "Sending code..." : "Log In"}
              </Button>

              {/* Sign-up link */}
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}