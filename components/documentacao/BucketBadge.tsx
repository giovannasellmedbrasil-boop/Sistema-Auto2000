import { Badge } from "@/components/ui/Badge";
import { NEGOTIATION_BUCKET_LABELS, type NegotiationBucket } from "@/lib/types";

const BUCKET_TONE: Record<NegotiationBucket, "success" | "warning" | "danger" | "info" | "neutral"> = {
  READY: "success",
  PENDING: "warning",
  AWAITING_CLIENT: "warning",
  AWAITING_BANK: "info",
  AWAITING_COURIER: "info",
  CRITICAL: "danger",
};

export function BucketBadge({ bucket }: { bucket: NegotiationBucket }) {
  return <Badge tone={BUCKET_TONE[bucket]}>{NEGOTIATION_BUCKET_LABELS[bucket]}</Badge>;
}
