
import express from 'express';
import Database from '@replit/database';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();
const db = new Database();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// User endpoints
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await db.get(`user:${req.params.email}`);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const usersList = await db.get('users:list') || [];
    const users = await Promise.all(
      usersList.map(email => db.get(`user:${email}`))
    );
    res.json(users.filter(u => u !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name, role, setor, authorizedCompanyIds } = req.body;
    
    const existingUser = await db.get(`user:${email}`);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      role,
      setor,
      authorizedCompanyIds: authorizedCompanyIds || [],
      created_at: new Date().toISOString(),
    };

    await db.set(`user:${email}`, user);
    
    const usersList = await db.get('users:list') || [];
    usersList.push(email);
    await db.set('users:list', usersList);
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:email', async (req, res) => {
  try {
    const user = await db.get(`user:${req.params.email}`);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = { ...user, ...req.body };
    await db.set(`user:${req.params.email}`, updatedUser);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:email', async (req, res) => {
  try {
    await db.delete(`user:${req.params.email}`);
    const usersList = await db.get('users:list') || [];
    const filtered = usersList.filter(e => e !== req.params.email);
    await db.set('users:list', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Company endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const companiesList = await db.get('companies:list') || [];
    const companies = await Promise.all(
      companiesList.map(id => db.get(`company:${id}`))
    );
    res.json(companies.filter(c => c !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await db.get(`company:${req.params.id}`);
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const id = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const company = {
      id,
      ...req.body,
      ativa: req.body.ativa !== undefined ? req.body.ativa : true,
      created_at: new Date().toISOString(),
    };
    
    await db.set(`company:${id}`, company);
    
    const companiesList = await db.get('companies:list') || [];
    companiesList.push(id);
    await db.set('companies:list', companiesList);
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const company = await db.get(`company:${req.params.id}`);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const updatedCompany = { ...company, ...req.body };
    await db.set(`company:${req.params.id}`, updatedCompany);
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    await db.delete(`company:${req.params.id}`);
    const companiesList = await db.get('companies:list') || [];
    const filtered = companiesList.filter(cId => cId !== req.params.id);
    await db.set('companies:list', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employee endpoints
app.get('/api/employees', async (req, res) => {
  try {
    const employeesList = await db.get('employees:list') || [];
    const employees = await Promise.all(
      employeesList.map(id => db.get(`employee:${id}`))
    );
    res.json(employees.filter(e => e !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await db.get(`employee:${req.params.id}`);
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const id = `employee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const employee = {
      id,
      ...req.body,
      ativo: req.body.ativo !== undefined ? req.body.ativo : true,
      created_at: new Date().toISOString(),
    };
    
    await db.set(`employee:${id}`, employee);
    
    const employeesList = await db.get('employees:list') || [];
    employeesList.push(id);
    await db.set('employees:list', employeesList);
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const employee = await db.get(`employee:${req.params.id}`);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = { ...employee, ...req.body };
    await db.set(`employee:${req.params.id}`, updatedEmployee);
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.delete(`employee:${req.params.id}`);
    const employeesList = await db.get('employees:list') || [];
    const filtered = employeesList.filter(eId => eId !== req.params.id);
    await db.set('employees:list', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extras endpoints
app.get('/api/extras', async (req, res) => {
  try {
    const extrasList = await db.get('extras:list') || [];
    const extras = await Promise.all(
      extrasList.map(id => db.get(`extra:${id}`))
    );
    res.json(extras.filter(e => e !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/extras/user/:userId', async (req, res) => {
  try {
    const extrasList = await db.get('extras:list') || [];
    const extras = await Promise.all(
      extrasList.map(id => db.get(`extra:${id}`))
    );
    const userExtras = extras.filter(e => e && e.user_id === req.params.userId);
    res.json(userExtras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/extras/:id', async (req, res) => {
  try {
    const extra = await db.get(`extra:${req.params.id}`);
    res.json(extra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/extras', async (req, res) => {
  try {
    const id = `extra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const extra = {
      id,
      ...req.body,
      status: req.body.status || 'pendente',
      created_at: new Date().toISOString(),
    };
    
    await db.set(`extra:${id}`, extra);
    
    const extrasList = await db.get('extras:list') || [];
    extrasList.push(id);
    await db.set('extras:list', extrasList);
    
    res.json(extra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/extras/:id', async (req, res) => {
  try {
    const extra = await db.get(`extra:${req.params.id}`);
    if (!extra) {
      return res.status(404).json({ error: 'Extra not found' });
    }

    const updatedExtra = { ...extra, ...req.body };
    await db.set(`extra:${req.params.id}`, updatedExtra);
    res.json(updatedExtra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/extras/:id', async (req, res) => {
  try {
    await db.delete(`extra:${req.params.id}`);
    const extrasList = await db.get('extras:list') || [];
    const filtered = extrasList.filter(eId => eId !== req.params.id);
    await db.set('extras:list', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/extras-with-details', async (req, res) => {
  try {
    const extrasList = await db.get('extras:list') || [];
    const employeesList = await db.get('employees:list') || [];
    const companiesList = await db.get('companies:list') || [];
    
    const extras = await Promise.all(extrasList.map(id => db.get(`extra:${id}`)));
    const employees = await Promise.all(employeesList.map(id => db.get(`employee:${id}`)));
    const companies = await Promise.all(companiesList.map(id => db.get(`company:${id}`)));
    
    const extrasWithDetails = extras.filter(e => e !== null).map(extra => {
      const employee = employees.find(e => e && e.id === extra.employee_id);
      const company = companies.find(c => c && c.id === extra.company_id);
      return {
        ...extra,
        employee_name: employee?.name || 'N/A',
        company_name: company?.name || 'N/A',
      };
    });
    
    res.json(extrasWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server rodando na porta ${PORT}`);
});
