import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const active = ["Ativo", "Ativa"].includes(status);
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium",
        active
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800",
      )}
    >
      {status}
    </span>
  );
}
