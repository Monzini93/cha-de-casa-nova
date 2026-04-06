/**
 * Aplica schema.sql no Neon (usa DATABASE_URL do .env.local na raiz do projeto).
 * Uso: node scripts/apply-schema.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env.local');

if (!existsSync(envPath)) {
  console.error('Crie .env.local na raiz com DATABASE_URL=...');
  process.exit(1);
}

const env = readFileSync(envPath, 'utf8');
const m = env.match(/^DATABASE_URL=(.+)$/m);
if (!m) {
  console.error('DATABASE_URL não encontrada em .env.local');
  process.exit(1);
}

const databaseUrl = m[1].trim();
const sql = neon(databaseUrl);

await sql`
  CREATE TABLE IF NOT EXISTS confirmacoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    whatsapp VARCHAR(32) NOT NULL,
    presente TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_confirmacoes_created ON confirmacoes (created_at ASC)
`;

console.log('Tabelas criadas/atualizadas com sucesso (confirmacoes + índice).');
