import './loadEnv.js';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@intelfoz.com.br';
const PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Eo@230578.';
const NAME = process.env.SUPERADMIN_NAME || 'Super Admin';
const ROLE = 'admin';
const SETOR = 'Administração';

function getPgSslConfig() {
  const mode = (process.env.DB_SSL || 'auto').toLowerCase();
  const url = process.env.EXTERNAL_DATABASE_URL || '';
  if (mode === 'false' || mode === 'disable' || mode === '0') return false;
  if (mode === 'true' || mode === 'require' || mode === '1') {
    return { rejectUnauthorized: false };
  }
  if (/sslmode=disable/i.test(url)) return false;
  if (/sslmode=(require|verify-ca|verify-full)/i.test(url)) {
    return { rejectUnauthorized: false };
  }
  return false;
}

async function main() {
  if (!process.env.EXTERNAL_DATABASE_URL) {
    console.error('❌ EXTERNAL_DATABASE_URL não definida');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.EXTERNAL_DATABASE_URL,
    ssl: getPgSslConfig(),
  });

  try {
    const host = new URL(process.env.EXTERNAL_DATABASE_URL).host;
    console.log(`🗄️  Banco: ${host}`);

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    const existing = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [EMAIL]);

    // Acesso irrestrito: admin sem restrição de empresas (lista vazia = sem filtro no perfil admin)
    const authorizedCompanyIds = JSON.stringify([]);

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET password = $1, name = $2, role = $3, setor = $4, authorized_company_ids = $5
         WHERE email = $6`,
        [hashedPassword, NAME, ROLE, SETOR, authorizedCompanyIds, EMAIL]
      );
      console.log(`✅ Usuário atualizado: ${EMAIL} (role=${ROLE})`);
    } else {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await pool.query(
        `INSERT INTO users (id, email, password, name, role, setor, authorized_company_ids, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, EMAIL, hashedPassword, NAME, ROLE, SETOR, authorizedCompanyIds, new Date().toISOString()]
      );
      console.log(`✅ Usuário criado: ${EMAIL} (role=${ROLE})`);
    }

    const check = await pool.query(
      'SELECT email, name, role, setor, authorized_company_ids FROM users WHERE email = $1',
      [EMAIL]
    );
    console.log('📋 Confirmação:', check.rows[0]);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
