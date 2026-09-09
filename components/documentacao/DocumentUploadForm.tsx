"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { CHECKLIST_CATEGORY_LABELS, type ChecklistCategory, type ChecklistItem } from "@/lib/types";

export function DocumentUploadForm({
  negotiationId,
  items,
}: {
  negotiationId: string;
  items: ChecklistItem[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<ChecklistCategory>(items[0]?.category ?? "CLIENTE");
  const [itemKey, setItemKey] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [warning, setWarning] = useState<string | null>(null);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const itemsInCategory = items.filter((i) => i.category === category);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setStatus("uploading");
    setWarning(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("category", category);
        if (itemKey) form.append("itemKey", itemKey);
        const res = await fetch(`/api/negotiations/${negotiationId}/documents`, { method: "POST", body: form });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Falha ao enviar arquivo");
        }
        const data = await res.json();
        if (data.duplicate) {
          setWarning(`"${file.name}" parece já ter sido enviado antes para esta venda.`);
        }
      }
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4">
      <div className="flex flex-wrap gap-2">
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as ChecklistCategory);
            setItemKey("");
          }}
          className="w-auto"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {CHECKLIST_CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
        <Select value={itemKey} onChange={(e) => setItemKey(e.target.value)} className="w-auto">
          <option value="">Documento genérico</option>
          {itemsInCategory.map((i) => (
            <option key={i.key} value={i.key}>
              {i.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={status === "uploading"}>
          {status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Escolher arquivo
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => cameraInputRef.current?.click()} disabled={status === "uploading"}>
          <Camera className="h-4 w-4" />
          Fotografar
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-ink-500">PDF, JPG ou PNG — até 15 MB por arquivo.</p>
      {warning && <p className="text-xs font-medium text-warning-500">{warning}</p>}
      {status === "error" && <p className="text-xs font-medium text-danger-500">Não foi possível enviar o arquivo.</p>}
    </div>
  );
}
