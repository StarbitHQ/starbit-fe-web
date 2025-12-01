"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UpdatePinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldPin: string;
  newPin: string;
  confirmNewPin: string;
  isSubmitting: boolean;
  onOldPinChange: (pin: string) => void;
  onNewPinChange: (pin: string) => void;
  onConfirmNewPinChange: (pin: string) => void;
  onSubmit: () => void;
}

export function UpdatePinModal({
  open,
  onOpenChange,
  oldPin,
  newPin,
  confirmNewPin,
  isSubmitting,
  onOldPinChange,
  onNewPinChange,
  onConfirmNewPinChange,
  onSubmit,
}: UpdatePinModalProps) {
  const isValid =
    oldPin.length >= 4 &&
    newPin.length >= 4 &&
    newPin.length <= 6 &&
    newPin === confirmNewPin &&
    /^\d+$/.test(newPin);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center mb-5">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Update Transaction PIN</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your current PIN and choose a new 4–6 digit PIN
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current PIN */}
          <div className="space-y-3">
            <Label htmlFor="oldPin" className="flex items-center gap-2 text-base font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Current PIN
            </Label>
            <Input
              id="oldPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={oldPin}
              onChange={(e) => onOldPinChange(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest h-14 font-mono"
              placeholder="••••••"
            />
          </div>

          {/* New PIN */}
          <div className="space-y-3">
            <Label htmlFor="newPin">New PIN (4–6 digits)</Label>
            <Input
              id="newPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => onNewPinChange(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest h-14 font-mono"
              placeholder="••••••"
            />
            <p className="text-xs text-center text-muted-foreground">
              {newPin.length === 0 && "Enter 4–6 digits"}
              {newPin.length > 0 && newPin.length < 4 && "Too short"}
              {newPin.length >= 4 && `${newPin.length} digits`}
            </p>
          </div>

          {/* Confirm New PIN */}
          <div className="space-y-3">
            <Label htmlFor="confirmNewPin">Confirm New PIN</Label>
            <Input
              id="confirmNewPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmNewPin}
              onChange={(e) => onConfirmNewPinChange(e.target.value.replace(/\D/g, ""))}
              className={`text-center text-2xl tracking-widest h-14 font-mono ${
                confirmNewPin && newPin && confirmNewPin !== newPin
                  ? "border-destructive focus:border-destructive"
                  : ""
              }`}
              placeholder="••••••"
            />
            {confirmNewPin && newPin && confirmNewPin !== newPin && (
              <p className="text-xs text-destructive text-center">
                PINs do not match
              </p>
            )}
            {confirmNewPin && newPin && confirmNewPin === newPin && newPin.length >= 4 && (
              <p className="text-xs text-green-600 text-center">
                PINs match
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              onOldPinChange("");
              onNewPinChange("");
              onConfirmNewPinChange("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating PIN...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update PIN
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground bg-muted/50 rounded-lg p-4 mt-6">
          <p className="font-medium">This will immediately update your transaction PIN</p>
          <p>Use it for transfers, withdrawals, and sensitive actions</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}