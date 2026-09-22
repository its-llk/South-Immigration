import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Check } from "lucide-react";
import { MobileShell, Card, Label, PrimaryButton, GhostButton } from "@/components/MobileShell";
import { Sheet } from "@/components/Sheet";
import { StatusChip } from "@/components/StatusChip";
import { useRelocation } from "@/lib/relocation-store";
import { PACKING_UNIT_TYPES, type PackingUnitType } from "@/lib/relocation-types";

export const Route = createFileRoute("/packing")({
  head: () => ({
    meta: [
      { title: "יצירת אריזה — פינוי ציוד" },
      {
        name: "description",
        content: "פתיחת יחידת אריזה: בחירת ענף, מדור וחדר, סימון פריטים והזנת יעד.",
      },
      { property: "og:title", content: "יצירת אריזה — פינוי ציוד" },
      { property: "og:description", content: "תהליך האריזה של פינוי הציוד." },
    ],
  }),
  component: Packing,
});

type Step = "location" | "type" | "items" | "destination";

function Packing() {
  const store = useRelocation();
  const navigate = useNavigate();

  const [step, setStep] = React.useState<Step>("location");
  const [branch, setBranch] = React.useState("");
  const [section, setSection] = React.useState("");
  const [roomId, setRoomId] = React.useState("");
  const [unitType, setUnitType] = React.useState<PackingUnitType | "">("");
  const [unitId, setUnitId] = React.useState("");
  const [picked, setPicked] = React.useState<Record<string, number>>({});
  const [dest, setDest] = React.useState({ building: "", floor: "", room: "" });
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [continueOpen, setContinueOpen] = React.useState(false);
  const [pauseOpen, setPauseOpen] = React.useState(false);

  const room = store.roomById(roomId);
  const unit = store.unitById(unitId);
  const roomItems = roomId
    ? store
        .itemsOfRoom(roomId)
        .filter((i) => i.status === "עובד/הצלה")
        .sort((a, b) => a.name.localeCompare(b.name, "he"))
    : [];
  const mappingError = !!room && !room.mapped;

  const resetForNextUnit = () => {
    setUnitType("");
    setUnitId("");
    setPicked({});
    setDest({ building: "", floor: "", room: "" });
    setStep("type");
  };

  const startUnit = () => {
    if (!unitType || !roomId) return;
    const created = store.openUnit(roomId, unitType);
    setUnitId(created.id);
    setStep(unitType === "קרטון אישי" ? "destination" : "items");
  };

  const saveItems = () => {
    const packed = Object.entries(picked)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));
    store.setUnitItems(unitId, packed);
    setStep("destination");
  };

  const finishPacking = () => {
    store.closeUnit(unitId, dest);
    setSummaryOpen(true);
  };

  const afterSummary = () => {
    setSummaryOpen(false);
    const remainingActive = store
      .itemsOfRoom(roomId)
      .some((i) => i.status === "עובד/הצלה");
    if (remainingActive) {
      setContinueOpen(true);
    } else {
      store.finishRoom(roomId);
      navigate({ to: "/processes" });
    }
  };

  const stepIndex = ["location", "type", "items", "destination"].indexOf(step);

  const footer = (() => {
    if (step === "location")
      return (
        <PrimaryButton
          disabled={!room || mappingError}
          onClick={() => setStep("type")}
        >
          המשך לבחירת סוג אריזה
        </PrimaryButton>
      );
    if (step === "type")
      return (
        <PrimaryButton disabled={!unitType} onClick={startUnit}>
          פתח יחידת אריזה
        </PrimaryButton>
      );
    if (step === "items")
      return (
        <PrimaryButton
          disabled={Object.values(picked).every((q) => !q)}
          onClick={saveItems}
        >
          המשך להזנת יעד
        </PrimaryButton>
      );
    return (
      <PrimaryButton
        disabled={!dest.building || !dest.floor || !dest.room}
        onClick={finishPacking}
      >
        סיום אריזה
      </PrimaryButton>
    );
  })();

  return (
    <MobileShell
      title="יצירת אריזה"
      subtitle={unit ? `יחידה ${unit.id} · ${unit.status}` : "תהליך אריזה"}
      backTo="/processes"
      footer={footer}
    >
      <div className="mb-4 flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      {step === "location" ? (
        <div className="space-y-3">
          <Card>
            <Label>ענף</Label>
            <select
              className="field"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setSection("");
                setRoomId("");
              }}
            >
              <option value="">בחר ענף</option>
              {store.branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <div className="mt-3">
              <Label>מדור</Label>
              <select
                className="field"
                value={section}
                disabled={!branch}
                onChange={(e) => {
                  setSection(e.target.value);
                  setRoomId("");
                }}
              >
                <option value="">בחר מדור</option>
                {store.sectionsOf(branch).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <Label>מספר חדר</Label>
              <select
                className="field"
                value={roomId}
                disabled={!section}
                onChange={(e) => setRoomId(e.target.value)}
              >
                <option value="">בחר חדר</option>
                {store.roomsOf(branch, section).map((r) => (
                  <option key={r.id} value={r.id}>
                    חדר {r.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {mappingError ? (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">יש לסיים את המיפוי</p>
                <p className="text-xs text-muted-foreground">
                  לא ניתן לפתוח אריזה בחדר שטרם מופה.
                </p>
              </div>
            </div>
          ) : null}

          {room && room.mapped ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    חדר {room.roomNumber}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {room.section} · מנהל חדר: {room.roomManager}
                  </p>
                </div>
                <StatusChip status={room.status} />
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {step === "type" ? (
        <div className="space-y-3">
          <Card>
            <Label>סוג יחידת אריזה</Label>
            <div className="grid grid-cols-2 gap-2">
              {PACKING_UNIT_TYPES.map((t) => {
                const active = unitType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUnitType(t)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                      active
                        ? "border-primary bg-primary-soft text-accent-foreground"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {unitType === "קרטון אישי" ? (
              <p className="mt-3 text-xs text-muted-foreground">
                קרטון אישי אינו דורש רישום פריטים — ממשיכים ישירות להזנת היעד.
              </p>
            ) : null}
          </Card>
        </div>
      ) : null}

      {step === "items" ? (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">פריטים בחדר</h3>
            <span className="text-xs text-muted-foreground">סטטוס עובד/הצלה</span>
          </div>
          <ul className="divide-y divide-border">
            {roomItems.map((item) => {
              const qty = picked[item.id] ?? 0;
              const checked = qty > 0;
              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    aria-label={`סימון ${item.name}`}
                    onClick={() =>
                      setPicked((p) => ({ ...p, [item.id]: checked ? 0 : item.quantity }))
                    }
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border ${
                      checked ? "border-primary bg-primary" : "border-input bg-card"
                    }`}
                  >
                    {checked ? <Check className="size-4 text-primary-foreground" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      במלאי החדר: {item.quantity}
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={item.quantity}
                    value={qty}
                    onChange={(e) =>
                      setPicked((p) => ({
                        ...p,
                        [item.id]: Math.max(0, Math.min(item.quantity, Number(e.target.value))),
                      }))
                    }
                    className="field !min-h-10 !w-16 text-center"
                  />
                </li>
              );
            })}
            {roomItems.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                לא נותרו פריטים לאריזה בחדר זה.
              </li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      {step === "destination" ? (
        <div className="space-y-3">
          <Card>
            <Label>בניין יעד</Label>
            <input
              className="field"
              value={dest.building}
              onChange={(e) => setDest({ ...dest, building: e.target.value })}
              placeholder="לדוגמה: בניין B"
            />
            <div className="mt-3">
              <Label>קומה</Label>
              <input
                className="field"
                value={dest.floor}
                onChange={(e) => setDest({ ...dest, floor: e.target.value })}
                placeholder="לדוגמה: 3"
              />
            </div>
            <div className="mt-3">
              <Label>מספר חדר</Label>
              <input
                className="field"
                value={dest.room}
                onChange={(e) => setDest({ ...dest, room: e.target.value })}
                placeholder="לדוגמה: 311"
              />
            </div>
          </Card>
          {unit && unit.items.length > 0 ? (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-foreground">פריטים ביחידה</h3>
              <ul className="space-y-1.5">
                {unit.items.map((i) => (
                  <li key={i.itemId} className="flex justify-between text-sm">
                    <span className="text-foreground">{i.name}</span>
                    <span className="text-muted-foreground">×{i.quantity}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      <Sheet open={summaryOpen} title="האריזה נסגרה">
        <div className="rounded-xl bg-primary-soft p-4 text-center">
          <p className="text-xs text-muted-foreground">מספר יחידת אריזה</p>
          <p className="font-mono text-3xl font-bold tracking-[0.2em] text-primary">{unitId}</p>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <Row k="יעד" v={`${dest.building} · קומה ${dest.floor} · חדר ${dest.room}`} />
          <Row k="חדר מקור" v={room ? `חדר ${room.roomNumber}` : "—"} />
          <Row k="מזהה חדר מלא" v={room ? `${room.branch} / ${room.section} / ${room.roomNumber}` : "—"} />
          <Row k="מנהל מדור" v={room?.sectionManager ?? "—"} />
          <Row k="מנהל חדר" v={room?.roomManager ?? "—"} />
          <Row k="מאריז" v={store.packerId} />
        </dl>
        <div className="mt-5">
          <PrimaryButton onClick={afterSummary}>סגירה</PrimaryButton>
        </div>
      </Sheet>

      <Sheet open={continueOpen} title="האם להמשיך באריזה?">
        <p className="text-sm text-muted-foreground">
          נותרו בחדר פריטים בסטטוס עובד/הצלה.
        </p>
        <div className="mt-4 space-y-2">
          <PrimaryButton
            onClick={() => {
              setContinueOpen(false);
              resetForNextUnit();
            }}
          >
            כן, פתח יחידת אריזה נוספת
          </PrimaryButton>
          <GhostButton
            onClick={() => {
              setContinueOpen(false);
              setPauseOpen(true);
            }}
          >
            לא
          </GhostButton>
        </div>
      </Sheet>

      <Sheet open={pauseOpen} title="סיבת סיום">
        <div className="space-y-2">
          <GhostButton
            onClick={() => {
              store.finishRoom(roomId);
              navigate({ to: "/processes" });
            }}
          >
            לא נותרו פריטים לאריזה
          </GhostButton>
          <GhostButton onClick={() => navigate({ to: "/processes" })}>
            הפסקה זמנית באריזה
          </GhostButton>
        </div>
      </Sheet>
    </MobileShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-left font-medium text-foreground">{v}</dd>
    </div>
  );
}
