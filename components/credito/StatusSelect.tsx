"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CommercialStatus } from "@/lib/types";
import { COMMERCIAL_STATUS_LABELS } from "@/lib/types";
import { Select } from "@/components/ui/Field";

const OPTIONS = Object.keys(COMMERCIAL_STATUS_LABELS) as CommercialStatus[];

export function StatusSelect({ analysisId, status }: { analysisId: string; status: CommercialStatus }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: CommercialStatus) {
    setCurrent(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/credito/${analysisId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select
      value={current}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as CommercialStatus)}
      className="w-auto"
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {COMMERCIAL_STATUS_LABELS[opt]}
        </option>
      ))}
    </Select>
  );
}
