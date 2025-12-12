
import Database from "@replit/database";

const db = new Database();

// Helper functions for database operations
export const replitDb = {
  // User operations
  async getUser(email) {
    const user = await db.get(`user:${email}`);
    return user;
  },

  async createUser(userData) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      ...userData,
      created_at: new Date().toISOString(),
    };
    await db.set(`user:${userData.email}`, user);
    
    // Add to users list
    const usersList = await db.get('users:list') || [];
    usersList.push(userData.email);
    await db.set('users:list', usersList);
    
    return user;
  },

  async getAllUsers() {
    const usersList = await db.get('users:list') || [];
    const users = await Promise.all(
      usersList.map(email => db.get(`user:${email}`))
    );
    return users.filter(u => u !== null);
  },

  async updateUser(email, updates) {
    const user = await db.get(`user:${email}`);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
    await db.set(`user:${email}`, updatedUser);
    return updatedUser;
  },

  async deleteUser(email) {
    await db.delete(`user:${email}`);
    const usersList = await db.get('users:list') || [];
    const filtered = usersList.filter(e => e !== email);
    await db.set('users:list', filtered);
  },

  // Company operations
  async getCompany(id) {
    return await db.get(`company:${id}`);
  },

  async getAllCompanies() {
    const companiesList = await db.get('companies:list') || [];
    const companies = await Promise.all(
      companiesList.map(id => db.get(`company:${id}`))
    );
    return companies.filter(c => c !== null);
  },

  async createCompany(companyData) {
    const id = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const company = {
      id,
      ...companyData,
      ativa: companyData.ativa !== undefined ? companyData.ativa : true,
      created_at: new Date().toISOString(),
    };
    await db.set(`company:${id}`, company);
    
    const companiesList = await db.get('companies:list') || [];
    companiesList.push(id);
    await db.set('companies:list', companiesList);
    
    return company;
  },

  async updateCompany(id, updates) {
    const company = await db.get(`company:${id}`);
    if (!company) throw new Error('Company not found');
    
    const updatedCompany = { ...company, ...updates };
    await db.set(`company:${id}`, updatedCompany);
    return updatedCompany;
  },

  async deleteCompany(id) {
    await db.delete(`company:${id}`);
    const companiesList = await db.get('companies:list') || [];
    const filtered = companiesList.filter(cId => cId !== id);
    await db.set('companies:list', filtered);
  },

  // Employee operations
  async getEmployee(id) {
    return await db.get(`employee:${id}`);
  },

  async getAllEmployees() {
    const employeesList = await db.get('employees:list') || [];
    const employees = await Promise.all(
      employeesList.map(id => db.get(`employee:${id}`))
    );
    return employees.filter(e => e !== null);
  },

  async createEmployee(employeeData) {
    const id = `employee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const employee = {
      id,
      ...employeeData,
      ativo: employeeData.ativo !== undefined ? employeeData.ativo : true,
      created_at: new Date().toISOString(),
    };
    await db.set(`employee:${id}`, employee);
    
    const employeesList = await db.get('employees:list') || [];
    employeesList.push(id);
    await db.set('employees:list', employeesList);
    
    return employee;
  },

  async updateEmployee(id, updates) {
    const employee = await db.get(`employee:${id}`);
    if (!employee) throw new Error('Employee not found');
    
    const updatedEmployee = { ...employee, ...updates };
    await db.set(`employee:${id}`, updatedEmployee);
    return updatedEmployee;
  },

  async deleteEmployee(id) {
    await db.delete(`employee:${id}`);
    const employeesList = await db.get('employees:list') || [];
    const filtered = employeesList.filter(eId => eId !== id);
    await db.set('employees:list', filtered);
  },

  // Extras operations
  async getExtra(id) {
    return await db.get(`extra:${id}`);
  },

  async getAllExtras() {
    const extrasList = await db.get('extras:list') || [];
    const extras = await Promise.all(
      extrasList.map(id => db.get(`extra:${id}`))
    );
    return extras.filter(e => e !== null);
  },

  async getExtrasByUserId(userId) {
    const allExtras = await this.getAllExtras();
    return allExtras.filter(extra => extra.user_id === userId);
  },

  async createExtra(extraData) {
    const id = `extra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const extra = {
      id,
      ...extraData,
      status: extraData.status || 'pendente',
      created_at: new Date().toISOString(),
    };
    await db.set(`extra:${id}`, extra);
    
    const extrasList = await db.get('extras:list') || [];
    extrasList.push(id);
    await db.set('extras:list', extrasList);
    
    return extra;
  },

  async updateExtra(id, updates) {
    const extra = await db.get(`extra:${id}`);
    if (!extra) throw new Error('Extra not found');
    
    const updatedExtra = { ...extra, ...updates };
    await db.set(`extra:${id}`, updatedExtra);
    return updatedExtra;
  },

  async deleteExtra(id) {
    await db.delete(`extra:${id}`);
    const extrasList = await db.get('extras:list') || [];
    const filtered = extrasList.filter(eId => eId !== id);
    await db.set('extras:list', filtered);
  },

  async getExtrasWithDetails() {
    const extras = await this.getAllExtras();
    const employees = await this.getAllEmployees();
    const companies = await this.getAllCompanies();
    
    return extras.map(extra => {
      const employee = employees.find(e => e.id === extra.employee_id);
      const company = companies.find(c => c.id === extra.company_id);
      return {
        ...extra,
        employee_name: employee?.name || 'N/A',
        company_name: company?.name || 'N/A',
      };
    });
  },
};

export default replitDb;
