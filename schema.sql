-- Execute este SQL no console SQL do Neon (Dashboard → SQL Editor) uma vez.

CREATE TABLE IF NOT EXISTS confirmacoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  whatsapp VARCHAR(32) NOT NULL,
  presente TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confirmacoes_created ON confirmacoes (created_at ASC);
