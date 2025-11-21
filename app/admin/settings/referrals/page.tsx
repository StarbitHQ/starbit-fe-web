// app/admin/referrals/page.tsx   ← or app/admin/settings/referrals/page.tsx

"use client";

import { NavHeader } from "@/components/admin-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api"; // ← THIS WAS MISSING!

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ReferralTier {
  id: string;
  name: string;
  minReferrals: number;
  maxReferrals: number | null;
  bonusPercent: number;
  color: string;
}

interface ReferralSettings {
  enabled: boolean;
  tiers: ReferralTier[];
}

const SortableTier = ({
  tier,
  onUpdate,
  onDelete,
}: {
  tier: ReferralTier;
  onUpdate: (tier: ReferralTier) => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-6 rounded-xl border-2 bg-card ${
        isDragging ? "opacity-50 shadow-2xl z-10" : "shadow"
      }`}
    >
      <div className="flex gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-8 cursor-grab active:cursor-grabbing text-muted-foreground"
        >
          <GripVertical className="h-6 w-6" />
        </button>

        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <Input
              value={tier.name}
              onChange={(e) => onUpdate({ ...tier, name: e.target.value })}
              className="text-xl font-bold max-w-xs"
              placeholder="Tier Name"
            />
            <Button size="icon" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Min Referrals</Label>
              <Input
                type="number"
                value={tier.minReferrals}
                onChange={(e) =>
                  onUpdate({ ...tier, minReferrals: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Max Referrals (empty = unlimited)</Label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={tier.maxReferrals ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdate({
                    ...tier,
                    maxReferrals: val === "" ? null : Number(val),
                  });
                }}
              />
            </div>
            <div>
              <Label>Bonus Percentage (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={tier.bonusPercent}
                onChange={(e) =>
                  onUpdate({ ...tier, bonusPercent: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Label>Color (HEX)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tier.color}
                  onChange={(e) => onUpdate({ ...tier, color: e.target.value })}
                  placeholder="#CD7F32"
                  className="font-mono"
                />
                <div
                  className="w-12 h-10 rounded border-2"
                  style={{ backgroundColor: tier.color || "#888" }}
                />
              </div>
            </div>

            <Badge
              className="text-lg px-6 py-3 self-end"
              style={{
                backgroundColor: tier.color || "#888",
                color: tier.color === "#FFD700" ? "black" : "white",
              }}
            >
              {tier.bonusPercent}% Bonus
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Active for {tier.minReferrals} → {tier.maxReferrals ?? "∞"}{" "}
            referrals
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ReferralSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReferralSettings>({
    enabled: true,
    tiers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/settings/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load settings");

      const { data } = await res.json();

      setSettings({
        enabled: data.enabled ?? true,
        tiers: (data.tiers || []).map((t: any, i: number) => ({
          id: t.id || `tier-${i}-${Date.now()}`,
          name: t.name || "New Tier",
          minReferrals: t.minReferrals ?? 0,
          maxReferrals: t.maxReferrals ?? null,
          bonusPercent: t.bonusPercent ?? 5,
          color: t.color || "#888888",
        })),
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load referral settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSubmitting(true);
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/settings/referrals`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({
        title: "Success",
        description: "Referral settings saved successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTier = () => {
    const lastMax =
      settings.tiers.length > 0
        ? settings.tiers[settings.tiers.length - 1].maxReferrals ?? 0
        : 0;

    setSettings((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          id: `tier-${Date.now()}`,
          name: "New Tier",
          minReferrals: lastMax + 1,
          maxReferrals: null,
          bonusPercent: 10,
          color: "#94a3b8",
        },
      ],
    }));
  };

  const updateTier = (updated: ReferralTier) => {
    setSettings((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  const deleteTier = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((t) => t.id !== id),
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSettings((prev) => {
      const oldIndex = prev.tiers.findIndex((t) => t.id === active.id);
      const newIndex = prev.tiers.findIndex((t) => t.id === over.id);
      return {
        ...prev,
        tiers: arrayMove(prev.tiers, oldIndex, newIndex),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 flex items-center gap-4 text-4xl font-bold">
          <Users className="h-10 w-10 text-primary" />
          Referral Program Settings
        </h1>

        {/* Program Status */}
        <Card className="mb-8">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Program Status</CardTitle>
              <CardDescription>
                Enable or disable the entire referral program
              </CardDescription>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) =>
                setSettings((prev) => ({ ...prev, enabled: v }))
              }
            />
          </CardHeader>
        </Card>

        {/* Tiers Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Referral Tiers</h2>
          <Button onClick={addTier} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Tier
          </Button>
        </div>

        {/* Tiers List */}
        {settings.tiers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No tiers configured yet
              </p>
              <Button onClick={addTier} className="mt-6">
                Create First Tier
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={settings.tiers.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {settings.tiers.map((tier) => (
                  <SortableTier
                    key={tier.id}
                    tier={tier}
                    onUpdate={updateTier}
                    onDelete={() => deleteTier(tier.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Save Button */}
        <div className="mt-12 flex justify-end">
          <Button
            size="lg"
            onClick={saveSettings} // ← NOW CORRECT!
            disabled={isSubmitting || settings.tiers.length === 0}
            className="gap-3 px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}