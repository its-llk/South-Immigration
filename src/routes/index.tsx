import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, MessageSquare } from "lucide-react";
import { MobileShell, Card } from "@/components/MobileShell";
import { useRelocation } from "@/lib/relocation-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "פינוי ציוד — מסך הבית" },
      {
        name: "description",
        content:
          "ניהול קצה-לקצה של פינוי ציוד: אריזה, הובלה, קבלת ציוד ופיזור בחדרים החדשים.",
      },
      { property: "og:title", content: "פינוי ציוד — מסך הבית" },
      {
        property: "og:description",
        content: "ניהול קצה-לקצה של פינוי ציוד בין בניינים.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { units, transports, messages } = useRelocation();

  return (
    <MobileShell title="מערכת פינוי ציוד" subtitle="נאמן אריזה 4471">
      <div className="space-y-4">
        <Card className="text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-primary-soft">
            <Boxes className="size-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">פינוי ציוד</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            העברת ציוד מחדרים ישנים לחדרים חדשים — אריזה, הובלה, קבלה ופיזור.
          </p>
          <Link
            to="/processes"
            className="mt-4 block w-full rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground"
          >
            כניסה לפינוי ציוד
          </Link>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <div className="text-2xl font-bold text-foreground">{units.length}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">יחידות אריזה</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-foreground">{transports.length}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">הובלות</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-foreground">{messages.length}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">הודעות SMS</div>
          </Card>
        </div>

        {messages.length > 0 ? (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">התראות אחרונות</h3>
            </div>
            <ul className="space-y-3">
              {messages.slice(0, 3).map((m) => (
                <li key={m.id} className="rounded-xl bg-secondary p-3">
                  <p className="text-sm text-foreground">{m.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{m.to}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </MobileShell>
  );
}
