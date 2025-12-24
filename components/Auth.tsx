
import React, { useState } from 'react';
import { Pill, Mail, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Simula o envio do e-mail
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleResend = () => {
    setIsResending(true);
    setShowResendSuccess(false);
    // Simula novo envio
    setTimeout(() => {
      setIsResending(false);
      setShowResendSuccess(true);
      setTimeout(() => setShowResendSuccess(false), 3000);
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    setIsLoading(true);
    // Simula verificação
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess(email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[16px] shadow-2xl shadow-sky-200/50 p-8 sm:p-12 overflow-hidden relative">
        {/* Elementos Decorativos */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-sky-600 rounded-[16px] flex items-center justify-center text-white mb-4 shadow-xl shadow-sky-200 animate-in zoom-in duration-500">
              <Pill size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tome agora!</h1>
            <p className="text-slate-400 font-medium">Sua saúde no horário certo</p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    placeholder="exemplo@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[16px] outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-[16px] font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
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
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <p className="text-slate-600 mb-1">Enviamos um código de acesso para</p>
                <p className="text-sky-600 font-bold">{email}</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">Código de Verificação</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[16px] outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-center text-2xl tracking-[0.5em] font-black"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                
                {/* Feedback de reenvio */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  {showResendSuccess ? (
                    <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={16} />
                      Código reenviado com sucesso!
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-sky-600 text-sm font-bold hover:text-sky-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isResending ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      Não recebi o e-mail? Reenviar
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-sky-50 rounded-[16px] border border-sky-100">
                <p className="text-[11px] text-sky-700 font-medium leading-relaxed">
                  <strong>Nota da Demo:</strong> Como esta é uma versão de visualização, o e-mail não é enviado de fato. <br/>
                  <span className="font-bold">Dica: Digite qualquer código de 6 dígitos para entrar.</span>
                </p>
              </div>

              <button
                disabled={isLoading || otp.length < 6}
                type="submit"
                className="w-full py-4 bg-sky-600 text-white rounded-[16px] font-bold text-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-100"
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

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Segurança Total</p>
            <p className="text-[10px] text-slate-300 text-center leading-relaxed">
              Utilizamos autenticação de dois fatores por e-mail para sua proteção.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
