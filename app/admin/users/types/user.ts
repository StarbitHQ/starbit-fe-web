export type UserStatus = "active" | "suspended" | "inactive";
export type KycStatus = "verified" | "pending" | "rejected" | "none";

export interface ReferredBy {
  id: number;
  name: string;
}

export interface Referral {
  id: number;
  name: string;
  email: string;
  status: string;
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

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  balance: string;
  total_trades: number;
  total_volume: string;
  kyc_status: KycStatus;
  created_at: string;
  last_login: string | null;
  referred_by: ReferredBy | null;
  referral_count: number;
}

export interface UserDetail extends User {
  referrals: Referral[];
  trades: Trade[];
  wallet_address: string | null;
  two_factor_enabled: boolean;
  email_verified: boolean;
}