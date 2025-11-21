import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Clock } from "lucide-react";
import { TradingPair, FormData } from "../lib/types";
import { API_BASE_URL } from "@/lib/api";
import { getCookie } from "../lib/utils";

interface TradeFormProps {
  availablePairs: TradingPair[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export function TradeForm({ availablePairs, loading, fetchData }: TradeFormProps) {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const investmentAmount = watch("investment_amount");
  const tradeDuration = watch("trade_duration");

  const getAuthHeaders = () => {
    const token = getCookie("auth_token");
    if (!token) throw new Error("No authentication token found. Please log in.");
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/trades`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start trade");
      }
      const responseData = await response.json();
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Trade started successfully!",
          className: "bg-primary text-primary-foreground",
        });
        reset();
        setSelectedPair(null);
        await fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start trade",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPair = (pair: TradingPair) => {
    setSelectedPair(pair);
    setValue("trading_pair_id", pair.id);
    // Set default duration to the minimum
    setValue("trade_duration", pair.investment_duration);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <Card className="lg:col-span-1 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Start New Trade
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose a trading pair to invest
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-4">
            Loading trading pairs...
          </p>
        ) : availablePairs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No active trading pairs available.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availablePairs.map((pair) => (
              <div
                key={pair.id}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleSelectPair(pair)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {pair.base_icon_url ? (
                      <img
                        src={pair.base_icon_url}
                        alt={pair.base_symbol}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {pair.base_symbol[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {pair.base_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pair.base_symbol}/{pair.quote_symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${pair.min_investment.toFixed(2)} - $
                      {pair.max_investment.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pair.investment_duration} - {pair.max_investment_duration} days
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedPair && (
          <div onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Selected Pair</Label>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {selectedPair.base_icon_url ? (
                  <img
                    src={selectedPair.base_icon_url}
                    alt={selectedPair.base_symbol}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {selectedPair.base_symbol[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedPair.base_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPair.base_symbol}/{selectedPair.quote_symbol}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trade_duration" className="text-foreground">
                Trade Duration (Days)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="trade_duration"
                  type="number"
                  step="1"
                  placeholder={`${selectedPair.investment_duration} - ${selectedPair.max_investment_duration} days`}
                  className="pl-10 bg-background border-input text-foreground"
                  {...register("trade_duration", {
                    required: "Trade duration is required",
                    min: {
                      value: selectedPair.investment_duration,
                      message: `Minimum duration is ${selectedPair.investment_duration} day${selectedPair.investment_duration !== 1 ? 's' : ''}`,
                    },
                    max: {
                      value: selectedPair.max_investment_duration,
                      message: `Maximum duration is ${selectedPair.max_investment_duration} days`,
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.trade_duration && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.trade_duration.message}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose between {selectedPair.investment_duration} and {selectedPair.max_investment_duration} days
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment_amount" className="text-foreground">
                Investment Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="investment_amount"
                  type="number"
                  step="0.01"
                  placeholder={`Min: ${selectedPair.min_investment.toFixed(2)}`}
                  className="pl-10 bg-background border-input text-foreground"
                  {...register("investment_amount", {
                    required: "Investment amount is required",
                    min: {
                      value: selectedPair.min_investment,
                      message: `Minimum investment is ${selectedPair.min_investment.toFixed(
                        2
                      )}`,
                    },
                    max: {
                      value: selectedPair.max_investment,
                      message: `Maximum investment is ${selectedPair.max_investment.toFixed(
                        2
                      )}`,
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.investment_amount && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.investment_amount.message}
                  </p>
                )}
              </div>
            </div>
            
            {investmentAmount && tradeDuration && selectedPair && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">
                  Duration: {tradeDuration} day{tradeDuration !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expected Return/day: $
                  {(
                    investmentAmount * (selectedPair.min_return_percentage / 100)
                  ).toFixed(2)}{" "}
                  - $
                  {(
                    investmentAmount * (selectedPair.max_return_percentage / 100)
                  ).toFixed(2)}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-2 items-center">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent text-sm h-8 px-3 py-1 rounded-md border-muted-foreground/20 hover:bg-muted/30 transition-colors"
                onClick={() => {
                  setSelectedPair(null);
                  reset();
                }}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleFormSubmit}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-8 px-3 py-1 gap-1 rounded-md transition-colors"
                disabled={submitting || !investmentAmount || !tradeDuration}
              >
                <DollarSign className="h-3 w-3" />
                {submitting ? "Starting..." : "Start Trade"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}