import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const { Pool } = pg;
const app = express();
const PORT = 3001;

// Configurar conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.EXTERNAL_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('✅ Conectado ao PostgreSQL:', res.rows[0].now);
  }
});

// Configurar CORS
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// User endpoints
app.get('/api/users/:email', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.params.email]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name, role, setor, authorizedCompanyIds } = req.body;

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      `INSERT INTO users (id, email, password, name, role, setor, authorized_company_ids, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, email, hashedPassword, name, role, setor, JSON.stringify(authorizedCompanyIds || []), new Date().toISOString()]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:email', async (req, res) => {
  try {
    const { name, role, setor, authorizedCompanyIds } = req.body;
    const result = await pool.query(
      `UPDATE users SET name = $1, role = $2, setor = $3, authorized_company_ids = $4 
       WHERE email = $5 RETURNING *`,
      [name, role, setor, JSON.stringify(authorizedCompanyIds), req.params.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:email', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE email = $1', [req.params.email]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Company endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const id = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (id, name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa !== undefined ? ativa : true, new Date().toISOString()]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa } = req.body;
    const result = await pool.query(
      `UPDATE companies SET name = $1, cnpj = $2, endereco = $3, cidade = $4, estado = $5, 
       cep = $6, telefone = $7, email = $8, ativa = $9 WHERE id = $10 RETURNING *`,
      [name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employee endpoints
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const id = `employee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { name, cpf, rg, endereco, cidade, estado, cep, telefone, email, data_nascimento, cargo, company_id, ativo } = req.body;

    const result = await pool.query(
      `INSERT INTO employees (id, name, cpf, rg, endereco, cidade, estado, cep, telefone, email, 
       data_nascimento, cargo, company_id, ativo, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [id, name, cpf, rg, endereco, cidade, estado, cep, telefone, email, data_nascimento, cargo, 
       company_id, ativo !== undefined ? ativo : true, new Date().toISOString()]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { name, cpf, rg, endereco, cidade, estado, cep, telefone, email, data_nascimento, cargo, company_id, ativo } = req.body;
    const result = await pool.query(
      `UPDATE employees SET name = $1, cpf = $2, rg = $3, endereco = $4, cidade = $5, estado = $6, 
       cep = $7, telefone = $8, email = $9, data_nascimento = $10, cargo = $11, company_id = $12, ativo = $13 
       WHERE id = $14 RETURNING *`,
      [name, cpf, rg, endereco, cidade, estado, cep, telefone, email, data_nascimento, cargo, company_id, ativo, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extras endpoints
app.get('/api/extras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM extras ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/extras/user/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM extras WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/extras/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM extras WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/extras', async (req, res) => {
  try {
    const id = `extra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { user_id, employee_id, company_id, data_evento, hora_entrada, hora_saida, valor, setor, vaga, status } = req.body;

    const result = await pool.query(
      `INSERT INTO extras (id, user_id, employee_id, company_id, data_evento, hora_entrada, 
       hora_saida, valor, setor, vaga, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [id, user_id, employee_id, company_id, data_evento, hora_entrada, hora_saida, 
       parseFloat(valor), setor, vaga, status || 'pendente', new Date().toISOString()]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/extras/:id', async (req, res) => {
  try {
    const { user_id, employee_id, company_id, data_evento, hora_entrada, hora_saida, valor, setor, vaga, status } = req.body;
    const result = await pool.query(
      `UPDATE extras SET user_id = $1, employee_id = $2, company_id = $3, data_evento = $4, 
       hora_entrada = $5, hora_saida = $6, valor = $7, setor = $8, vaga = $9, status = $10 
       WHERE id = $11 RETURNING *`,
      [user_id, employee_id, company_id, data_evento, hora_entrada, hora_saida, 
       parseFloat(valor), setor, vaga, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Extra not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/extras/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM extras WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/extras-with-details', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, 
             emp.name as employee_name, 
             c.name as company_name
      FROM extras e
      LEFT JOIN employees emp ON e.employee_id = emp.id
      LEFT JOIN companies c ON e.company_id = c.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server rodando na porta ${PORT}`);
});