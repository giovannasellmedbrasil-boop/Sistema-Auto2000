"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHECKLIST_STATUS_DOT } from "@/lib/server/documentChecklist";
import { CHECKLIST_ITEM_STATUS_LABELS, type ChecklistItem, type ChecklistItemStatus } from "@/lib/types";
import { Select } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = Object.keys(CHECKLIST_ITEM_STATUS_LABELS) as ChecklistItemStatus[];

export function ChecklistItemRow({ negotiationId, item }: { negotiationId: string; item: ChecklistItem }) {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(item.note ?? "");
  const [editingNote, setEditingNote] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/negotiations/${negotiationId}/checklist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(next: ChecklistItemStatus) {
    setStatus(next);
    await patch({ status: next });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-white/5 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", CHECKLIST_STATUS_DOT[status])} />
        <span className="flex-1 text-sm text-ink-800">
          {item.label}
          {!item.required && <span className="ml-1.5 text-xs text-ink-500">(opcional)</span>}
        </span>
        <Select
          value={status}
          disabled={saving}
          onChange={(e) => handleStatusChange(e.target.value as ChecklistItemStatus)}
          className="w-auto text-xs"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {CHECKLIST_ITEM_STATUS_LABELS[opt]}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => setEditingNote((v) => !v)}
          className="text-xs text-ink-500 hover:text-accent-400"
        >
          {item.responsible ? `Resp: ${item.responsible}` : "+ responsável/nota"}
        </button>
      </div>
      {editingNote && (
        <div className="ml-5 flex flex-wrap items-center gap-2">
          <input
            defaultValue={item.responsible ?? ""}
            placeholder="Responsável"
            onBlur={(e) => patch({ responsible: e.target.value || null })}
            className="w-40 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/35 focus:border-accent-500 focus:outline-none"
          />
          <input
            type="date"
            defaultValue={item.dueDate ? item.dueDate.slice(0, 10) : ""}
            onBlur={(e) => patch({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-accent-500 focus:outline-none"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => patch({ note: note || null })}
            placeholder="Nota (ex: motivo da recusa)"
            className="min-w-48 flex-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/35 focus:border-accent-500 focus:outline-none"
          />
        </div>
      )}
      {item.note && !editingNote && <p className="ml-5 text-xs text-ink-500">{item.note}</p>}
    </div>
  );
}
