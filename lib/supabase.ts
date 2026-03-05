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
// Durante o build ou se as chaves faltarem no Railway, evitamos o erro fatal "reading 'from' of null".
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({
                order: () => Promise.resolve({ data: [], error: { message: 'Chaves do Supabase ausentes' } }),
                gte: () => ({ lte: () => Promise.resolve({ data: [], error: { message: 'Chaves do Supabase ausentes' } }) }),
                upsert: () => Promise.resolve({ error: { message: 'Chaves do Supabase ausentes' } }),
                insert: () => Promise.resolve({ error: { message: 'Chaves do Supabase ausentes' } }),
                delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Chaves do Supabase ausentes' } }) }),
            }),
            delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Chaves do Supabase ausentes' } }) }),
            upsert: () => Promise.resolve({ error: { message: 'Chaves do Supabase ausentes' } }),
            insert: () => Promise.resolve({ error: { message: 'Chaves do Supabase ausentes' } }),
        }),
        auth: { getSession: () => Promise.resolve({ data: { session: null } }) }
    } as any;
