import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function MobileShell({
  title,
  subtitle,
  backTo,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  backTo?: "/" | "/processes";
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3">
            {backTo ? (
              <Link
                to={backTo}
                aria-label="חזרה"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"
              >
                <ChevronRight className="size-5" />
              </Link>
            ) : (
              <span className="size-9" />
            )}
            <div className="min-w-0 text-center">
              <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <span className="size-9" />
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-8">{children}</main>

        {footer ? (
          <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card px-5 py-3.5 text-base font-medium text-foreground"
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card-soft p-4 ${className}`}>{children}</section>;
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{children}</span>;
}
