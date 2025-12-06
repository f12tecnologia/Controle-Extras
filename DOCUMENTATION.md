
# Sistema de Cadastro de Extras

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Funcionalidades](#funcionalidades)
6. [Perfis de Usuário](#perfis-de-usuário)
7. [Instalação e Configuração](#instalação-e-configuração)
8. [Guia de Uso](#guia-de-uso)
9. [API e Integrações](#api-e-integrações)
10. [Segurança](#segurança)
11. [Manutenção](#manutenção)

---

## 📖 Visão Geral

O **Sistema de Cadastro de Extras** é uma aplicação web completa desenvolvida para gerenciar lançamentos de extras (horas adicionais, serviços extras) com controle granular de acesso baseado em perfis de usuário. O sistema permite o cadastro, aprovação e emissão de recibos em PDF, além de relatórios detalhados em Excel.

### Principais Características

- ✅ Autenticação segura com Supabase
- ✅ Controle de acesso baseado em perfis (RBAC)
- ✅ Gestão completa de funcionários e empresas
- ✅ Workflow de aprovação de extras
- ✅ Geração automática de recibos em PDF
- ✅ Relatórios customizáveis em Excel
- ✅ Interface responsiva e moderna
- ✅ Dashboard com estatísticas em tempo real

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Login   │  │Dashboard │  │ Extras   │  │Reports  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│         │              │              │            │     │
│         └──────────────┴──────────────┴────────────┘     │
│                          │                               │
│                    ┌─────▼─────┐                        │
│                    │  Context  │                        │
│                    │   (Auth)  │                        │
│                    └─────┬─────┘                        │
└──────────────────────────┼──────────────────────────────┘
                           │
                    ┌──────▼───────┐
                    │   SUPABASE   │
                    │  (Backend)   │
                    ├──────────────┤
                    │ Auth Service │
                    │ PostgreSQL   │
                    │ Storage      │
                    │ Edge Funcs   │
                    └──────────────┘
```

### Fluxo de Dados

1. **Autenticação**: Usuário → Auth Context → Supabase Auth
2. **Operações CRUD**: Componente → Supabase Client → PostgreSQL
3. **Aprovações**: Gestor → Atualização Status → Geração PDF → Storage
4. **Relatórios**: Filtros → Query → Processamento → Excel Export

---

## 🛠️ Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.2.0 | Biblioteca principal para UI |
| Vite | 4.4.5 | Build tool e dev server |
| React Router | 6.16.0 | Roteamento SPA |
| Tailwind CSS | 3.3.3 | Framework CSS utility-first |
| Framer Motion | 10.16.4 | Animações fluidas |
| Radix UI | - | Componentes acessíveis |

### Backend & Database

| Tecnologia | Descrição |
|------------|-----------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Banco de dados relacional |
| Row Level Security | Segurança a nível de linha |

### Bibliotecas Auxiliares

| Biblioteca | Uso |
|------------|-----|
| jsPDF | Geração de PDFs |
| html2canvas | Captura de elementos HTML |
| XLSX | Export para Excel |
| React Helmet | Meta tags dinâmicas |

---

## 📂 Estrutura do Projeto

```
sistema-extras/
│
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Companies/       # Gestão de empresas
│   │   ├── Employees/       # Gestão de funcionários
│   │   ├── Profile/         # Perfil do usuário
│   │   ├── Receipts/        # Componentes de recibos
│   │   ├── Reports/         # Componentes de relatórios
│   │   ├── Users/           # Gestão de usuários
│   │   └── ui/              # Componentes UI base (Radix)
│   │
│   ├── contexts/            # React Contexts
│   │   └── SupabaseAuthContext.jsx  # Autenticação
│   │
│   ├── helpers/             # Funções auxiliares
│   │   ├── pdf.js           # Geração de PDFs
│   │   └── receiptActions.js # Ações de recibos
│   │
│   ├── lib/                 # Bibliotecas e configs
│   │   ├── customSupabaseClient.js  # Cliente Supabase
│   │   └── utils.js         # Utilitários gerais
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ExtrasForm.jsx
│   │   ├── Employees.jsx
│   │   ├── Companies.jsx
│   │   ├── Receipts.jsx
│   │   ├── Reports.jsx
│   │   ├── Users.jsx
│   │   ├── Profile.jsx
│   │   └── ...
│   │
│   ├── App.jsx              # Componente raiz
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
│
├── plugins/                 # Plugins Vite
├── tools/                   # Ferramentas de build
├── public/                  # Arquivos públicos
├── package.json             # Dependências
├── vite.config.js           # Configuração Vite
└── tailwind.config.js       # Configuração Tailwind
```

---

## ⚙️ Funcionalidades

### 1. Autenticação e Autorização

**Recursos:**
- Login com email/senha
- Recuperação de senha via email
- Alteração de senha
- Sessões persistentes
- Logout seguro

**Perfis de Acesso:**
- **Lançador**: Cria e gerencia próprios extras
- **Gestor**: Aprova extras, gerencia empresas e usuários
- **Admin**: Acesso total ao sistema

### 2. Gestão de Funcionários

**Operações:**
- ✅ Cadastro de funcionários
- ✅ Edição de dados (nome, CPF, telefone, banco, PIX)
- ✅ Ativação/Desativação
- ✅ Exclusão (com confirmação)
- ✅ Busca e filtros

**Campos:**
- Nome completo
- CPF
- Telefone
- Banco
- Chave PIX
- Status (Ativo/Inativo)

### 3. Gestão de Empresas

**Operações:**
- ✅ Cadastro de empresas parceiras
- ✅ Edição (nome, CNPJ)
- ✅ Status (Ativa/Inativa)
- ✅ Exclusão
- ✅ Autorização de acesso por lançador

**Campos:**
- Nome da empresa
- CNPJ
- Status

### 4. Lançamento de Extras

**Processo:**
1. Seleção do funcionário
2. Seleção da empresa autorizada
3. Preenchimento dos dados:
   - Data do evento
   - Horário de entrada/saída
   - Setor/Atração
   - Vaga
   - Valor

**Validações:**
- Empresa deve estar autorizada para o lançador
- Funcionário deve estar ativo
- Data não pode ser futura
- Valor deve ser positivo

### 5. Aprovação de Recibos

**Workflow:**

```
┌─────────────┐
│  Pendente   │
└──────┬──────┘
       │
       ├─── Ciente ───────► [Gera PDF simples]
       │
       ├─── Aprovado ─────► [Gera PDF oficial]
       │
       └─── Rejeitado ────► [Não gera PDF]
```

**Ações do Gestor:**
- **Ciente**: Marca como visualizado, gera recibo provisório
- **Aprovado**: Aprova oficialmente, gera recibo definitivo, notifica lançador
- **Rejeitado**: Recusa o lançamento

**Detalhes da Aprovação:**
- Visualização agrupada por funcionário
- Total calculado automaticamente
- Aprovação individual ou em lote
- Download de PDF após aprovação

### 6. Relatórios

**Tipos de Relatório:**

#### A) Relatório Resumo
- Visualização tabular com totais
- Agrupamento por empresa/setor
- Estatísticas gerais
- Export para Excel

#### B) Relatório Detalhado
- Quebra por funcionário
- Datas individuais
- Horários completos
- Export para Excel

**Filtros Disponíveis:**
- Período (data inicial/final)
- Tipo (diário/mensal)
- Setor/Atração
- Empresa
- Usuário (apenas para gestores)

**Estatísticas:**
- Total de lançamentos
- Valor total geral
- Número de usuários ativos
- Setores distintos

### 7. Geração de Recibos PDF

**Características:**
- Logo da empresa
- Dados do funcionário
- Detalhamento de datas e valores
- Total calculado
- Dados bancários/PIX
- Data de emissão
- Assinatura digital

**Armazenamento:**
- PDFs salvos no Supabase Storage
- URL pública para download
- Associação ao extra no banco

### 8. Dashboard Interativo

**Lançador:**
- Atalhos rápidos para novo extra
- Acesso aos próprios lançamentos
- Menu lateral com navegação

**Gestor/Admin:**
- Estatísticas em cards:
  - Total de lançamentos
  - Valor total geral
  - Número de funcionários
  - Número de empresas
- Caixa de entrada de aprovações
- Atalhos para ações principais

---

## 👥 Perfis de Usuário

### 1. Lançador

**Permissões:**
- Criar novos extras
- Editar próprios extras (pendentes)
- Visualizar próprios extras
- Gerenciar funcionários
- Visualizar empresas autorizadas
- Baixar recibos aprovados
- Gerar relatórios dos próprios lançamentos

**Restrições:**
- Não pode aprovar extras
- Não pode criar usuários
- Só vê empresas autorizadas para ele

**Menu:**
- Dashboard
- Novo Extra
- Meus Extras
- Funcionários
- Recibos
- Relatórios
- Empresas Autorizadas
- Meu Cadastro

### 2. Gestor

**Permissões:**
- Aprovar/rejeitar extras
- Gerenciar empresas
- Gerenciar funcionários
- Criar/editar usuários (exceto admins)
- Visualizar todos os extras
- Gerar relatórios completos
- Baixar recibos

**Restrições:**
- Não pode deletar admins
- Não pode editar admins

**Menu:**
- Dashboard (com estatísticas)
- Aprovações
- Funcionários
- Empresas
- Relatórios
- Usuários
- Meu Cadastro

### 3. Admin

**Permissões:**
- Acesso total ao sistema
- Gerenciar todos os usuários
- Deletar recibos
- Todas as permissões do gestor

**Menu:**
- Dashboard completo
- Aprovações
- Funcionários
- Empresas
- Relatórios
- Usuários (completo)
- Meu Cadastro

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 20+
- Conta Supabase
- Git

### Passo 1: Clone do Repositório

```bash
git clone <url-do-repositorio>
cd sistema-extras
```

### Passo 2: Instalação de Dependências

```bash
npm install
```

### Passo 3: Configuração do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima
4. Configure em `src/lib/customSupabaseClient.js`:

```javascript
const supabaseUrl = 'SUA_URL_AQUI';
const supabaseAnonKey = 'SUA_CHAVE_AQUI';
```

### Passo 4: Configuração do Banco de Dados

Execute os seguintes SQL no editor do Supabase:

```sql
-- Tabela de empresas
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de funcionários
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  banco TEXT,
  chavePix TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de extras
CREATE TABLE extras (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  company_id BIGINT REFERENCES companies(id),
  user_id UUID REFERENCES auth.users(id),
  data_evento DATE NOT NULL,
  hora_entrada TIME NOT NULL,
  hora_saida TIME NOT NULL,
  setor TEXT,
  vaga TEXT,
  valor DECIMAL(10,2),
  status TEXT DEFAULT 'pendente',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View para empresas com contagem
CREATE VIEW companies_view AS
SELECT * FROM companies;

-- RPC para caixa de entrada
CREATE OR REPLACE FUNCTION get_my_inbox()
RETURNS TABLE (
  id BIGINT,
  employee_name TEXT,
  company_name TEXT,
  total DECIMAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    em.name as employee_name,
    c.name as company_name,
    e.valor as total,
    e.created_at
  FROM extras e
  JOIN employees em ON e.employee_id = em.id
  JOIN companies c ON e.company_id = c.id
  WHERE e.status = 'pendente'
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

### Passo 5: Configuração de Edge Functions

Crie as seguintes Edge Functions no Supabase:

**list-users:**
```javascript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) throw error

  return new Response(JSON.stringify(users), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**delete-user:**
```javascript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId } = await req.json()
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) throw error

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Passo 6: Criar Usuário Admin Inicial

Abra no navegador: `http://localhost:5000/add-admin-localstorage.html`

Ou crie manualmente via SQL:

```sql
-- Via Supabase Dashboard > Authentication > Users
-- Email: admin@exemplo.com
-- Senha: SuaSenhaSegura

-- Depois, atualize os metadados:
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'name', 'Administrador',
  'role', 'admin',
  'setor', 'Administração'
)
WHERE email = 'admin@exemplo.com';
```

### Passo 7: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5000`

### Passo 8: Build para Produção

```bash
npm run build
```

Os arquivos estarão em `dist/`

---

## 📘 Guia de Uso

### Para Lançadores

#### 1. Fazer Login
1. Acesse a URL do sistema
2. Digite email e senha
3. Clique em "Entrar"

#### 2. Cadastrar Funcionário
1. Clique em "Funcionários" no menu
2. Clique em "Novo Funcionário"
3. Preencha os dados
4. Clique em "Salvar"

#### 3. Lançar Extra
1. Clique em "Novo Extra"
2. Selecione o funcionário
3. Selecione a empresa (apenas autorizadas)
4. Preencha data, horários, setor, vaga e valor
5. Clique em "Salvar Extra"

#### 4. Visualizar Meus Extras
1. Clique em "Meus Extras"
2. Veja a lista completa
3. Edite ou exclua se necessário (apenas pendentes)

#### 5. Baixar Recibo
1. Acesse "Recibos"
2. Localize o extra aprovado
3. Clique em "Baixar Recibo (PDF)"

### Para Gestores

#### 1. Aprovar Extras
1. Acesse "Aprovações"
2. Clique em "Detalhar" no extra
3. Revise os dados
4. Escolha: Ciente, Aprovar ou Rejeitar
5. Para aprovar em lote, marque múltiplos itens

#### 2. Gerenciar Empresas
1. Clique em "Empresas"
2. Para adicionar: "Nova Empresa"
3. Para editar: clique no ícone de lápis
4. Para ativar/desativar: edite e mude o status

#### 3. Criar Usuário
1. Acesse "Usuários"
2. Clique em "Novo Usuário"
3. Preencha email, nome, senha e perfil
4. Para lançadores, selecione empresas autorizadas
5. Clique em "Cadastrar"

#### 4. Gerar Relatórios
1. Acesse "Relatórios"
2. Aplique filtros (período, setor, empresa)
3. Visualize estatísticas
4. Exporte para Excel:
   - Relatório Resumo
   - Relatório Detalhado

---

## 🔌 API e Integrações

### Supabase Client

**Configuração:**
```javascript
import { supabase } from '@/lib/customSupabaseClient';
```

**Operações CRUD:**

```javascript
// SELECT
const { data, error } = await supabase
  .from('employees')
  .select('*')
  .eq('ativo', true);

// INSERT
const { data, error } = await supabase
  .from('employees')
  .insert({ name: 'João', cpf: '12345678900' });

// UPDATE
const { data, error } = await supabase
  .from('employees')
  .update({ ativo: false })
  .eq('id', 123);

// DELETE
const { data, error } = await supabase
  .from('employees')
  .delete()
  .eq('id', 123);
```

### Edge Functions

**Listar Usuários:**
```javascript
const { data, error } = await supabase.functions.invoke('list-users');
```

**Deletar Usuário:**
```javascript
const { data, error } = await supabase.functions.invoke('delete-user', {
  body: { userId: 'uuid-do-usuario' }
});
```

### Storage (PDFs)

**Upload:**
```javascript
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(`recibo-${extraId}.pdf`, pdfBlob);
```

**Get Public URL:**
```javascript
const { data } = supabase.storage
  .from('receipts')
  .getPublicUrl(`recibo-${extraId}.pdf`);
```

---

## 🔒 Segurança

### Autenticação

- **JWT Tokens**: Tokens seguros do Supabase
- **Sessões**: Persistentes com refresh automático
- **Logout**: Invalidação completa da sessão

### Autorização

**Row Level Security (RLS):**

```sql
-- Exemplo: Usuários só veem próprios extras
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own extras"
  ON extras FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Gestores can view all extras"
  ON extras FOR SELECT
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('gestor', 'admin')
  );
```

**Proteção de Rotas:**

```javascript
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  const userRole = user.user_metadata?.role;
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}
```

### Validações

- **Frontend**: Validação de formulários
- **Backend**: Constraints no PostgreSQL
- **Sanitização**: Inputs escapados automaticamente

### Boas Práticas

1. Senhas com mínimo de 6 caracteres
2. Recuperação via email verificado
3. Tokens com expiração
4. HTTPS em produção
5. CORS configurado
6. Rate limiting (Supabase)

---

## 🔧 Manutenção

### Logs e Monitoramento

**Console Logs:**
```javascript
console.log('Operação realizada:', data);
console.error('Erro:', error);
```

**Supabase Logs:**
- Acesse Supabase Dashboard
- Vá em "Logs"
- Visualize erros e queries

### Backup

**Banco de Dados:**
1. Supabase Dashboard > Database > Backups
2. Backups automáticos diários
3. Restore point-in-time disponível

**Arquivos (PDFs):**
1. Storage > Buckets > receipts
2. Export manual se necessário

### Atualizações

**Dependências:**
```bash
# Verificar atualizações
npm outdated

# Atualizar
npm update

# Atualizar major versions
npm install <pacote>@latest
```

**Versionamento:**
```bash
# Criar tag de versão
git tag v1.0.0
git push origin v1.0.0
```

### Troubleshooting

**Erro de Login:**
- Verifique credenciais do Supabase
- Confirme email verificado
- Teste conexão com banco

**PDF não gera:**
- Verifique bucket 'receipts' existe
- Confirme políticas de acesso no Storage
- Teste upload manual

**Relatórios vazios:**
- Confirme dados existem no banco
- Verifique filtros aplicados
- Teste query diretamente no SQL Editor

---

## 📊 Modelo de Dados

### Tabelas Principais

```
┌─────────────────┐
│    companies    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ cnpj            │
│ ativa           │
│ created_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     extras      │
├─────────────────┤
│ id (PK)         │
│ employee_id (FK)│
│ company_id (FK) │
│ user_id (FK)    │
│ data_evento     │
│ hora_entrada    │
│ hora_saida      │
│ setor           │
│ vaga            │
│ valor           │
│ status          │
│ pdf_url         │
│ created_at      │
└─────────────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│   employees     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ cpf             │
│ telefone        │
│ banco           │
│ chavePix        │
│ ativo           │
│ created_at      │
└─────────────────┘
```

---

## 🎨 Customização

### Cores e Tema

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      // Adicione suas cores
    }
  }
}
```

### Logo

Substitua o logo em `src/helpers/pdf.js`:

```javascript
const logoDataURL = 'data:image/png;base64,SUA_LOGO_AQUI';
```

### Textos

Todos os textos estão em português nos componentes.
Para tradução, considere usar `react-i18next`.

---

## 📞 Suporte

Para suporte técnico:
- Email: suporte@exemplo.com
- Documentação: Este arquivo
- Issues: GitHub Issues (se aplicável)

---

## 📄 Licença

[Defina sua licença aqui]

---

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] Notificações push
- [ ] App mobile (React Native)
- [ ] Integração com WhatsApp
- [ ] Dashboard avançado com gráficos
- [ ] Histórico de alterações (audit log)
- [ ] Multi-idiomas
- [ ] Temas claro/escuro

---

**Versão da Documentação:** 1.0.0  
**Última Atualização:** Junho 2025  
**Desenvolvido com ❤️ usando React + Supabase**
