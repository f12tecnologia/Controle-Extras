
const getApiUrl = () => {
  // Em desenvolvimento (localhost): conectar diretamente ao backend na porta 3001
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  // Em produção: usar URL relativa (Express serve tanto frontend quanto API)
  return '/api';
};

const API_URL = import.meta.env.VITE_API_URL || getApiUrl();

export const replitDb = {
  // User operations
  async getUser(email) {
    const response = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`);
    if (!response.ok) return null;
    return await response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    const result = await response.json();
    // Converter campos snake_case para camelCase
    if (result.authorized_company_ids) {
      result.authorizedCompanyIds = typeof result.authorized_company_ids === 'string' 
        ? JSON.parse(result.authorized_company_ids) 
        : result.authorized_company_ids;
    }
    return result;
  },

  async getAllUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) return [];
    return await response.json();
  },

  async updateUser(email, updates) {
    const response = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async deleteUser(email) {
    const response = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  // Company operations
  async getCompany(id) {
    const response = await fetch(`${API_URL}/companies/${id}`);
    if (!response.ok) return null;
    return await response.json();
  },

  async getAllCompanies() {
    const response = await fetch(`${API_URL}/companies`);
    if (!response.ok) return [];
    return await response.json();
  },

  async createCompany(companyData) {
    const response = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async updateCompany(id, updates) {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async deleteCompany(id) {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  // Employee operations
  async getEmployee(id) {
    const response = await fetch(`${API_URL}/employees/${id}`);
    if (!response.ok) return null;
    return await response.json();
  },

  async getAllEmployees() {
    const response = await fetch(`${API_URL}/employees`);
    if (!response.ok) return [];
    return await response.json();
  },

  async createEmployee(employeeData) {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async updateEmployee(id, updates) {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async deleteEmployee(id) {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  // Extras operations
  async getExtra(id) {
    const response = await fetch(`${API_URL}/extras/${id}`);
    if (!response.ok) return null;
    return await response.json();
  },

  async getAllExtras() {
    const response = await fetch(`${API_URL}/extras`);
    if (!response.ok) return [];
    return await response.json();
  },

  async getExtrasByUserId(userId) {
    const response = await fetch(`${API_URL}/extras/user/${userId}`);
    if (!response.ok) return [];
    return await response.json();
  },

  async createExtra(extraData) {
    const response = await fetch(`${API_URL}/extras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extraData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async updateExtra(id, updates) {
    const response = await fetch(`${API_URL}/extras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async deleteExtra(id) {
    const response = await fetch(`${API_URL}/extras/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return await response.json();
  },

  async getExtrasWithDetails() {
    const response = await fetch(`${API_URL}/extras-with-details`);
    if (!response.ok) return [];
    return await response.json();
  },
};

export default replitDb;
