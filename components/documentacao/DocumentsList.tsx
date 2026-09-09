"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Trash2 } from "lucide-react";
import { CHECKLIST_CATEGORY_LABELS, type NegotiationDocument } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText } from "lucide-react";

export function DocumentsList({
  negotiationId,
  documents,
  canDelete,
}: {
  negotiationId: string;
  documents: NegotiationDocument[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum arquivo anexado ainda"
        description="Use o envio acima para anexar os documentos desta negociação."
      />
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este arquivo permanentemente?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/negotiations/${negotiationId}/documents/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const grouped = documents.reduce<Record<string, NegotiationDocument[]>>((acc, doc) => {
    (acc[doc.category] ??= []).push(doc);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(grouped).map(([category, docs]) => (
        <div key={category}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            {CHECKLIST_CATEGORY_LABELS[category as keyof typeof CHECKLIST_CATEGORY_LABELS]}
          </h4>
          <div className="flex flex-col gap-1.5">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-50/40 px-3.5 py-2.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-ink-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink-800">{doc.fileName}</p>
                  <p className="text-xs text-ink-500">
                    {formatFileSize(doc.sizeBytes)} · enviado por {doc.uploadedBy} em{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <a
                  href={`/api/negotiations/${negotiationId}/documents/${doc.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-700"
                  aria-label="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </a>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-danger-500/10 hover:text-danger-500"
                    aria-label="Excluir"
                  >
                    {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
