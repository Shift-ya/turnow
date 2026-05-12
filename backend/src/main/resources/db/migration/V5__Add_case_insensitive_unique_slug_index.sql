-- Enforce case-insensitive uniqueness for tenant slug
-- This prevents duplicates like Bella-Vida and bella-vida from coexisting.

CREATE UNIQUE INDEX IF NOT EXISTS ux_tenants_slug_lower
ON public.tenants (LOWER(slug));
