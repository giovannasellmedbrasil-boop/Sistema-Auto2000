// Gráfico semicircular de score (seção 3), 0 até `max`. Componente puramente
// visual — nunca decide classificação por conta própria (isso vem do
// provedor via `scoreClassification`/`riskIndicator`, renderizados ao lado).

export function ScoreGauge({ score, max = 1000 }: { score: number | null; max?: number }) {
  const size = 220;
  const strokeWidth = 18;
  const r = (size - strokeWidth) / 2;
  const cy = size / 2;
  const circumference = Math.PI * r;

  const pct = score == null ? 0 : Math.min(Math.max(score / max, 0), 1);
  const offset = circumference * (1 - pct);

  const color =
    score == null
      ? "var(--color-ink-400)"
      : score >= 700
        ? "var(--color-success-500)"
        : score >= 500
          ? "var(--color-accent-500)"
          : "var(--color-danger-500)";

  const path = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={cy + strokeWidth / 2} viewBox={`0 0 ${size} ${cy + strokeWidth / 2}`}>
        <path d={path} fill="none" stroke="var(--color-ink-200)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-6 flex flex-col items-center">
        <span className="text-4xl font-semibold tracking-tight text-white">{score ?? "—"}</span>
        <span className="text-xs text-ink-500">de {max}</span>
      </div>
    </div>
  );
}
