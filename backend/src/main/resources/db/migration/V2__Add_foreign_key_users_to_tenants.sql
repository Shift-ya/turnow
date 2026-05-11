-- Add foreign key constraint from users to tenants
-- This ensures referential integrity and allows cascade deletes

ALTER TABLE users
ADD CONSTRAINT fk_users_tenant_id
FOREIGN KEY (tenant_id)
REFERENCES tenants (id)
ON DELETE CASCADE;
