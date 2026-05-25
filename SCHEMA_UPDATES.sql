-- 1. Update User Roles
-- Note: Run these outside of a transaction if your Postgres version requires it.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'cairo_staff', 'kano_staff', 'abuja_staff');
    ELSE
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'kano_staff';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'abuja_staff';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END IF;
END $$;

-- 2. Enhance Profiles Table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'all';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- 3. Enhance Batches Table
ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_weight DECIMAL DEFAULT 0;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_revenue DECIMAL DEFAULT 0;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 4. Enhance Shipments Table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS weight_alert BOOLEAN DEFAULT false;

-- 5. Create Weight Alerts Table
CREATE TABLE IF NOT EXISTS weight_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT REFERENCES shipments(id),
    tracking_number TEXT,
    initial_weight DECIMAL,
    final_weight DECIMAL,
    discrepancy DECIMAL,
    status TEXT DEFAULT 'pending', -- 'pending' or 'resolved'
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Admin Actions (Audit Trail) Table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id),
    admin_name TEXT,
    shipment_id TEXT REFERENCES shipments(id),
    action_type TEXT, -- 'override_status', 'edit_details', 'delete_shipment', 'adjust_balance'
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Row Level Security (RLS)
ALTER TABLE weight_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Policy Cleanup and Creation
DO $$ 
BEGIN
    -- Weight Alerts Policies
    DROP POLICY IF EXISTS "Admin full access weight_alerts" ON weight_alerts;
    CREATE POLICY "Admin full access weight_alerts" ON weight_alerts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

    DROP POLICY IF EXISTS "Staff view weight_alerts" ON weight_alerts;
    CREATE POLICY "Staff view weight_alerts" ON weight_alerts FOR SELECT USING (true);

    -- Admin Actions Policies
    DROP POLICY IF EXISTS "Admin full access admin_actions" ON admin_actions;
    CREATE POLICY "Admin full access admin_actions" ON admin_actions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
END $$;

-- 8. Storage Bucket
-- Ensure you create a public bucket named 'cargo-photos' in the Supabase Dashboard.
