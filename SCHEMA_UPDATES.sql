-- Enum Updates
DO $$ BEGIN
    CREATE TYPE user_role_new AS ENUM ('cairo_staff', 'kano_staff', 'abuja_staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add branch and phone to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'all';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update batches table
ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_weight DECIMAL DEFAULT 0;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_revenue DECIMAL DEFAULT 0;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update shipments table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS weight_alert BOOLEAN DEFAULT false;

-- Create weight_alerts table
CREATE TABLE IF NOT EXISTS weight_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT REFERENCES shipments(id),
    tracking_number TEXT,
    initial_weight DECIMAL,
    final_weight DECIMAL,
    discrepancy DECIMAL,
    status TEXT DEFAULT 'pending',
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_actions table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id),
    admin_name TEXT,
    shipment_id TEXT REFERENCES shipments(id),
    action_type TEXT,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
ALTER TABLE weight_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access to weight_alerts" ON weight_alerts
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Nigeria staff view weight_alerts" ON weight_alerts
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('kano_staff', 'abuja_staff')));

CREATE POLICY "Admin only access to admin_actions" ON admin_actions
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
