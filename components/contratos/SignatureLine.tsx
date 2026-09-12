export function SignatureLine({ label }: { label: string }) {
  return (
    <div className="mt-10 flex flex-col gap-1">
      <div className="w-72 border-t border-black/60" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
