
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://baiamtipehjpssonxzjh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaWFtdGlwZWhqcHNzb254empoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyNzY1OSwiZXhwIjoyMDcwNjAzNjU5fQ.9XqBh5MqF_HqW-wjTRzPBDp2JfbHcRSGQx0QF8y0GZ4';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Criando usuário administrador...');
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'leticia.silva.l1998@gmail.com',
      password: 'Bombom@8100',
      email_confirm: true,
      user_metadata: {
        name: 'Letícia Silva',
        role: 'admin',
        setor: 'Administração'
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      console.error('Detalhes:', error);
    } else {
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Nome:', data.user.user_metadata.name);
      console.log('Role:', data.user.user_metadata.role);
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

createAdminUser();
