import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Variáveis do Supabase não encontradas! O sistema pode não funcionar corretamente se as chamadas de API forem feitas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
