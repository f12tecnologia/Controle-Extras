
import './loadEnv.js';
import pg from 'pg';
import Database from '@replit/database';

const { Pool } = pg;

// Conectar ao banco PostgreSQL
const pool = new Pool({
  connectionString: process.env.EXTERNAL_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Conectar ao Replit Database antigo
const db = new Database();

async function migrateData() {
  console.log('🚀 Iniciando migração de dados...');
  
  try {
    // Testar conexão PostgreSQL
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao PostgreSQL');

    // Migrar usuários
    console.log('\n📊 Migrando usuários...');
    const userKeys = await db.list('user:');
    let userCount = 0;
    
    for (const key of userKeys) {
      const userData = await db.get(key);
      if (userData) {
        const email = key.replace('user:', '');
        
        // Verificar se usuário já existe
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO users (id, email, password, name, role, setor, authorized_company_ids, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              email,
              userData.password,
              userData.name || 'Usuário',
              userData.role || 'funcionario',
              userData.setor || null,
              JSON.stringify(userData.authorizedCompanyIds || []),
              userData.createdAt || new Date().toISOString()
            ]
          );
          userCount++;
        }
      }
    }
    console.log(`✅ ${userCount} usuários migrados`);

    // Migrar empresas
    console.log('\n📊 Migrando empresas...');
    const companyKeys = await db.list('company:');
    let companyCount = 0;
    
    for (const key of companyKeys) {
      const companyData = await db.get(key);
      if (companyData) {
        const id = key.replace('company:', '');
        
        const existing = await pool.query('SELECT id FROM companies WHERE id = $1', [id]);
        
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO companies (id, name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              id,
              companyData.name,
              companyData.cnpj || null,
              companyData.endereco || null,
              companyData.cidade || null,
              companyData.estado || null,
              companyData.cep || null,
              companyData.telefone || null,
              companyData.email || null,
              companyData.ativa !== undefined ? companyData.ativa : true,
              companyData.createdAt || new Date().toISOString()
            ]
          );
          companyCount++;
        }
      }
    }
    console.log(`✅ ${companyCount} empresas migradas`);

    // Migrar funcionários
    console.log('\n📊 Migrando funcionários...');
    const employeeKeys = await db.list('employee:');
    let employeeCount = 0;
    
    for (const key of employeeKeys) {
      const employeeData = await db.get(key);
      if (employeeData) {
        const id = key.replace('employee:', '');
        
        const existing = await pool.query('SELECT id FROM employees WHERE id = $1', [id]);
        
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO employees (id, name, cpf, rg, endereco, cidade, estado, cep, telefone, email, 
             data_nascimento, cargo, company_id, ativo, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              id,
              employeeData.name,
              employeeData.cpf || null,
              employeeData.rg || null,
              employeeData.endereco || null,
              employeeData.cidade || null,
              employeeData.estado || null,
              employeeData.cep || null,
              employeeData.telefone || null,
              employeeData.email || null,
              employeeData.dataNascimento || null,
              employeeData.cargo || null,
              employeeData.companyId || null,
              employeeData.ativo !== undefined ? employeeData.ativo : true,
              employeeData.createdAt || new Date().toISOString()
            ]
          );
          employeeCount++;
        }
      }
    }
    console.log(`✅ ${employeeCount} funcionários migrados`);

    // Migrar extras
    console.log('\n📊 Migrando extras...');
    const extraKeys = await db.list('extra:');
    let extraCount = 0;
    
    for (const key of extraKeys) {
      const extraData = await db.get(key);
      if (extraData) {
        const id = key.replace('extra:', '');
        
        const existing = await pool.query('SELECT id FROM extras WHERE id = $1', [id]);
        
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO extras (id, user_id, employee_id, company_id, data_evento, hora_entrada, 
             hora_saida, valor, setor, vaga, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              id,
              extraData.userId || null,
              extraData.employeeId || null,
              extraData.companyId || null,
              extraData.dataEvento || new Date().toISOString().split('T')[0],
              extraData.horaEntrada || '00:00',
              extraData.horaSaida || '00:00',
              parseFloat(extraData.valor || 0),
              extraData.setor || null,
              extraData.vaga || null,
              extraData.status || 'pendente',
              extraData.createdAt || new Date().toISOString()
            ]
          );
          extraCount++;
        }
      }
    }
    console.log(`✅ ${extraCount} extras migrados`);

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log(`Total: ${userCount} usuários, ${companyCount} empresas, ${employeeCount} funcionários, ${extraCount} extras`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateData().catch(console.error);
