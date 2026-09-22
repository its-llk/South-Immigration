import * as React from "react";
import type {
  Destination,
  Item,
  PackingUnit,
  PackingUnitType,
  Room,
  SmsMessage,
  TransportUnit,
} from "./relocation-types";

const STORAGE_KEY = "relocation-state-v1";
const PACKER_ID = "נאמן אריזה 4471";
const SMS_LIST = "רשימת תפוצה — לוגיסטיקה";

interface State {
  rooms: Room[];
  items: Item[];
  units: PackingUnit[];
  transports: TransportUnit[];
  messages: SmsMessage[];
}

const itemNames = [
  "כיסא משרדי",
  "מסך מחשב 24״",
  "מדפסת לייזר",
  "שולחן עבודה",
  "ארון מתכת",
  "מחשב נייד",
  "טלפון שולחני",
  "ספריית עץ",
  "מגירה ניידת",
  "מקרן",
];

function makeSeed(): State {
  const rooms: Room[] = [
    {
      id: "r1",
      branch: "ענף מרכז",
      section: "מדור פיננסים",
      roomNumber: "204",
      mapped: true,
      status: "חדר פתוח",
      sectionManager: "דנה לוי",
      roomManager: "רון כהן",
    },
    {
      id: "r2",
      branch: "ענף מרכז",
      section: "מדור פיננסים",
      roomNumber: "205",
      mapped: false,
      status: "חדר פתוח",
      sectionManager: "דנה לוי",
      roomManager: "מאיה בר",
    },
    {
      id: "r3",
      branch: "ענף מרכז",
      section: "מדור משאבי אנוש",
      roomNumber: "310",
      mapped: true,
      status: "חדר פתוח",
      sectionManager: "איתי שגב",
      roomManager: "נועה פרץ",
    },
    {
      id: "r4",
      branch: "ענף צפון",
      section: "מדור תפעול",
      roomNumber: "118",
      mapped: true,
      status: "חדר פתוח",
      sectionManager: "יוסי אדרי",
      roomManager: "טל אביב",
    },
    {
      id: "r5",
      branch: "ענף צפון",
      section: "מדור תפעול",
      roomNumber: "119",
      mapped: false,
      status: "חדר פתוח",
      sectionManager: "יוסי אדרי",
      roomManager: "גיא נחום",
    },
    {
      id: "r6",
      branch: "ענף דרום",
      section: "מדור לוגיסטיקה",
      roomNumber: "012",
      mapped: true,
      status: "חדר פתוח",
      sectionManager: "שירה מזרחי",
      roomManager: "אורי דהן",
    },
  ];

  const items: Item[] = [];
  rooms.forEach((room, roomIndex) => {
    const count = 5 + (roomIndex % 3);
    for (let i = 0; i < count; i += 1) {
      const name = itemNames[(roomIndex * 3 + i) % itemNames.length]!;
      items.push({
        id: `${room.id}-i${i}`,
        roomId: room.id,
        name,
        status: i === count - 1 && roomIndex % 2 === 0 ? "גריטה" : "עובד/הצלה",
        quantity: 1 + ((i + roomIndex) % 3),
      });
    }
  });

  return { rooms, items, units: [], transports: [], messages: [] };
}

function load(): State {
  if (typeof window === "undefined") return makeSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeSeed();
    return JSON.parse(raw) as State;
  } catch {
    return makeSeed();
  }
}

interface StoreValue extends State {
  packerId: string;
  branches: string[];
  sectionsOf: (branch: string) => string[];
  roomsOf: (branch: string, section: string) => Room[];
  roomById: (id: string) => Room | undefined;
  itemsOfRoom: (roomId: string) => Item[];
  unitById: (id: string) => PackingUnit | undefined;
  openUnit: (roomId: string, type: PackingUnitType) => PackingUnit;
  setUnitItems: (unitId: string, packed: { itemId: string; quantity: number }[]) => void;
  closeUnit: (unitId: string, destination: Destination) => void;
  finishRoom: (roomId: string) => void;
  openTransport: (plate: string, vehicleType: "משאית" | "אחר") => TransportUnit;
  loadTransport: (transportId: string, unitIds: string[]) => void;
  receiveTransport: (transportId: string, receivedUnitIds: string[]) => void;
  distributeUnit: (
    unitId: string,
    distributed: { itemId: string; quantity: number }[],
  ) => { complete: boolean; missing: string[] };
  resetAll: () => void;
}

