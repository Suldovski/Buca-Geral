import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const active = ["Ativo", "Ativa"].includes(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      )}
    >
      {status}
    </span>
  );
}
