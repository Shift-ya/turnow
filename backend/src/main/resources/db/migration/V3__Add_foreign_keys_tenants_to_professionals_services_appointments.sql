-- Add foreign key constraints from professionals, services and appointments to tenants
-- Ensures referential integrity and cascades deletes when a tenant is removed

ALTER TABLE professionals
ADD CONSTRAINT fk_professionals_tenant_id
FOREIGN KEY (tenant_id)
REFERENCES tenants (id)
ON DELETE CASCADE;

ALTER TABLE services
ADD CONSTRAINT fk_services_tenant_id
FOREIGN KEY (tenant_id)
REFERENCES tenants (id)
ON DELETE CASCADE;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_tenant_id
FOREIGN KEY (tenant_id)
REFERENCES tenants (id)
ON DELETE CASCADE;
