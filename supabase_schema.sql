-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação da tabela de Funcionários
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT,
    shift TEXT NOT NULL CHECK (shift IN ('T1', 'T2', 'T3', 'T4')),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'ferias', 'inativo')),
    sex TEXT NOT NULL CHECK (sex IN ('M', 'F')),
    admission_date DATE,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criação da tabela de Edições Manuais da Escala
CREATE TABLE IF NOT EXISTS public.scale_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_value TEXT NOT NULL CHECK (shift_value IN ('T1', 'T2', 'T3', 'T4', 'DSR', 'COM', 'FE', 'FF')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date) -- Evita duplicidade pro mesmo colaborador no mesmo dia
);

-- Criação da tabela de Feriados
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adição da coluna 'tipo' caso não exista
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='holidays' AND column_name='tipo') THEN
        ALTER TABLE public.holidays ADD COLUMN tipo TEXT CHECK (tipo IN ('Nacional', 'Estadual', 'Municipal', 'Ponto Facultativo'));
    END IF;
END $$;

-- Criação da tabela de Configurações Globais
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dsr_feminino_enabled BOOLEAN DEFAULT TRUE,
    dsr_com_alternado_enabled BOOLEAN DEFAULT TRUE,
    limite_interjornada INTEGER DEFAULT 11,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir uma linha padrão nas configurações
INSERT INTO public.settings (dsr_feminino_enabled, dsr_com_alternado_enabled, limite_interjornada)
VALUES (TRUE, TRUE, 11) ON CONFLICT DO NOTHING;

-- Habilitar a segurança de nivel de linha (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas (Usando DROP/CREATE para garantir atualização)
DO $$ 
BEGIN
    -- Employees
    DROP POLICY IF EXISTS "Allow anonymous read access" ON public.employees;
    CREATE POLICY "Allow anonymous read access" ON public.employees FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.employees;
    CREATE POLICY "Allow anonymous insert access" ON public.employees FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow anonymous update access" ON public.employees;
    CREATE POLICY "Allow anonymous update access" ON public.employees FOR UPDATE USING (true);
    DROP POLICY IF EXISTS "Allow anonymous delete access" ON public.employees;
    CREATE POLICY "Allow anonymous delete access" ON public.employees FOR DELETE USING (true);

    -- Scale Edits
    DROP POLICY IF EXISTS "Allow anonymous read access" ON public.scale_edits;
    CREATE POLICY "Allow anonymous read access" ON public.scale_edits FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.scale_edits;
    CREATE POLICY "Allow anonymous insert access" ON public.scale_edits FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow anonymous update access" ON public.scale_edits;
    CREATE POLICY "Allow anonymous update access" ON public.scale_edits FOR UPDATE USING (true);
    DROP POLICY IF EXISTS "Allow anonymous delete access" ON public.scale_edits;
    CREATE POLICY "Allow anonymous delete access" ON public.scale_edits FOR DELETE USING (true);

    -- Holidays
    DROP POLICY IF EXISTS "Allow anonymous read access" ON public.holidays;
    CREATE POLICY "Allow anonymous read access" ON public.holidays FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.holidays;
    CREATE POLICY "Allow anonymous insert access" ON public.holidays FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow anonymous update access" ON public.holidays;
    CREATE POLICY "Allow anonymous update access" ON public.holidays FOR UPDATE USING (true);
    DROP POLICY IF EXISTS "Allow anonymous delete access" ON public.holidays;
    CREATE POLICY "Allow anonymous delete access" ON public.holidays FOR DELETE USING (true);

    -- Settings
    DROP POLICY IF EXISTS "Allow anonymous read access" ON public.settings;
    CREATE POLICY "Allow anonymous read access" ON public.settings FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow anonymous update access" ON public.settings;
    CREATE POLICY "Allow anonymous update access" ON public.settings FOR UPDATE USING (true);
END $$;
