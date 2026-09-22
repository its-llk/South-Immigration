import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft } from "lucide-react";
import { MobileShell, Card, PrimaryButton } from "@/components/MobileShell";
import { Sheet } from "@/components/Sheet";
import { StatusChip } from "@/components/StatusChip";
import { useRelocation } from "@/lib/relocation-store";

export const Route = createFileRoute("/receiving")({
  head: () => ({
    meta: [
      { title: "קבלת ציוד — פינוי ציוד" },
      {
        name: "description",
        content: "אימות פריקת יחידות אריזה מהרכב, זיהוי חוסרים ושליחת התראה.",
      },
      { property: "og:title", content: "קבלת ציוד — פינוי ציוד" },
      { property: "og:description", content: "תהליך קבלת הציוד ופריקתו." },
    ],
  }),
  component: Receiving,
});

function Receiving() {
  const store = useRelocation();
  const navigate = useNavigate();
  const [transportId, setTransportId] = React.useState("");
  const [received, setReceived] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<null | { missing: string[] }>(null);

  const inTransit = store.transports.filter((t) => t.status === "יחידת הובלה בדרך");
  const transport = store.transports.find((t) => t.id === transportId);
  const units = transport ? transport.unitIds.map((id) => store.unitById(id)) : [];
  const missing = transport ? transport.unitIds.filter((id) => !received.includes(id)) : [];

  const footer = transport ? (
    result ? (
      <PrimaryButton onClick={() => navigate({ to: "/processes" })}>
        {result.missing.length ? "סיום העדכון לסטטוס" : "חזרה לתפריט"}
      </PrimaryButton>
    ) : (
      <PrimaryButton
        onClick={() => {
          store.receiveTransport(transport.id, received);
          setResult({ missing });
        }}
      >
        סיום פריקה
      </PrimaryButton>
    )
  ) : undefined;

  return (
    <MobileShell
      title="קבלת ציוד"
      subtitle={transport ? `הובלה ${transport.id} · ${transport.plate}` : "בחירת משלוח"}
      backTo="/processes"
      footer={footer}
    >
      {!transport ? (
        <div className="space-y-3">
          {inTransit.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTransportId(t.id)}
              className="card-soft flex w-full items-center gap-3 p-4 text-right"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-sm font-semibold text-foreground">
                  הובלה {t.id}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {t.vehicleType} · {t.plate} · {t.unitIds.length} יחידות
                </span>
              </span>
              <StatusChip status={t.status} />
              <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
            </button>
          ))}
          {inTransit.length === 0 ? (
            <Card className="text-center text-sm text-muted-foreground">
              אין כרגע יחידות הובלה בדרך.
            </Card>
          ) : null}
        </div>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">אימות יחידות שהתקבלו</h3>
            <span className="text-xs text-muted-foreground">
              {received.length}/{transport.unitIds.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {units.map((u) =>
              u ? (
                <li key={u.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    aria-label={`אישור קבלת ${u.id}`}
                    disabled={!!result}
                    onClick={() =>
                      setReceived((r) =>
                        r.includes(u.id) ? r.filter((x) => x !== u.id) : [...r, u.id],
                      )
                    }
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border ${
                      received.includes(u.id)
                        ? "border-primary bg-primary"
                        : "border-input bg-card"
                    }`}
                  >
                    {received.includes(u.id) ? (
                      <Check className="size-4 text-primary-foreground" />
                    ) : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold text-foreground">{u.id}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{u.type}</p>
                  </div>
                  <StatusChip status={u.status} />
                </li>
              ) : null,
            )}
          </ul>
        </Card>
      )}

      <Sheet open={!!result} title={result?.missing.length ? "זוהו יחידות חסרות" : "הפריקה הושלמה"}>
        {result?.missing.length ? (
          <>
            <p className="text-sm text-muted-foreground">
              היחידות הבאות לא נפרקו ועודכנו לסטטוס "אריזה חסרה":
            </p>
            <ul className="mt-3 space-y-2">
              {result.missing.map((id) => (
                <li
                  key={id}
                  className="rounded-xl bg-destructive-soft p-3 font-mono text-sm text-destructive"
                >
                  {id}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
              נשלחה הודעת SMS אוטומטית עם פרטי החוסרים.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            כל יחידות האריזה התקבלו. יחידת ההובלה נפרקה במלואה.
          </p>
        )}
      </Sheet>
    </MobileShell>
  );
}
