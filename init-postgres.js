
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.EXTERNAL_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  try {
    console.log('🔧 Iniciando configuração do banco de dados PostgreSQL...');

    // Criar tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        setor VARCHAR(255),
        authorized_company_ids JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela users criada');

    // Criar tabela de empresas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18),
        endereco TEXT,
        cidade VARCHAR(255),
        estado VARCHAR(2),
        cep VARCHAR(10),
        telefone VARCHAR(20),
        email VARCHAR(255),
        ativa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela companies criada');

    // Criar tabela de funcionários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cpf VARCHAR(14),
        rg VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(255),
        estado VARCHAR(2),
        cep VARCHAR(10),
        telefone VARCHAR(20),
        email VARCHAR(255),
        data_nascimento DATE,
        cargo VARCHAR(255),
        company_id VARCHAR(255),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tabela employees criada');

    // Criar tabela de extras
    await pool.query(`
      CREATE TABLE IF NOT EXISTS extras (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        employee_id VARCHAR(255),
        company_id VARCHAR(255),
        data_evento DATE NOT NULL,
        hora_entrada TIME NOT NULL,
        hora_saida TIME NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        setor VARCHAR(255),
        vaga VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela extras criada');

    // Criar índices
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_extras_user ON extras(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_extras_employee ON extras(employee_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_extras_company ON extras(company_id)');
    console.log('✅ Índices criados');

    console.log('🎉 Banco de dados PostgreSQL configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
