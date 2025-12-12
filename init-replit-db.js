
import Database from "@replit/database";
import bcrypt from 'bcryptjs';

const db = new Database();

async function initDatabase() {
  try {
    console.log('🔧 Inicializando Replit Database...');
    
    // Check if admin already exists
    const existingAdmin = await db.get('user:leticia.silva.l1998@gmail.com');
    
    if (existingAdmin) {
      console.log('✅ Usuário administrador já existe!');
      return;
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('Bombom@8100', 10);
    
    // Criar usuário admin
    const adminUser = {
      id: `user_${Date.now()}_admin`,
      email: 'leticia.silva.l1998@gmail.com',
      password: hashedPassword,
      name: 'Letícia Silva',
      role: 'admin',
      setor: 'Administração',
      createdAt: new Date().toISOString(),
      authorizedCompanyIds: []
    };
    
    // Salvar no banco
    await db.set(`user:${adminUser.email}`, adminUser);
    
    // Inicializar listas
    await db.set('users:list', [adminUser.email]);
    await db.set('companies:list', []);
    await db.set('employees:list', []);
    await db.set('extras:list', []);
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nome:', adminUser.name);
    console.log('🔑 Cargo:', adminUser.role);
    console.log('🏢 Setor:', adminUser.setor);
    console.log('\n🎉 Banco de dados inicializado!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
  }
}

initDatabase();
