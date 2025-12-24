
import { createClient } from '@supabase/supabase-js';

// Estas variáveis devem ser configuradas no seu ambiente do Vercel/Projeto
// Se estiverem vazias, o app avisará no console, mas para produção você deve preenchê-las
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
