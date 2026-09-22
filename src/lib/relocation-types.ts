export type RoomStatus = "חדר פתוח" | "אריזה בתהליך" | "ממתין לגריטה" | "חדר סגור";

export type ItemStatus = "עובד/הצלה" | "גריטה" | "פריט נארז" | "פריט בחוסר" | "התקבל";

export type PackingUnitStatus =
  | "נפתחה לנאמן לאריזה"
  | "אריזה בתהליך"
  | "אריזה נסגרה"
  | "אריזה בדרך"
  | "אריזה התקבלה"
  | "אריזה פוזרה"
  | "אריזה פוזרה עם חוסר"
  | "אריזה חסרה";

export type TransportStatus =
  | "בתהליך העמסה"
  | "יחידת הובלה בדרך"
  | "יחידת הובלה נפרקה במלואה"
  | "יחידת הובלה שוחררה";

export type PackingUnitType =
  | "קרטון אישי"
  | "קרטון מקצועי"
  | "פלטה"
  | "דולב"
  | "ארקסטרציה";

export const PACKING_UNIT_TYPES: PackingUnitType[] = [
  "קרטון אישי",
  "קרטון מקצועי",
  "פלטה",
  "דולב",
  "ארקסטרציה",
];

export interface Room {
  id: string;
  branch: string;
  section: string;
  roomNumber: string;
  mapped: boolean;
  status: RoomStatus;
  sectionManager: string;
  roomManager: string;
}

export interface Item {
  id: string;
  roomId: string;
  name: string;
  status: ItemStatus;
  quantity: number;
}

export interface PackedItem {
  itemId: string;
  name: string;
  quantity: number;
  distributed: boolean;
  distributedQuantity: number;
}

export interface Destination {
  building: string;
  floor: string;
  room: string;
}

export interface PackingUnit {
  id: string;
  type: PackingUnitType;
  roomId: string;
  destination: Destination | null;
  status: PackingUnitStatus;
  items: PackedItem[];
  packerId: string;
  createdAt: string;
  transportId: string | null;
}

export interface TransportUnit {
  id: string;
  plate: string;
  vehicleType: "משאית" | "אחר";
  createdAt: string;
  status: TransportStatus;
  unitIds: string[];
}

export interface SmsMessage {
  id: string;
  sentAt: string;
  to: string;
  body: string;
}
