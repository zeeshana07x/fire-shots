-- ============================================================
-- Fireshots — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Profiles (extends auth.users) ──────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INT  NOT NULL DEFAULT 0,
  plan              TEXT NOT NULL DEFAULT 'none',
  polar_customer_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Batches ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  palette     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own batches"
  ON batches FOR ALL
  USING (auth.uid() = user_id);

-- ── Screenshots ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS screenshots (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     UUID        NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  position     INT         NOT NULL,
  storage_path TEXT,
  eyebrow      TEXT        NOT NULL DEFAULT '',
  headline     TEXT        NOT NULL DEFAULT '',
  supporting   TEXT        NOT NULL DEFAULT '',
  icon         TEXT        NOT NULL DEFAULT 'spark',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own screenshots"
  ON screenshots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM batches
      WHERE batches.id = screenshots.batch_id
        AND batches.user_id = auth.uid()
    )
  );

-- ── Credit Transactions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delta           NUMERIC     NOT NULL,
  reason          TEXT        NOT NULL,
  batch_id        UUID        REFERENCES batches(id) ON DELETE SET NULL,
  screenshot_id   UUID        REFERENCES screenshots(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ── Storage Bucket ───────────────────────────────────────────
-- Run separately in Supabase dashboard or uncomment if using CLI
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('screenshots', 'screenshots', false)
--   ON CONFLICT DO NOTHING;

-- CREATE POLICY "Users can upload own screenshots"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can read own screenshots"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own screenshots"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
