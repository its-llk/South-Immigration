import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MobileShell, Card, Label, PrimaryButton } from "@/components/MobileShell";
import { Sheet } from "@/components/Sheet";
import { StatusChip } from "@/components/StatusChip";
import { useRelocation } from "@/lib/relocation-store";

export const Route = createFileRoute("/transport")({
  head: () => ({
    meta: [
      { title: "יצירת הובלה — פינוי ציוד" },
      {
        name: "description",
        content: "פתיחת יחידת הובלה, העמסת יחידות אריזה סגורות ושליחת הודעה לרשימת התפוצה.",
      },
      { property: "og:title", content: "יצירת הובלה — פינוי ציוד" },
      { property: "og:description", content: "תהליך ההובלה של פינוי הציוד." },
    ],
  }),
  component: Transport,
});

function Transport() {
  const store = useRelocation();
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = React.useState<"משאית" | "אחר">("משאית");
  const [plate, setPlate] = React.useState("");
  const [transportId, setTransportId] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [done, setDone] = React.useState(false);

  const available = store.units.filter((u) => u.status === "אריזה נסגרה");

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const footer = !transportId ? (
    <PrimaryButton
      disabled={plate.trim().length < 5}
      onClick={() => setTransportId(store.openTransport(plate.trim(), vehicleType).id)}
    >
      שמירה ופתיחת העמסה
    </PrimaryButton>
  ) : (
    <PrimaryButton
      disabled={selected.length === 0}
      onClick={() => {
        store.loadTransport(transportId, selected);
        setDone(true);
      }}
    >
      סיום העמסה
    </PrimaryButton>
  );

  return (
    <MobileShell
      title="יצירת הובלה"
      subtitle={transportId ? `הובלה ${transportId} · בתהליך העמסה` : "פתיחת יחידת הובלה"}
      backTo="/processes"
      footer={footer}
    >
      {!transportId ? (
        <Card>
          <Label>סוג הובלה</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["משאית", "אחר"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setVehicleType(t)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                  vehicleType === t
                    ? "border-primary bg-primary-soft text-accent-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <Label>מספר רישוי</Label>
            <input
              className="field font-mono"
              inputMode="numeric"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="12-345-67"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            שעת הפתיחה תירשם אוטומטית עם השמירה.
          </p>
        </Card>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">יחידות אריזה להעמסה</h3>
            <span className="text-xs text-muted-foreground">נבחרו {selected.length}</span>
          </div>
          <ul className="divide-y divide-border">
            {available.map((u) => {
              const room = store.roomById(u.roomId);
              const checked = selected.includes(u.id);
              return (
                <li key={u.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    aria-label={`בחירת יחידה ${u.id}`}
                    onClick={() => toggle(u.id)}
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border ${
                      checked ? "border-primary bg-primary" : "border-input bg-card"
                    }`}
                  >
                    {checked ? <Check className="size-4 text-primary-foreground" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold text-foreground">{u.id}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {u.type} · חדר {room?.roomNumber ?? "—"} → {u.destination?.room ?? "—"}
                    </p>
                  </div>
                  <StatusChip status={u.status} />
                </li>
              );
            })}
            {available.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                אין יחידות אריזה בסטטוס "אריזה נסגרה".
              </li>
            ) : null}
          </ul>
        </Card>
      )}

      <Sheet open={done} title="ההובלה יצאה לדרך">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">מספר הובלה</dt>
            <dd className="font-mono font-semibold text-foreground">{transportId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">סה״כ יחידות</dt>
            <dd className="font-medium text-foreground">{selected.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">תאריך ושעה</dt>
            <dd className="font-medium text-foreground">{new Date().toLocaleString("he-IL")}</dd>
          </div>
        </dl>
        <p className="mt-3 rounded-xl bg-success-soft p-3 text-xs text-foreground">
          נשלחה הודעת SMS לרשימת התפוצה עם פרטי המשלוח.
        </p>
        <div className="mt-5">
          <PrimaryButton onClick={() => navigate({ to: "/processes" })}>סגירה</PrimaryButton>
        </div>
      </Sheet>
    </MobileShell>
  );
}
