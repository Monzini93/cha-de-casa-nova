import { neon } from '@neondatabase/serverless';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.end();
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return json(res, 500, { error: 'DATABASE_URL não configurada no Vercel' });
  }

  const sql = neon(url);

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, nome, presente, created_at
        FROM confirmacoes
        ORDER BY created_at ASC
      `;
      return json(res, 200, rows);
    } catch (e) {
      console.error(e);
      return json(res, 500, { error: 'Erro ao ler registros' });
    }
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return json(res, 400, { error: 'JSON inválido' });
    }

    const nome = String(body.nome || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const presente = String(body.presente || '').trim();

    if (nome.length < 3) return json(res, 400, { error: 'Nome inválido' });
    if (whatsapp.length < 14) return json(res, 400, { error: 'WhatsApp inválido' });
    if (presente.length < 3) return json(res, 400, { error: 'Descrição do presente inválida' });

    try {
      await sql`
        INSERT INTO confirmacoes (nome, whatsapp, presente)
        VALUES (${nome}, ${whatsapp}, ${presente})
      `;
      return json(res, 201, { ok: true });
    } catch (e) {
      console.error(e);
      return json(res, 500, { error: 'Erro ao salvar' });
    }
  }

  res.statusCode = 405;
  res.end();
}
