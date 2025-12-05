
import bcrypt from 'bcryptjs';

// Helper para gerar IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Simulação de armazenamento usando localStorage
const storage = {
  get: async (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  delete: async (key) => {
    localStorage.removeItem(key);
  }
};

// Simulação de cliente Supabase usando localStorage
export const supabase = {
  auth: {
    getSession: async () => {
      const sessionData = await storage.get('current_session');
      return { data: { session: sessionData }, error: null };
    },
    
    signInWithPassword: async ({ email, password }) => {
      try {
        const user = await storage.get(`user:${email}`);
        
        if (!user) {
          return { 
            data: null, 
            error: { message: 'Email ou senha inválidos.' } 
          };
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return { 
            data: null, 
            error: { message: 'Email ou senha inválidos.' } 
          };
        }
        
        const session = {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              name: user.name,
              role: user.role,
              setor: user.setor
            }
          },
          access_token: generateId()
        };
        
        await storage.set('current_session', session);
        
        return { data: { session }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    signUp: async ({ email, password, options }) => {
      try {
        const existingUser = await storage.get(`user:${email}`);
        
        if (existingUser) {
          return { 
            data: null, 
            error: { message: 'Este e-mail já está cadastrado.' } 
          };
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
          id: generateId(),
          email,
          password: hashedPassword,
          name: options?.data?.name || '',
          role: options?.data?.role || 'lançador',
          setor: options?.data?.setor || '',
          createdAt: new Date().toISOString(),
          authorizedCompanyIds: []
        };
        
        await storage.set(`user:${email}`, newUser);
        
        const usersList = await storage.get('users:list') || [];
        usersList.push(email);
        await storage.set('users:list', usersList);
        
        return { 
          data: { 
            user: {
              id: newUser.id,
              email: newUser.email,
              user_metadata: {
                name: newUser.name,
                role: newUser.role,
                setor: newUser.setor
              }
            }
          }, 
          error: null 
        };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    signOut: async () => {
      await storage.delete('current_session');
      return { error: null };
    },
    
    getUser: async () => {
      const session = await storage.get('current_session');
      return { data: { user: session?.user || null }, error: null };
    },
    
    updateUser: async ({ password }) => {
      try {
        const session = await storage.get('current_session');
        if (!session?.user) {
          return { data: null, error: { message: 'Não autenticado' } };
        }
        
        const user = await storage.get(`user:${session.user.email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user.password = hashedPassword;
        await storage.set(`user:${session.user.email}`, user);
        
        return { data: { user: session.user }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    resetPasswordForEmail: async (email) => {
      const user = await storage.get(`user:${email}`);
      if (!user) {
        return { error: { message: 'Email não encontrado' } };
      }
      // Simular envio de email
      console.log(`Email de recuperação enviado para ${email}`);
      return { data: {}, error: null };
    },
    
    reauthenticate: async () => {
      return { error: null };
    },
    
    onAuthStateChange: (callback) => {
      return { 
        data: { 
          subscription: { unsubscribe: () => {} } 
        } 
      };
    },
    
    admin: {
      createUser: async ({ email, password, user_metadata }) => {
        return await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: user_metadata } 
        });
      },
      
      listUsers: async () => {
        try {
          const usersList = await storage.get('users:list') || [];
          const users = [];
          
          for (const email of usersList) {
            const user = await storage.get(`user:${email}`);
            if (user) {
              users.push({
                id: user.id,
                email: user.email,
                user_metadata: {
                  name: user.name,
                  role: user.role,
                  setor: user.setor
                }
              });
            }
          }
          
          return { data: { users }, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      
      deleteUser: async (userId) => {
        try {
          const usersList = await storage.get('users:list') || [];
          
          for (const email of usersList) {
            const user = await storage.get(`user:${email}`);
            if (user?.id === userId) {
              await storage.delete(`user:${email}`);
              const updatedList = usersList.filter(e => e !== email);
              await storage.set('users:list', updatedList);
              return { data: {}, error: null };
            }
          }
          
          return { data: null, error: { message: 'Usuário não encontrado' } };
        } catch (error) {
          return { data: null, error };
        }
      },
      
      updateUserById: async (userId, updates) => {
        try {
          const usersList = await storage.get('users:list') || [];
          
          for (const email of usersList) {
            const user = await storage.get(`user:${email}`);
            if (user?.id === userId) {
              if (updates.user_metadata) {
                user.name = updates.user_metadata.name || user.name;
                user.role = updates.user_metadata.role || user.role;
                user.setor = updates.user_metadata.setor || user.setor;
              }
              await storage.set(`user:${email}`, user);
              return { data: { user }, error: null };
            }
          }
          
          return { data: null, error: { message: 'Usuário não encontrado' } };
        } catch (error) {
          return { data: null, error };
        }
      }
    }
  },
  
  from: (table) => ({
    select: async (columns = '*') => {
      const data = await storage.get(`table:${table}`) || [];
      return { data, error: null };
    },
    
    insert: async (records) => {
      const tableData = await storage.get(`table:${table}`) || [];
      const recordsArray = Array.isArray(records) ? records : [records];
      
      const newRecords = recordsArray.map(record => ({
        ...record,
        id: record.id || generateId()
      }));
      
      tableData.push(...newRecords);
      await storage.set(`table:${table}`, tableData);
      
      return { data: newRecords, error: null };
    },
    
    update: async (updates) => ({
      eq: async (column, value) => {
        const tableData = await storage.get(`table:${table}`) || [];
        const updated = tableData.map(record => 
          record[column] === value ? { ...record, ...updates } : record
        );
        await storage.set(`table:${table}`, updated);
        return { data: updated, error: null };
      }
    }),
    
    delete: async () => ({
      eq: async (column, value) => {
        const tableData = await storage.get(`table:${table}`) || [];
        const filtered = tableData.filter(record => record[column] !== value);
        await storage.set(`table:${table}`, filtered);
        return { data: filtered, error: null };
      }
    })
  })
};

export default supabase;
export { supabase as customSupabaseClient };
