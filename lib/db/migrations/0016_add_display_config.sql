-- Migration 0016: Add display_config column to health_agents
-- Adds UI configuration metadata for dynamic rendering of product outputs

ALTER TABLE "health_agents"
ADD COLUMN "display_config" jsonb;

COMMENT ON COLUMN "health_agents"."display_config" IS 'UI configuration for dynamic rendering: layout, field labels, icons, colors, display types';
