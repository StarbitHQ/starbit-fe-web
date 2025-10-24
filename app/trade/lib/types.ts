export interface TradingPair {
  id: number;
  coingecko_id: string;
  base_symbol: string;
  base_name: string;
  quote_symbol: string;
  base_icon_url: string | null;
  min_investment: number;
  max_investment: number;
  min_return_percentage: number;
  max_return_percentage: number;
  investment_duration: number;
}

export interface Trade {
  id: number;
  trading_pair_id: number;
  investment_amount: number;
  expected_return: number;
  status: "pending" | "active" | "completed" | "cancelled";
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  created_at: string;
  tradingPair?: TradingPair;
}

export interface PortfolioSummary {
  active_trades_count: number;
  total_invested: number;
  total_expected_return: number;
  active_investment: number;
  completed_trades_count: number;
  total_returned: number;
  wallet_balance: number;
}

export interface FormData {
  trading_pair_id: number;
  investment_amount: number;
}
