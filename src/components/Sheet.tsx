import type { ReactNode } from "react";

export function Sheet({
  open,
  title,
  children,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 px-0 sm:items-center sm:px-4">
      <div className="sheet-lift w-full max-w-md rounded-t-2xl border border-border bg-card p-5 sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
        {children}
      </div>
    </div>
  );
}
