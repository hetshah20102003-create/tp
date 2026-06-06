CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  sheet_id        TEXT,
  script_version  TEXT DEFAULT 'labour-v1',
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES campaigns(id),
  phone           TEXT NOT NULL,
  status          TEXT,   -- connected | no_answer | busy | failed
  outcome         TEXT,   -- completed | cut_abuse | cut_off_script | cut_max_turns | not_interested | callback_requested
  duration_sec    INT,
  turns_count     INT DEFAULT 0,
  collected_data  JSONB DEFAULT '{}',
  llm_model       TEXT,
  stt_service     TEXT,
  tts_service     TEXT,
  started_at      TIMESTAMP,
  ended_at        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id         UUID REFERENCES calls(id),
  turn_index      INT NOT NULL,
  role            TEXT NOT NULL,  -- 'user' | 'assistant'
  text            TEXT,
  script_state    TEXT,
  used_llm        BOOLEAN DEFAULT FALSE,
  tokens_used     INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_campaign ON calls(campaign_id);
CREATE INDEX IF NOT EXISTS idx_turns_call ON turns(call_id);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);

-- Fine-tune export: prompt-response-outcome triples from LLM turns
CREATE OR REPLACE VIEW finetune_export AS
SELECT
  t.text        AS user_text,
  t2.text       AS assistant_text,
  c.outcome,
  c.llm_model,
  t.script_state
FROM turns t
JOIN turns t2 ON t.call_id = t2.call_id AND t2.turn_index = t.turn_index + 1
JOIN calls c  ON t.call_id = c.id
WHERE t.role = 'user'
  AND t2.role = 'assistant'
  AND t2.used_llm = TRUE;
