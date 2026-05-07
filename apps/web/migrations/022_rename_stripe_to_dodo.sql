-- Migration 022: rename stripe_* columns to dodo_* (Story 5.1)
ALTER TABLE subscriptions RENAME COLUMN stripe_customer_id TO dodo_customer_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO dodo_subscription_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_price_id TO dodo_product_id;
DROP INDEX IF EXISTS idx_subscriptions_stripe_customer_id;
CREATE INDEX idx_subscriptions_dodo_customer_id ON subscriptions(dodo_customer_id);
