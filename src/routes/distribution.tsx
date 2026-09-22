import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft } from "lucide-react";
import { MobileShell, Card, Label, PrimaryButton } from "@/components/MobileShell";
import { Sheet } from "@/components/Sheet";
import { StatusChip } from "@/components/StatusChip";
import { useRelocation } from "@/lib/relocation-store";

export const Route = createFileRoute("/distribution")({
  head: () => ({
    meta: [
      { title: "פיזור ציוד — פינוי ציוד" },
      {
        name: "description",
        content: "פתיחת אריזה לפיזור בחדרים החדשים, אימות פריטים וטיפול בחוסרים.",
      },
      { property: "og:title", content: "פיזור ציוד — פינוי ציוד" },
      { property: "og:description", content: "תהליך פיזור הציוד בחדרים החדשים." },
    ],
  }),
  component: Distribution,
});

function Distribution() {
  const store = useRelocation();
  const navigate = useNavigate();
  const [code, setCode] = React.useState("");
  const [unitId, setUnitId] = React.useState("");
  const [qty, setQty] = React.useState<Record<string, number>>({});
  const [result, setResult] = React.useState<null | { complete: boolean; missing: string[] }>(null);

  const ready = store.units.filter((u) => u.status === "אריזה התקבלה");
  const unit = store.unitById(unitId);

  const open = (id: string) => {
    setUnitId(id);
    setQty({});
  };

  const footer = unit ? (
    result ? (
      <PrimaryButton onClick={() => navigate({ to: "/processes" })}>
        {result.complete ? "חזרה לתפריט" : "סיום העדכון להמשך יתר התהליך"}
      </PrimaryButton>
    ) : (
      <PrimaryButton
        onClick={() =>
          setResult(
            store.distributeUnit(
              unit.id,
              Object.entries(qty).map(([itemId, quantity]) => ({ itemId, quantity })),
            ),
          )
        }
      >
        סיום פיזור הפריטים
      </PrimaryButton>
    )
  ) : (
    <PrimaryButton
      disabled={!ready.some((u) => u.id === code.trim())}
      onClick={() => open(code.trim())}
    >
      פתח אריזה לפיזור
    </PrimaryButton>
  );

  return (
    <MobileShell
      title="פיזור ציוד בחדרים"
      subtitle={unit ? `אריזה ${unit.id} · ${unit.status}` : "בחירת יחידת אריזה"}
      backTo="/processes"
      footer={footer}
    >
      {!unit ? (
        <div className="space-y-3">
          <Card>
            <Label>מספר אריזה (5 ספרות)</Label>
            <input
              className="field text-center font-mono text-lg tracking-[0.3em]"
              inputMode="numeric"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="00000"
            />
          </Card>

          <p className="px-1 text-xs text-muted-foreground">אריזות בסטטוס "אריזה התקבלה"</p>
          {ready.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => open(u.id)}
              className="card-soft flex w-full items-center gap-3 p-4 text-right"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-sm font-semibold text-foreground">{u.id}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {u.type} · יעד: {u.destination?.building} קומה {u.destination?.floor} חדר{" "}
                  {u.destination?.room}
                </span>
              </span>
              <StatusChip status={u.status} />
              <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
            </button>
          ))}
          {ready.length === 0 ? (
            <Card className="text-center text-sm text-muted-foreground">
              אין אריזות הממתינות לפיזור.
            </Card>
          ) : null}
        </div>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">פריטים באריזה</h3>
            <span className="text-xs text-muted-foreground">כמות שפוזרה</span>
          </div>
          <ul className="divide-y divide-border">
            {unit.items.map((item) => {
              const current = qty[item.itemId] ?? 0;
              const checked = current >= item.quantity;
              return (
                <li key={item.itemId} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    aria-label={`פיזור ${item.name}`}
                    disabled={!!result}
                    onClick={() =>
                      setQty((q) => ({ ...q, [item.itemId]: checked ? 0 : item.quantity }))
                    }
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border ${
                      checked ? "border-primary bg-primary" : "border-input bg-card"
                    }`}
                  >
                    {checked ? <Check className="size-4 text-primary-foreground" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">נארזו: {item.quantity}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={item.quantity}
                    value={current}
                    disabled={!!result}
                    onChange={(e) =>
                      setQty((q) => ({
                        ...q,
                        [item.itemId]: Math.max(
                          0,
                          Math.min(item.quantity, Number(e.target.value)),
                        ),
                      }))
                    }
                    className="field !min-h-10 !w-16 text-center"
                  />
                </li>
              );
            })}
            {unit.items.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                קרטון אישי — אין רישום פריטים פרטני.
              </li>
            ) : null}
          </ul>
        </Card>
      )}

      <Sheet
        open={!!result}
        title={result?.complete ? "האריזה פוזרה" : "שים לב, לא כל הפריטים פוזרו"}
      >
        {result?.complete ? (
          <p className="text-sm text-muted-foreground">
            כל הפריטים פוזרו בחדר החדש. פריטים עודפים מנותבים למחסן אבדן.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              הפריטים הבאים עודכנו לסטטוס "פריט בחוסר":
            </p>
            <ul className="mt-3 space-y-2">
              {result?.missing.map((name) => (
                <li
                  key={name}
                  className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive"
                >
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
              נשלחה הודעת SMS אוטומטית עם פרטי הפריטים החסרים.
            </p>
          </>
        )}
      </Sheet>
    </MobileShell>
  );
}
