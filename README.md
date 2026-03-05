# Sistame Escala 4.0 🚀

Sistema premium de gestão de escalas e horários para equipes, com integração total ao Supabase.

## ✨ Funcionalidades

- **Escalas Dinâmicas**: Visualização e edição de escalas mensais.
- **Validação Inteligente**: Verificação automática de conflitos e cobertura mínima.
- **Gestão de Equipe**: Cadastro de funcionários, turnos e status (ativo/férias).
- **Feriados**: Importação automática de feriados nacionais e gestão de feriados locais.
- **Dashboard**: KPI's de cobertura e horas por turno em tempo real.

## 🛠️ Tecnologias

- **Frontend**: Next.js 15+ (App Router), Tailwind CSS.
- **Backend**: Supabase (Database & Auth).
- **Scripts**: Node.js para seeding e automação de schema.

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js instalado.
- Projeto no Supabase criado.

### Passo a Passo

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Configurar Ambiente**:
   - Renomeie o arquivo `.env.example` para `.env.local`.
   - Preencha as chaves do Supabase (URL, Anon Key, Service Role e DATABASE_URL).

3. **Preparar o Banco de Dados**:
   - Execute o script SQL contido em `supabase_schema.sql` no SQL Editor do Supabase OU use o script Node:
     ```bash
     node run_sql.js
     ```

4. **Popular Dados Iniciais (Opcional)**:
   ```bash
   node seed_supabase.js
   ```

5. **Iniciar o Desenvolvimento**:
   ```bash
   npm run dev
   ```

O sistema estará disponível em `http://localhost:3000`.

---
Desenvolvido por COp Rede.
