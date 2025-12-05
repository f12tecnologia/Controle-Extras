
import Database from "@replit/database";
import bcrypt from 'bcryptjs';

const db = new Database();

async function setupDatabase() {
  try {
    console.log('🔧 Configurando Replit Database...');
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('Bombom@8100', 10);
    
    // Criar usuário admin
    const adminUser = {
      id: 'admin-1',
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
    await db.set('users:list', [adminUser.email]);
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nome:', adminUser.name);
    console.log('🔑 Cargo:', adminUser.role);
    console.log('🏢 Setor:', adminUser.setor);
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
  }
}

setupDatabase();