const StoreContext = React.createContext<StoreValue | null>(null);

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

export function RelocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => makeSeed());
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = React.useMemo<StoreValue>(() => {
    const sendSms = (draft: State, body: string) => {
      draft.messages = [
        {
          id: `sms-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          sentAt: new Date().toISOString(),
          to: SMS_LIST,
          body,
        },
        ...draft.messages,
      ];
    };

    const nextUnitId = (units: PackingUnit[]): string => {
      let id = "";
      do {
        id = String(Math.floor(10000 + Math.random() * 89999));
      } while (units.some((u) => u.id === id));
      return id;
    };

    return {
      ...state,
      packerId: PACKER_ID,
      branches: uniq(state.rooms.map((r) => r.branch)),
      sectionsOf: (branch) =>
        uniq(state.rooms.filter((r) => r.branch === branch).map((r) => r.section)),
      roomsOf: (branch, section) =>
        state.rooms.filter((r) => r.branch === branch && r.section === section),
      roomById: (id) => state.rooms.find((r) => r.id === id),
      itemsOfRoom: (roomId) => state.items.filter((i) => i.roomId === roomId),
      unitById: (id) => state.units.find((u) => u.id === id),

      openUnit: (roomId, type) => {
        const unit: PackingUnit = {
          id: nextUnitId(state.units),
          type,
          roomId,
          destination: null,
          status: "נפתחה לנאמן לאריזה",
          items: [],
          packerId: PACKER_ID,
          createdAt: new Date().toISOString(),
          transportId: null,
        };
        setState((prev) => ({
          ...prev,
          units: [unit, ...prev.units],
          rooms: prev.rooms.map((r) =>
            r.id === roomId ? { ...r, status: "אריזה בתהליך" } : r,
          ),
        }));
        return unit;
      },

      setUnitItems: (unitId, packed) => {
        setState((prev) => ({
          ...prev,
          units: prev.units.map((u) =>
            u.id === unitId
              ? {
                  ...u,
                  status: "אריזה בתהליך",
                  items: packed.map((p) => ({
                    itemId: p.itemId,
                    name: prev.items.find((i) => i.id === p.itemId)?.name ?? "פריט",
                    quantity: p.quantity,
                    distributed: false,
                    distributedQuantity: 0,
                  })),
                }
              : u,
          ),
        }));
      },

      closeUnit: (unitId, destination) => {
        setState((prev) => {
          const unit = prev.units.find((u) => u.id === unitId);
          if (!unit) return prev;
          const packedIds = new Set(unit.items.map((i) => i.itemId));
          return {
            ...prev,
            units: prev.units.map((u) =>
              u.id === unitId ? { ...u, destination, status: "אריזה נסגרה" } : u,
            ),
            items: prev.items.map((i) =>
              packedIds.has(i.id) ? { ...i, status: "פריט נארז" } : i,
            ),
          };
        });
      },

      finishRoom: (roomId) => {
        setState((prev) => {
          const remainingScrap = prev.items.some(
            (i) => i.roomId === roomId && i.status === "גריטה",
          );
          const remainingActive = prev.items.some(
            (i) => i.roomId === roomId && i.status === "עובד/הצלה",
          );
          if (remainingActive) return prev;
          return {
            ...prev,
            rooms: prev.rooms.map((r) =>
              r.id === roomId
                ? { ...r, status: remainingScrap ? "ממתין לגריטה" : "חדר סגור" }
                : r,
            ),
          };
        });
      },

      openTransport: (plate, vehicleType) => {
        const transport: TransportUnit = {
          id: String(Math.floor(1000 + Math.random() * 8999)),
          plate,
          vehicleType,
          createdAt: new Date().toISOString(),
          status: "בתהליך העמסה",
          unitIds: [],
        };
        setState((prev) => ({ ...prev, transports: [transport, ...prev.transports] }));
        return transport;
      },

      loadTransport: (transportId, unitIds) => {
        setState((prev) => {
          const draft: State = {
            ...prev,
            transports: prev.transports.map((t) =>
              t.id === transportId
                ? { ...t, unitIds, status: "יחידת הובלה בדרך" }
                : t,
            ),
            units: prev.units.map((u) =>
              unitIds.includes(u.id)
                ? { ...u, status: "אריזה בדרך", transportId }
                : u,
            ),
          };
          sendSms(
            draft,
            `יצאה הובלה מס' ${transportId} · ${unitIds.length} יחידות אריזה בדרך · ${new Date().toLocaleString("he-IL")}`,
          );
          return draft;
        });
      },

      receiveTransport: (transportId, receivedUnitIds) => {
        setState((prev) => {
          const transport = prev.transports.find((t) => t.id === transportId);
          if (!transport) return prev;
          const missing = transport.unitIds.filter((id) => !receivedUnitIds.includes(id));
          const draft: State = {
            ...prev,
            units: prev.units.map((u) => {
              if (receivedUnitIds.includes(u.id)) return { ...u, status: "אריזה התקבלה" };
              if (missing.includes(u.id)) return { ...u, status: "אריזה חסרה" };
              return u;
            }),
            transports: prev.transports.map((t) =>
              t.id === transportId
                ? {
                    ...t,
                    status:
                      missing.length === 0
                        ? "יחידת הובלה נפרקה במלואה"
                        : "יחידת הובלה שוחררה",
                  }
                : t,
            ),
          };
          if (missing.length > 0) {
            sendSms(
              draft,
              `התראה: בהובלה ${transportId} חסרות ${missing.length} יחידות אריזה — ${missing.join(", ")}`,
            );
          }
          return draft;
        });
      },

      distributeUnit: (unitId, distributed) => {
        const unit = state.units.find((u) => u.id === unitId);
        const missingNames: string[] = [];
        if (unit) {
          unit.items.forEach((item) => {
            const match = distributed.find((d) => d.itemId === item.itemId);
            if (!match || match.quantity < item.quantity) missingNames.push(item.name);
          });
        }
        const complete = missingNames.length === 0;
        setState((prev) => {
          const draft: State = {
            ...prev,
            units: prev.units.map((u) =>
              u.id === unitId
                ? {
                    ...u,
                    status: complete ? "אריזה פוזרה" : "אריזה פוזרה עם חוסר",
                    items: u.items.map((item) => {
                      const match = distributed.find((d) => d.itemId === item.itemId);
                      return {
                        ...item,
                        distributed: !!match && match.quantity >= item.quantity,
                        distributedQuantity: match?.quantity ?? 0,
                      };
                    }),
                  }
                : u,
            ),
            items: prev.items.map((i) => {
              const inUnit = unit?.items.find((it) => it.itemId === i.id);
              if (!inUnit) return i;
              const match = distributed.find((d) => d.itemId === i.id);
              const ok = !!match && match.quantity >= inUnit.quantity;
              return { ...i, status: ok ? "התקבל" : "פריט בחוסר" };
            }),
          };
          if (!complete) {
            sendSms(
              draft,
              `התראה: אריזה ${unitId} פוזרה עם חוסר — פריטים חסרים: ${missingNames.join(", ")}`,
            );
          }
          return draft;
        });
        return { complete, missing: missingNames };
      },

      resetAll: () => setState(makeSeed()),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useRelocation() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useRelocation must be used inside RelocationProvider");
  return ctx;
}
