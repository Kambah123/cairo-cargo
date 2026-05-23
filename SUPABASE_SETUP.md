# Cairo Cargo - Supabase Integration Guide (Updated)

## Project Overview
The Cairo Cargo application is fully integrated with Supabase for Database, Storage, Auth, and Real-time updates.

## Critical: Database Schema Sync
To ensure the app works correctly with the new features (Admin controls, Weight Alerts, etc.), you **MUST** run the SQL commands found in:
**`SCHEMA_UPDATES.sql`**

This will create:
1. `weight_alerts` table for discrepancy tracking.
2. `admin_actions` table for the audit trail.
3. Add missing columns to `profiles` (branch, phone, is_active).
4. Add missing columns to `batches` (total_weight, total_revenue).

## Features Synced to Supabase

### 1. Staff Management
- **Table**: `profiles`
- **Logic**: Creating staff via the Admin Dashboard triggers a `supabase.auth.signUp` and an upsert to the `profiles` table.
- **Soft Delete**: Setting `is_active = false` in Supabase prevents staff from logging in.

### 2. Photo Verification
- **Bucket**: `cargo-photos` (Public)
- **Logic**: Scale photos taken in Cairo are uploaded to the `shipments/` folder. The resulting Public URL is stored in the `shipments.photo_url` column.

### 3. Weight Discrepancy Alerts
- **Table**: `weight_alerts`
- **Logic**: When Nigeria staff enters a final weight, the `confirmArrival` function in `DataContext.tsx` automatically calculates the difference and inserts a row into this table if the discrepancy exceeds 5% or 2kg.

### 4. Admin Audit Trail
- **Table**: `admin_actions`
- **Logic**: Every 'Override' or 'Adjustment' made by an admin calls `logAdminAction`, which records the admin name, the target shipment, the reason, and the before/after values.

### 5. Real-Time Dashboard
- **Channel**: `postgres_changes`
- **Logic**: All dashboards (Cairo, Nigeria, Admin) use Supabase Realtime subscriptions. Any update to a shipment or batch is broadcasted to all active staff instantly.

## Local Environment
Ensure your `.env.local` has the correct credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
