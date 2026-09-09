"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/Field";
import {
  NEGOTIATION_BUCKET_LABELS,
  NEGOTIATION_PAYMENT_METHOD_LABELS,
  type NegotiationBucket,
  type NegotiationPaymentMethod,
} from "@/lib/types";

export function NegotiationFiltersBar({ sellers }: { sellers: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <Input
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => setParam("q", e.target.value)}
          placeholder="Cliente, CPF/CNPJ, placa, veículo, vendedor, nº da venda"
          className="w-72 pl-9"
        />
      </div>
      <Select value={searchParams.get("sellerId") ?? ""} onChange={(e) => setParam("sellerId", e.target.value)} className="w-auto">
        <option value="">Todos os vendedores</option>
        {sellers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("bucket") ?? ""}
        onChange={(e) => setParam("bucket", e.target.value)}
        className="w-auto"
      >
        <option value="">Todos os status</option>
        {(Object.keys(NEGOTIATION_BUCKET_LABELS) as NegotiationBucket[]).map((b) => (
          <option key={b} value={b}>
            {NEGOTIATION_BUCKET_LABELS[b]}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("paymentMethod") ?? ""}
        onChange={(e) => setParam("paymentMethod", e.target.value)}
        className="w-auto"
      >
        <option value="">Pagamento (todos)</option>
        {(Object.keys(NEGOTIATION_PAYMENT_METHOD_LABELS) as NegotiationPaymentMethod[]).map((p) => (
          <option key={p} value={p}>
            {NEGOTIATION_PAYMENT_METHOD_LABELS[p]}
          </option>
        ))}
      </Select>
    </div>
  );
}
