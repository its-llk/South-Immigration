import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageOpen, Truck, PackageCheck, LayoutGrid, ChevronLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/processes")({
  head: () => ({
    meta: [
      { title: "תפריט תהליכים — פינוי ציוד" },
      {
        name: "description",
        content: "בחירת תהליך: יצירת אריזה, יצירת הובלה, קבלת ציוד או פיזור ציוד.",
      },
      { property: "og:title", content: "תפריט תהליכים — פינוי ציוד" },
      { property: "og:description", content: "ארבעת תהליכי פינוי הציוד." },
    ],
  }),
  component: Processes,
});

const options = [
  { to: "/packing", title: "יצירת אריזה", desc: "פתיחת יחידת אריזה בחדר", Icon: PackageOpen },
  { to: "/transport", title: "יצירת הובלה", desc: "העמסת יחידות על רכב", Icon: Truck },
  { to: "/receiving", title: "קבלת ציוד", desc: "פריקה ואימות משלוח", Icon: PackageCheck },
  { to: "/distribution", title: "פיזור ציוד", desc: "פיזור פריטים בחדרים החדשים", Icon: LayoutGrid },
] as const;

function Processes() {
  return (
    <MobileShell title="פינוי ציוד" subtitle="בחירת תהליך" backTo="/">
      <div className="space-y-3">
        {options.map(({ to, title, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="card-soft flex items-center gap-3 p-4 active:bg-secondary"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft">
              <Icon className="size-5 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-foreground">{title}</span>
              <span className="block truncate text-xs text-muted-foreground">{desc}</span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
