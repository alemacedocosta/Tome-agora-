
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './utils/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';
import { Loader2, Info } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Modo Real: Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    } else {
      // Modo Preview: LocalStorage
      const savedUser = localStorage.getItem('tome_agora_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setDemoMode(true);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-600 mb-4" size={48} />
        <p className="text-slate-400 font-bold animate-pulse">Iniciando Tome agora!...</p>
      </div>
    );
  }

  return (
    <>
      {demoMode && !user && (
        <div className="fixed top-0 left-0 w-full bg-amber-500 text-white text-[10px] font-bold py-1 px-4 z-[100] text-center flex items-center justify-center gap-2">
          <Info size={12} /> MODO PREVIEW ATIVO: Os dados serão salvos localmente até você configurar o Supabase no Vercel.
        </div>
      )}
      {user ? <Dashboard user={user} /> : <Auth />}
    </>
  );
};

export default App;
