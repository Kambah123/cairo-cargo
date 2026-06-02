# Cargo Management System — UI/UX Designer Master Guide

This document serves as the complete UI/UX design blueprint for the Cairo → Nigeria Cargo Management System. It is intended to guide the UI/UX designer in creating a clean, fast, operationally efficient logistics platform optimized for real-world cargo office workflows.

## 1. DESIGN PHILOSOPHY
- The system should prioritize speed over decorative design.
- Interface must feel modern, organized, and professional.
- Every screen should minimize staff thinking and reduce operational friction.
- Touch-friendly design is mandatory.
- The system should feel like a lightweight DHL/FedEx operational dashboard.

## 2. TARGET DEVICES
- Android phones
- Android tablets
- Optional desktop/laptop admin dashboard

## 3. DESIGN STYLE
- Clean logistics dashboard aesthetic
- Minimal clutter
- Large cards and buttons
- Rounded corners
- Simple iconography
- High readability
- Fast visual scanning

## 4. COLOR SYSTEM
- Primary Theme Color: Dark Navy Blue
- Secondary Theme: White / Light Gray
- Accent Color: Cyan or Electric Blue
- Success Status: Green
- Warning Status: Orange
- Error/Hold Status: Red

## 5. DESTINATION COLOR CODING
- Kano = Green
- Abuja = Blue
- Lagos (Future) = Red
- Every sack card and parcel tag should visually reflect destination color.

## 6. STATUS CHIP DESIGN
- Delivered = Green chip
- Awaiting Shipment = Yellow chip
- Arrived = Blue chip
- Hold/Issue = Red chip
- Status chips should be rounded and highly visible.

## 7. MAIN NAVIGATION STRUCTURE
- Bottom navigation bar for mobile/tablet.
- Navigation Tabs: Dashboard, Shipments, Sacks, Search, Settings.
- Avoid sidebar navigation on mobile.

## 8. DASHBOARD SCREEN
- Daily shipment statistics
- Pending shipments
- Revenue summary
- Quick action buttons
- Live operational activity feed
- Large summary cards

## 9. DASHBOARD QUICK ACTION BUTTONS
- New Shipment
- Create Sack
- Search Parcel
- Mark Shipment
- Payments

## 10. NEW SHIPMENT SCREEN
- Customer Information Section
- Receiver Information Section
- Parcel Details Section
- Payment Section
- Photo Upload Area
- Print Label Button
- Send WhatsApp Button

## 11. NEW SHIPMENT SCREEN UX REQUIREMENTS
- Minimal typing
- Large form fields
- Dropdown selections where possible
- Number keypad for weight and pricing
- Fast submission workflow

## 12. PARCEL DETAILS SCREEN
- Tracking Number Display
- Parcel Timeline
- Parcel Status
- Payment Summary
- Linked Sack Information
- Reprint Label Button
- Update Status Button

## 13. PARCEL TIMELINE DESIGN
- Received Cairo
- Packed in Sack
- Shipped
- Arrived Kano/Abuja
- Delivered
- Timeline should use vertical stepper UI.

## 14. SACK MANAGEMENT SCREEN
- Create New Sack
- Assign Destination
- Scan/Add Parcels
- Display Parcel Count
- Display Total Weight
- Generate Sack Label

## 15. SACK SCREEN DESIGN
- Large colored destination card
- Big QR code display
- Parcel count indicator
- Weight indicator
- Expandable child parcel list

## 16. ARRIVAL & DELIVERY SCREEN
- Scan arriving sack
- Verify expected parcels
- Mark parcels arrived
- Enter collector details
- Delivery confirmation

## 17. SEARCH SYSTEM
- Fast global search
- Search by tracking number
- Search by customer phone
- Search by customer name
- Search by receiver name

## 18. SEARCH UI REQUIREMENTS
- Search bar always accessible
- Instant search results
- Large readable results
- Color-coded status indicators

## 19. PARCEL TAG DESIGN
- Tracking Number
- QR Code
- Destination Color Strip
- Customer Name
- Weight
- Fragile/Express labels if applicable

## 20. MASTER SACK LABEL DESIGN
- Large QR Code
- Master Sack ID
- Destination
- Parcel Count
- Total Weight
- Large destination color section

## 21. PRIORITY LABEL SYSTEM
- Fragile = Red Badge
- Express = Yellow Badge
- Paid = Green Badge
- Outstanding Balance = Orange Badge

## 22. NOTIFICATION SYSTEM UI
- WhatsApp notification preview
- Shipment status notification logs
- Delivery confirmation messages

## 23. DARK MODE RECOMMENDATION
- Dark mode preferred for warehouse/cargo environments.
- Dark background with colored cards and chips recommended.

