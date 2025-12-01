import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, KeyRound } from "lucide-react";

interface SetPinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pin: string;
  confirmPin: string;
  isSubmitting: boolean;
  onPinChange: (pin: string) => void;
  onConfirmPinChange: (pin: string) => void;
  onSubmit: () => void;
}

export function SetPinModal({
  open,
  onOpenChange,
  pin,
  confirmPin,
  isSubmitting,
  onPinChange,
  onConfirmPinChange,
  onSubmit,
}: SetPinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mb-6">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Set Transaction PIN</DialogTitle>
          <p className="text-sm text-muted-foreground">Create a 4-6 digit PIN for secure transactions</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="pin">Create your PIN</Label>
            <Input
              id="pin"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => onPinChange(e.target.value.replace(/\D/g, ""))}
              className="text-center text-3xl tracking-widest h-16"
              placeholder="••••••"
            />
            <p className={`text-xs text-center ${pin.length >= 4 ? "text-green-600" : "text-muted-foreground"}`}>
              {pin.length >= 4 ? `${pin.length} digits entered` : "Enter 4-6 digits"}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPin">Confirm your PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => onConfirmPinChange(e.target.value.replace(/\D/g, ""))}
              className={`text-center text-3xl tracking-widest h-16 ${confirmPin && pin && confirmPin !== pin ? "border-destructive" : ""}`}
              placeholder="••••••"
            />
            {confirmPin && pin && confirmPin !== pin && (
              <p className="text-xs text-destructive text-center">PINs do not match</p>
            )}
            {confirmPin && pin && confirmPin === pin && (
              <p className="text-xs text-green-600 text-center">PINs match</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-blue-600"
            disabled={isSubmitting || pin.length < 4 || pin !== confirmPin}
            onClick={onSubmit}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {isSubmitting ? "Setting..." : "Set PIN"}
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p>This PIN will protect your transfers and withdrawals</p>
          <p className="mt-1 font-medium">Keep it safe — never share it</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}