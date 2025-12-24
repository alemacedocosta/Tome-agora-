
import React, { useState } from 'react';
import { Pill, Mail, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onAuthSuccess: (email: string) => void;
}

const Auth: React.FC<AuthProps> = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setStep('otp');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    setIsLoading(false);
    if (authError) {
      setError("Código inválido ou expirado.");
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-sky-600 rounded-[24px] flex items-center justify-center text-white mb-4 shadow-xl">
              <Pill size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-800">Tome agora!</h1>
            <p className="text-slate-400 font-medium">Sua saúde no horário certo</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-3xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Receber Código
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-slate-600 mb-1">Enviamos o código para</p>
                <p className="text-sky-600 font-bold">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">Código de Verificação</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-center text-2xl tracking-[0.5em] font-black"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button
                disabled={isLoading || otp.length < 6}
                type="submit"
                className="w-full py-4 bg-sky-600 text-white rounded-3xl font-bold text-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Validar e Entrar'
                )}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="w-full text-slate-400 font-semibold hover:text-slate-600 transition-colors text-sm"
              >
                Alterar e-mail
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
