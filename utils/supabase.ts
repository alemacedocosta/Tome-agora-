
import { createClient } from '@supabase/supabase-js';

// Tenta obter as variáveis de ambiente de forma segura
const getEnv = (key: string) => {
  try {
    return (import.meta as any).env[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Só cria o cliente se a URL for válida para evitar crash no carregamento
export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any);

export const isSupabaseReady = isSupabaseConfigured;