## 24. OFFLINE MODE REQUIREMENTS
- Offline queue indicator
- Auto sync when internet returns
- Visual sync status icon

## 25. STAFF EXPERIENCE PRIORITY
- Staff should complete shipment registration within 30–60 seconds.
- Every workflow should minimize taps and typing.
- Fast scanning and parcel lookup are critical.

## 26. FINAL DESIGN GOAL
- The platform should feel operationally efficient, trustworthy, modern, scalable, and professional.
- The UI should immediately communicate organization and reliability.

## 27. SHIPMENT LIFECYCLE (TECHNICAL)
The system tracks shipments through a granular lifecycle to ensure operational precision.
- **received**: Initial intake in Cairo.
- **awaiting_flight**: Shipment processed but not yet assigned to a batch.
- **ready_for_flight**: Assigned to a batch, waiting for manifest closure.
- **flight_booked**: Manifest closed, flight details (AWB/Flight #) assigned.
- **departed**: Flight has left Cairo.
- **shipped**: In transit to Nigeria.
- **arrived**: Received at the destination branch (Kano/Abuja).
- **ready_for_pickup**: Sorted and ready for customer collection.
- **delivered**: Handover complete, collector details recorded.
- **on_hold**: Operational or payment issue.
- **returned**: Refused at destination and sent back to Cairo.

## 28. OPERATIONAL ALERTS & AUDIT
- **Weight Alerts**: Automatically flagged if the Nigeria arrival weight differs from Cairo weight by **>5% or >2kg**.
- **Mandatory Action Reasons**: Any administrative override (status change, weight adjustment, balance edit) requires a text reason for the immutable audit trail.
- **Audit Log**: Every state-changing action is logged with: Admin Name, Timestamp, Old Value, New Value, and Reason.

## 29. SECURITY & ACCESS CONTROL
- **Inactivity Timeout**: Users are automatically logged out after **30 minutes** of inactivity.
- **Password Hygiene**: Staff must change their password every **90 days** and upon their first login.
- **Role-Based Navigation**:
  - **Cairo Staff**: Focused on intake, photo verification, and batching.
  - **Nigeria Staff**: Focused on arrivals, delivery confirmation, and cash collection.
  - **Admin**: Full visibility, analytics, override capabilities, and **new shipment registration**.

## 30. TECHNICAL SPECIFICATIONS (PRINTING & MEDIA)
- **Label Format**: All parcel tags and sack labels are designed for **A6 (4x6 inch)** printable thermal stickers.
- **Photo Verification**:
  - **Intake**: Mandatory photo of parcel on the scale with timestamp overlay.
  - **Handover**: Optional photo of the collector/ID during delivery.
- **QR Codes**: Every label must contain a QR code that encodes the tracking URL for instant scanning.

## 31. BRANCH & ROLE ARCHITECTURE
- **CAR (Cairo)**: The origin base.
- **KNO (Kano)**: Nigeria Northern Hub (Primary Destination).
- **ABJ (Abuja)**: Nigeria Capital Branch.
- **Soft Delete**: Staff accounts are deactivated, never hard-deleted, to maintain historical audit integrity.

## 32. IMPLEMENTED COLOR PALETTE (REFERENCE)
For developer consistency, use the following hex codes for status chips and destination badges:
- **Kano (Green)**: #38A169
- **Abuja (Blue)**: #3182CE
- **Delivered (Green)**: #38A169 (Text), #C6F6D5 (BG)
- **Arrived (Purple)**: #805AD5 (Text), #E9D8FD (BG)
- **Awaiting Flight (Yellow)**: #D69E2E (Text), #FEF3C7 (BG)
- **On Hold (Red)**: #E53E3E (Text), #FED7D7 (BG)
- **Shipped (Light Blue)**: #3182CE (Text), #EBF8FF (BG)

## 33. RECENT ARCHITECTURAL UPGRADES
- **Global Search Protocol**: An "always-on" master intel search is integrated into the primary navigation, enabling instant tracking across IDs, names, and phone numbers.
- **High-Fidelity "Dark Navy" Mode**: Standardized on a premium `#0B0F19` background for all operational dashboards to reduce eye strain and communicate institutional professionalism.
- **Vertical Lifecycle Stepper**: Converted horizontal tracking to a vertical UI, optimized for mobile readability and accommodating granular "Protocol Verifications".
- **Dynamic Quick-Action Hubs**: Every terminal (Cairo, Nigeria, Admin) features a "Command Center" row for single-tap access to primary mission tasks (New Parcel, Sack Console, Arrival Scan).
- **Mobile Glass-morphism Navigation**: Replaced static bottom bars with a floating, blurred-glass navigation system for Android/Tablet interfaces, maximizing usable screen estate.
