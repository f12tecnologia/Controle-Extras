
# 🎯 Sistema de Cadastro de Extras

Sistema completo para gerenciamento de extras (horas adicionais/serviços extras) com controle de acesso, aprovações e relatórios.

## ✨ Principais Recursos

- 🔐 Autenticação segura com Supabase
- 👥 Controle de acesso baseado em perfis (Lançador, Gestor, Admin)
- 📝 Gestão de funcionários e empresas
- ✅ Workflow de aprovação de extras
- 📄 Geração automática de recibos em PDF
- 📊 Relatórios customizáveis em Excel
- 📱 Interface responsiva e moderna

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sistema-extras

# Instale as dependências
npm install

# Configure o Supabase em src/lib/customSupabaseClient.js

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:5000`

## 📖 Documentação Completa

Para documentação detalhada, veja [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🛠️ Tecnologias

- React 18.2
- Vite 4.4
- Supabase (Auth + Database + Storage)
- Tailwind CSS
- Radix UI
- Framer Motion

## 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| **Lançador** | Criar extras, gerenciar funcionários |
| **Gestor** | Aprovar extras, gerenciar empresas e usuários |
| **Admin** | Acesso total ao sistema |

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos estarão em `dist/`

## 📄 Licença

[Defina sua licença]

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue primeiro para discutir mudanças.

---

**Desenvolvido com ❤️ usando React + Supabase**
