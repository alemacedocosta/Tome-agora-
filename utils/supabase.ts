
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  // Prioridade 1: import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[key];
    if (val) return val;
  }
  
  // Prioridade 2: process.env (Ambientes Node/SSR/Vercel build)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // Prioridade 3: Fallback sem prefixo VITE_ (comum em setups manuais no Vercel)
  const fallbackKey = key.replace('VITE_', '');
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[fallbackKey];
    if (val) return val;
  }

  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Só consideramos configurado se ambas as chaves tiverem valores válidos (não strings vazias ou placeholders)
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  supabaseUrl.length > 20;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
