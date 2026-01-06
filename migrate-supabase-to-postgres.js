import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

const supabaseUrl = 'https://baiamtipehjpssonxzjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaWFtdGlwZWhqcHNzb254empoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2NTksImV4cCI6MjA3MDYwMzY1OX0.uCxzVvNl_OmyBmii3Z4_fJ1Ws-hBK1MkZdY0vo57L1o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const pool = new Pool({
  connectionString: process.env.EXTERNAL_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateData() {
  console.log('🚀 Iniciando migração do Supabase para PostgreSQL...\n');

  try {
    console.log('📥 Exportando dados do Supabase...');
    
    const { data: companies, error: companiesError } = await supabase.from('companies').select('*');
    if (companiesError) console.log(`   ⚠️ Companies: ${companiesError.message}`);
    console.log(`   - Companies: ${companies?.length || 0} registros`);

    const { data: employees, error: employeesError } = await supabase.from('employees').select('*');
    if (employeesError) console.log(`   ⚠️ Employees: ${employeesError.message}`);
    console.log(`   - Employees: ${employees?.length || 0} registros`);

    const { data: extras, error: extrasError } = await supabase.from('extras').select('*');
    if (extrasError) console.log(`   ⚠️ Extras: ${extrasError.message}`);
    console.log(`   - Extras: ${extras?.length || 0} registros`);

    console.log('\n📤 Importando dados para PostgreSQL...');

    let companySuccess = 0;
    for (const company of (companies || [])) {
      try {
        await pool.query(
          `INSERT INTO companies (id, name, cnpj, endereco, cidade, estado, cep, telefone, email, ativa, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET name = $2, cnpj = $3, endereco = $4, cidade = $5, 
           estado = $6, cep = $7, telefone = $8, email = $9, ativa = $10`,
          [
            company.id, 
            company.name, 
            company.cnpj || null,
            company.endereco || null,
            company.cidade || null,
            company.estado || null,
            company.cep || null,
            company.telefone || null,
            company.email || null,
            company.ativa !== undefined ? company.ativa : true,
            company.created_at || new Date().toISOString()
          ]
        );
        companySuccess++;
      } catch (err) {
        console.log(`   ⚠️ Company ${company.id}: ${err.message}`);
      }
    }
    console.log(`   ✅ Companies importadas: ${companySuccess}`);

    let employeeSuccess = 0;
    for (const employee of (employees || [])) {
      try {
        await pool.query(
          `INSERT INTO employees (id, name, cpf, rg, endereco, cidade, estado, cep, telefone, email, 
           data_nascimento, cargo, pix_key, banco, company_id, ativo, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (id) DO UPDATE SET name = $2, cpf = $3, rg = $4, endereco = $5, cidade = $6, 
           estado = $7, cep = $8, telefone = $9, email = $10, data_nascimento = $11, cargo = $12, 
           pix_key = $13, banco = $14, company_id = $15, ativo = $16`,
          [
            employee.id,
            employee.name,
            employee.cpf || null,
            employee.rg || null,
            employee.endereco || null,
            employee.cidade || null,
            employee.estado || null,
            employee.cep || null,
            employee.telefone || null,
            employee.email || null,
            employee.data_nascimento || null,
            employee.cargo || null,
            employee.pix_key || employee.chavePix || null,
            employee.banco || null,
            employee.company_id || null,
            employee.ativo !== undefined ? employee.ativo : true,
            employee.created_at || new Date().toISOString()
          ]
        );
        employeeSuccess++;
      } catch (err) {
        console.log(`   ⚠️ Employee ${employee.id}: ${err.message}`);
      }
    }
    console.log(`   ✅ Employees importados: ${employeeSuccess}`);

    let extraSuccess = 0;
    for (const extra of (extras || [])) {
      try {
        await pool.query(
          `INSERT INTO extras (id, employee_id, company_id, user_id, data_evento, hora_entrada, hora_saida, setor, vaga, valor, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET 
             employee_id = $2, company_id = $3, user_id = $4, data_evento = $5, 
             hora_entrada = $6, hora_saida = $7, setor = $8, vaga = $9, valor = $10, status = $11`,
          [
            extra.id,
            extra.employee_id,
            extra.company_id,
            extra.user_id,
            extra.data_evento,
            extra.hora_entrada,
            extra.hora_saida,
            extra.setor,
            extra.vaga,
            extra.valor,
            extra.status || 'pendente',
            extra.created_at || new Date().toISOString()
          ]
        );
        extraSuccess++;
      } catch (err) {
        console.log(`   ⚠️ Extra ${extra.id}: ${err.message}`);
      }
    }
    console.log(`   ✅ Extras importados: ${extraSuccess}`);

    console.log('\n✅ Migração concluída!');

    const companiesCount = await pool.query('SELECT COUNT(*) FROM companies');
    const employeesCount = await pool.query('SELECT COUNT(*) FROM employees');
    const extrasCount = await pool.query('SELECT COUNT(*) FROM extras');

    console.log('\n📊 Totais no PostgreSQL:');
    console.log(`   - Companies: ${companiesCount.rows[0].count}`);
    console.log(`   - Employees: ${employeesCount.rows[0].count}`);
    console.log(`   - Extras: ${extrasCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await pool.end();
  }
}

migrateData();
