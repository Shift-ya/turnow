-- Fix tenant cascade delete constraints
-- The previous migrations claimed ON DELETE CASCADE but Supabase didn't apply them correctly.
-- This migration recreates the constraints properly.

-- Drop and recreate users FK with ON DELETE CASCADE
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_tenant_id;
ALTER TABLE users 
ADD CONSTRAINT fk_users_tenant_id 
FOREIGN KEY (tenant_id) 
REFERENCES tenants (id) 
ON DELETE CASCADE;

-- Drop and recreate professionals FK with ON DELETE CASCADE
ALTER TABLE professionals DROP CONSTRAINT IF EXISTS fk_professionals_tenant_id;
ALTER TABLE professionals 
ADD CONSTRAINT fk_professionals_tenant_id 
FOREIGN KEY (tenant_id) 
REFERENCES tenants (id) 
ON DELETE CASCADE;

-- Drop and recreate services FK with ON DELETE CASCADE
ALTER TABLE services DROP CONSTRAINT IF EXISTS fk_services_tenant_id;
ALTER TABLE services 
ADD CONSTRAINT fk_services_tenant_id 
FOREIGN KEY (tenant_id) 
REFERENCES tenants (id) 
ON DELETE CASCADE;

-- Drop and recreate appointments FK with ON DELETE CASCADE
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS fk_appointments_tenant_id;
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_tenant_id 
FOREIGN KEY (tenant_id) 
REFERENCES tenants (id) 
ON DELETE CASCADE;
