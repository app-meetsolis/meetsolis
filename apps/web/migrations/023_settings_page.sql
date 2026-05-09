ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN users.email_notifications_enabled IS 'Opt-out preference for product emails. Transactional always sent regardless.';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Set when user clicks Cancel; subscription remains active until current_period_end then webhook flips plan to free.';
