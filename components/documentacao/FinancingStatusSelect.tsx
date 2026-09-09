"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FINANCING_STATUS_LABELS, type FinancingDetails, type FinancingStatus } from "@/lib/types";
import { Select } from "@/components/ui/Field";

const OPTIONS = Object.keys(FINANCING_STATUS_LABELS) as FinancingStatus[];

export function FinancingStatusSelect({ negotiationId, financing }: { negotiationId: string; financing: FinancingDetails }) {
  const router = useRouter();
  const [current, setCurrent] = useState(financing.status);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: FinancingStatus) {
    setCurrent(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/negotiations/${negotiationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financing: { ...financing, status: next } }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={current} disabled={saving} onChange={(e) => handleChange(e.target.value as FinancingStatus)} className="w-auto">
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {FINANCING_STATUS_LABELS[opt]}
        </option>
      ))}
    </Select>
  );
}
