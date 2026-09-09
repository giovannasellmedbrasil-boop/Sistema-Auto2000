"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DeliverButton({ negotiationId }: { negotiationId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("Confirmar a entrega do veículo ao cliente?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/negotiations/${negotiationId}/deliver`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível confirmar a entrega.");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" onClick={handleClick} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
        Confirmar entrega
      </Button>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
