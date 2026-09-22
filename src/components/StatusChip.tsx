const tones: Record<string, string> = {
  "נפתחה לנאמן לאריזה": "bg-info-soft text-foreground",
  "אריזה בתהליך": "bg-warning-soft text-warning-foreground",
  "אריזה נסגרה": "bg-success-soft text-foreground",
  "אריזה בדרך": "bg-primary-soft text-accent-foreground",
  "אריזה התקבלה": "bg-success-soft text-foreground",
  "אריזה פוזרה": "bg-secondary text-secondary-foreground",
  "אריזה פוזרה עם חוסר": "bg-destructive-soft text-destructive",
  "אריזה חסרה": "bg-destructive-soft text-destructive",
  "בתהליך העמסה": "bg-warning-soft text-warning-foreground",
  "יחידת הובלה בדרך": "bg-primary-soft text-accent-foreground",
  "יחידת הובלה נפרקה במלואה": "bg-success-soft text-foreground",
  "יחידת הובלה שוחררה": "bg-destructive-soft text-destructive",
  "עובד/הצלה": "bg-primary-soft text-accent-foreground",
  גריטה: "bg-secondary text-muted-foreground",
  "פריט נארז": "bg-success-soft text-foreground",
  "פריט בחוסר": "bg-destructive-soft text-destructive",
  התקבל: "bg-success-soft text-foreground",
  "חדר פתוח": "bg-secondary text-secondary-foreground",
  "ממתין לגריטה": "bg-warning-soft text-warning-foreground",
  "חדר סגור": "bg-secondary text-muted-foreground",
};

export function StatusChip({ status }: { status: string }) {
  const tone = tones[status] ?? "bg-secondary text-secondary-foreground";
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}>
      {status}
    </span>
  );
}
