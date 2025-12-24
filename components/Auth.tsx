
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Pill, Mail, Lock, ArrowRight, Loader2, KeyRound, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Auth: React.FC = () => {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!isSupabaseConfigured) {
        // Modo Preview: Simula login instantâneo
        const mockUser = { id: 'preview-user', email };
        localStorage.setItem('tome_agora_user', JSON.stringify(mockUser));
        window.location.reload();
        return;
      }

      if (view === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Verifique seu e-mail para confirmar o cadastro!' });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'E-mail de recuperação enviado!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-2xl shadow-sky-200/50 p-8 sm:p-12">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-sky-600 rounded-[20px] flex items-center justify-center text-white mb-4 shadow-xl shadow-sky-200">
            <Pill size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Tome agora!</h1>
          <p className="text-slate-400 font-medium">Sua saúde, no horário certo.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start text-blue-800 text-xs">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p><strong>Modo de Teste Ativado:</strong> Insira qualquer e-mail/senha para entrar e testar as funcionalidades agora.</p>
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-[16px] flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="shrink-0" size={18} /> : <AlertCircle className="shrink-0" size={18} />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
              <input
                required
                type="email"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[16px] outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {view !== 'forgot' && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[16px] outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-sky-600 text-white rounded-[16px] font-bold text-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 shadow-xl shadow-sky-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {view === 'signin' ? 'Entrar' : view === 'signup' ? 'Cadastrar' : 'Recuperar Senha'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center">
          {view === 'signin' ? (
            <>
              <button onClick={() => setView('forgot')} className="text-sky-600 text-sm font-bold hover:underline decoration-2 underline-offset-4">Esqueceu a senha?</button>
              <button onClick={() => setView('signup')} className="text-slate-400 text-sm font-medium">Não tem conta? <span className="text-slate-700 font-bold hover:text-sky-600 transition-colors">Crie agora</span></button>
            </>
          ) : (
            <button onClick={() => setView('signin')} className="text-sky-600 text-sm font-bold hover:underline decoration-2 underline-offset-4 flex items-center justify-center gap-2">
              <KeyRound size={16} /> Voltar para o Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
