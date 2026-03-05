import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Variáveis do Supabase não encontradas no ambiente de Build/Produção.');
    } else {
        console.warn('⚠️ Variáveis do Supabase não encontradas! Verifique seu arquivo .env.local');
    }
}

// Inicializa o cliente apenas se a URL for válida. 
// Durante o build (pre-render), se a URL estiver vazia, evitamos o erro fatal.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any); // O as any é usado para não quebrar os tipos onde é importado.

