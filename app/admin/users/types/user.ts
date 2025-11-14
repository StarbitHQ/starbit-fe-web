// ─────────────────────────────────────────────────────────────────────────────
//  Status enums
// ─────────────────────────────────────────────────────────────────────────────
export type UserStatus = "active" | "suspended" | "inactive";
export type KycStatus = "verified" | "pending" | "rejected" | "none";

// ─────────────────────────────────────────────────────────────────────────────
//  Nested objects
// ─────────────────────────────────────────────────────────────────────────────
export interface ReferredBy {
  id: number;
  name: string;
}

export interface Referral {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  created_at: string;
}

export interface Trade {
  id: number;
  type: "buy" | "sell";
  pair: string;
  amount: string;
  price: string;
  total: string;
  status: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Summary structures – always present (never undefined)
// ─────────────────────────────────────────────────────────────────────────────
export interface ReferralSummary {
  total_count: number;
  referrals: Referral[];
}

export interface TradeSummary {
  total_count: number;
  active_count: number;
  total_invested: number;
  trades: Trade[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Base user (used in tables, lists, etc.)
// ─────────────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  balance: string;
  kyc_status: KycStatus;
  created_at: string;
  last_login: string | null;
  referred_by: ReferredBy | null;
  referral_count: number;
  email_verified: boolean;
  two_factor_enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Full user detail (used in dialog)
// ─────────────────────────────────────────────────────────────────────────────
export interface UserDetail extends User {
  /** Always present – never undefined */
  referrals: ReferralSummary;
  trades: TradeSummary;

  /** Optional fields */
  wallet_address: string | null;

  /** Only present for admin users */
  admin?: {
    role: string;
    role_label: string;
    role_level: number;
    is_active: boolean;
  } | null;
}