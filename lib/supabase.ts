
import { createClient } from '@supabase/supabase-js';

/**
 * No Vercel e em ambientes modernos de deploy, o process.env.NOME_DA_VARIAVEL 
 * é substituído pelo valor real durante o tempo de build/runtime.
 * 
 * Importante: Use os nomes EXATOS configurados no painel da Vercel.
 */

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

// Exporta uma flag para o App.tsx saber se deve mostrar a tela de erro de config
export const isSupabaseConfigured = supabaseUrl.length > 10 && supabaseAnonKey.length > 10;

// Inicializa o cliente. Se não estiver configurado, o App.tsx tratará visualmente.
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
