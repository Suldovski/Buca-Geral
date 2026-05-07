import type { ReactNode } from "react";

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  );
}
