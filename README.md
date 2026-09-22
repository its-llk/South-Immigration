# Item Flow Manager

Master Prompt for AI Application Generator: Material Relocation & Inventory Management System

System Overview & Context

You are tasked with building a web/mobile application for managing end-to-end material relocation ("פינוי ציוד") from old building rooms to new building rooms.
The system tracks items across four distinct, sequential, and interconnected workflows:

Packing Process (תהליך אריזה)

Transportation Process (תהליך הובלה)

Receiving Process (תהליך קבלת ציוד / פריקה)

Distribution Process (תהליך פיזור ציוד בחדרים החדשים)

Shared Navigation & Global Architecture

Root Screen: Home Screen with a central action button for "פינוי ציוד" (Relocation Management).

Process Selection Menu: Clicking "פינוי ציוד" leads to a 4-option menu:

יצירת אריזה (Create Packing Unit)

יצירת הובלה (Create Transport Unit)

קבלת ציוד (Receive/Unload Equipment)

פיזור ציוד (Distribute Equipment)

Detailed Workflows

1. Packing Process Workflow (תהליך אריזה)

Location Selection: User selects Branch (ענף), Department/Section (מדור), and Room Number (מספר חדר) in a unified form.

Room Mapping Validation: System checks if the selected room has been mapped (האם החדר מופה?).

If NO: Display error message "יש לסיים את המיפוי" and halt.

If YES: Proceed to select Packing Unit Type (Personal Box, Professional Box, Pallet, Dolev, Orchestration).

Open Packing Unit: User confirms opening the unit. System updates Packing Unit Status to "נפתחה לנאמן לאריזה".

Item Packing Execution:

Personal Box (קרטון אישי): Bypasses individual item tracking. Directly moves to entering destination data.

Other Packing Units:

Display room items filtered by status (עובד/הצלה), sorted alphabetically.

User selects items, checks them off (V), and inputs packed quantities.

Unit status changes to "אריזה בתהליך".

Destination & Closure:

User enters destination: Building, Floor, Room Number.

User clicks "סיום אריזה".

System updates Packing Unit Status to "אריזה נסגרה" and item status to "פריט נארז".

System generates a unique 5-digit identification number for the packing unit.

Completion Popup & Continued Packing Check:

Pop-up summary appears displaying: Unit 5-digit ID, Destination, Source Room, Full Room ID, Section/Room Manager names, and Packer ID.

System checks if items in status עובד/הצלה remain in the room:

If YES: Ask user "האם להמשיך באריזה?"

Yes: Open a new packing unit for the same room.

No: Provide 2 options: לא נותרו פריטים לאריזה or הפסקה זמנית באריזה.

If NO: System checks if items in status גריטה (Scrap) remain in room:

If Scrap items exist: Change room status to "ממתין לגריטה".

If NO Scrap items exist: Change room status to "חדר סגור".

2. Transportation Process Workflow (תהליך הובלה)

User selects "יצירת הובלה".

Select Transport Type (Truck / Other).

Open Transport Unit by entering Vehicle License Plate Number (Timestamp auto-recorded).

Click "שמירה" (Transport Unit Status changes to "בתהליך העמסה").

Load Packing Units:

Display all available packing units in status "אריזה נסגרה".

User manually selects/checks off packing units to be loaded onto the vehicle.

Click "סיום העמסה":

Status of selected packing units changes to "אריזה בדרך".

Status of transport unit changes to "יחידת הובלה בדרך".

Display confirmation popup (Transport ID, total unit count, date, time).

System automatically sends SMS notification to the distribution list with shipment details.

3. Equipment Receiving Process Workflow (תהליך קבלת ציוד)

User selects "קבלת ציוד".

Select arriving vehicle/shipment from the list of transport units currently "בדרך".

System displays all packing units associated with the selected transport unit.

User verifies physical arrival and checks off (V) each received packing unit.

Click "סיום פריקה".

Discrepancy & Completion Check:

If ALL units received:

Transport unit status changes to "יחידת הובלה נפרקה במלואה".

Packing unit status changes to "אריזה התקבלה". Return to main menu.

If MISSING units detected:

Display list of un-unloaded/missing packing units.

User clicks "סיום העדכון לסטטוס".

Missing packing unit status changes to "אריזה חסרה".

Transport unit status changes to "יחידת הובלה שוחררה".

System sends an automated SMS alert with missing item details.

If SURPLUS units detected: User manually updates packing unit/item status to "התקבל".

4. Equipment Distribution Process Workflow (תהליך פיזור ציוד)

User selects "פיזור ציוד" and enters the "פיזור ציוד בחדרים" screen.

Select a unit for distribution by entering its 5-digit ID or picking from the list of units in status "אריזה התקבלה".

Click "פתח אריזה לפיזור".

Item Unpacking & Verification:

Display items inside the package. User checks off distributed items and enters quantities placed in the new room.

Click "סיום פיזור הפריטים".

Unit Emptying Check:

If FULLY EMPTIED:

Unit status changes to "אריזה פוזרה".

(Surplus items found are routed to Lost & Found / מחסן אבדן).

If ITEMS REMAIN / MISSING:

Warning popup: "שים לב, לא כל הפריטים פוזרו".

Display list of un-distributed/missing items.

User clicks "סיום העדכון להמשך יתר התהליך".

Packing unit status changes to "אריזה פוזרה עם חוסר".

Missing item status changes to "פריט בחוסר".

Automated SMS alert sent with missing item information.

Data Models & Entity Statuses

Key Entities

Room: Branch, Section, Room Number, Mapping Status (Mapped/Unmapped), Room Status (Open, In Packing, Pending Scrap, Closed).

Packing Unit: 5-Digit Unique ID, Type, Source Room, Destination (Building, Floor, Room), Status.

Transport Unit: Transport ID, License Plate Number, Vehicle Type, Date/Time, Status.

Item: Item ID, Name, Source Room, Status, Quantity.

Status Transitions

Packing Unit Statuses: נפתחה לנאמן לאריזה → אריזה בתהליך → אריזה נסגרה → אריזה בדרך → אריזה התקבלה → אריזה פוזרה / אריזה פוזרה עם חוסר / אריזה חסרה.

Item Statuses: עובד/הצלה, גריטה, פריט נארז, פריט בחוסר, התקבל.

Transport Unit Statuses: בתהליך העמסה → יחידת הובלה בדרך → יחידת הובלה נפרקה במלואה / יחידת הובלה שוחררה.

Technical & UX Requirements

Language & RTL: Full Hebrew language support with Right-To-Left UI layout.

Automations: Real-time SMS triggers on shipping completion and missing item/unit detection.

Validation Rules: Block packing if room is not mapped; enforce single-pass input for Branch/Section/Room.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c31971d8-bd57-510f-b904-26bebc0e2e9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
