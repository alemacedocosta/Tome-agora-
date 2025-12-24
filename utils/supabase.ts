
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para buscar variáveis em diferentes contextos de ambiente
const getEnv = (key: string): string => {
  // 1. Tenta no import.meta.env (Padrão Vite)
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key]) return metaEnv[key];
  
  // 2. Tenta no process.env (Padrão Vercel/Node/CI)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // 3. Tenta variações comuns sem o prefixo VITE_ (muitas vezes configuradas assim no Vercel)
  const fallbackKey = key.replace('VITE_', '');
  if (metaEnv && metaEnv[fallbackKey]) return metaEnv[fallbackKey];
  if (typeof process !== 'undefined' && process.env && process.env[fallbackKey]) {
    return process.env[fallbackKey] as string;
  }

  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
