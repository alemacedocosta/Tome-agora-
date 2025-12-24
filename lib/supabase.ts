
import { createClient } from '@supabase/supabase-js';

/**
 * Busca variáveis de ambiente de forma robusta.
 * Tenta o objeto global process.env e verifica prefixos comuns usados por diferentes ferramentas de build.
 */
const getEnv = (key: string): string => {
  try {
    // Tenta acessar via process.env (Node/Vercel/Vite/Browser-Shims)
    const env = (window as any).process?.env || {};
    return (
      env[key] || 
      env[`VITE_${key}`] || 
      env[`NEXT_PUBLIC_${key}`] || 
      ''
    ).trim();
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Verifica se as chaves básicas existem (tamanho mínimo para serem válidas)
export const isSupabaseConfigured = supabaseUrl.length > 10 && supabaseAnonKey.length > 10;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn('Supabase não configurado. Verifique as variáveis SUPABASE_URL e SUPABASE_ANON_KEY.');
}
