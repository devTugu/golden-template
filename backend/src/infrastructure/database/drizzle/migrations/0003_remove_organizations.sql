ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_organization";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_organization";--> statement-breakpoint
ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "FK_site_settings_organization";--> statement-breakpoint
DROP INDEX IF EXISTS "IDX_users_organization_id";--> statement-breakpoint
DROP INDEX IF EXISTS "IDX_audit_organization_id";--> statement-breakpoint
DROP INDEX IF EXISTS "IDX_site_settings_organization_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
DROP TABLE IF EXISTS "organization_members";--> statement-breakpoint
DROP TABLE IF EXISTS "organizations";
