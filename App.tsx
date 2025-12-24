
import React, { useState, useEffect } from 'react';
import { Pill, Plus, LogOut, Bell, Search, BellOff, CheckCircle2, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { Medication } from './types';
import MedicationCard from './components/MedicationCard';
import MedicationModal from './components/MedicationModal';
import Auth from './components/Auth';
import { isCurrentDoseTaken } from './utils/calculations';
import { requestNotificationPermission } from './utils/notifications';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Erro ao iniciar auth:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchMeds = async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar medicamentos:', error);
      } else {
        setMedications(data || []);
      }
    };

    fetchMeds();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, () => {
        fetchMeds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // TELA DE ERRO APENAS SE REALMENTE FALTAR ENV VAR
  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Variáveis de Ambiente Ausentes</h2>
          <p className="text-slate-500 text-sm font-medium">
            Certifique-se de que as variáveis <strong>SUPABASE_URL</strong> e <strong>SUPABASE_ANON_KEY</strong> estão configuradas nas "Environment Variables" do seu projeto.
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveMedication = async (formData: any) => {
    if (!user || !supabase) return;
    if (editingMed) {
      await supabase.from('medications').update(formData).eq('id', editingMed.id);
    } else {
      await supabase.from('medications').insert([{ ...formData, user_id: user.id }]);
    }
    setIsModalOpen(false);
    setEditingMed(undefined);
  };

  const handleTakeMedication = async (id: string) => {
    if (!supabase) return;
    await supabase.from('medications').update({ last_taken_at: new Date().toISOString() }).eq('id', id);
  };

  const handleDeleteMedication = async (id: string) => {
    if (!supabase) return;
    if (window.confirm('Excluir este medicamento?')) {
      await supabase.from('medications').delete().eq('id', id);
    }
  };

  const pendingMeds = medications.filter(m => !isCurrentDoseTaken(m) && m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const takenMeds = medications.filter(m => isCurrentDoseTaken(m) && m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Pill className="text-sky-500 animate-bounce" size={48} />
          <span className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Auth onAuthSuccess={() => {}} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
              <Pill size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tome agora!</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => requestNotificationPermission().then(p => setNotificationPermission(p ? 'granted' : 'denied'))} className="p-2.5 rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors">
              {notificationPermission === 'granted' ? <Bell size={20} className="text-sky-600" /> : <BellOff size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-[40px] p-8 text-white shadow-2xl shadow-sky-200 relative overflow-hidden group">
          <Sparkles className="absolute right-[-20px] top-[-20px] text-white/10 w-48 h-48 group-hover:rotate-12 transition-transform duration-1000" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold opacity-80 mb-2">Bem-vindo(a), {user.email?.split('@')[0]}!</h2>
            <p className="text-3xl font-black leading-tight max-w-md italic">
              "Cuidar da sua saúde é o melhor investimento que você faz hoje." 💙
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sua Rotina</h2>
            <p className="text-slate-400 text-sm font-medium">Acompanhe seus horários em tempo real</p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Buscar medicamento..." 
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[20px] outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 shadow-sm transition-all"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200 pb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
            <h3 className="font-black text-xl tracking-tight">Para Tomar Agora</h3>
          </div>
          {pendingMeds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingMeds.map(med => (
                <MedicationCard key={med.id} medication={med} onTake={handleTakeMedication} onDelete={handleDeleteMedication} onEdit={(m) => { setEditingMed(m); setIsModalOpen(true); }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-slate-400">
              <div className="mb-2 text-3xl opacity-20 text-sky-500">✨</div>
              <p className="font-bold">Nenhum remédio pendente!</p>
              <p className="text-sm">Tudo em ordem com sua saúde.</p>
            </div>
          )}
        </section>

        {takenMeds.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-200 pb-4">
              <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-black text-xl tracking-tight">Já Tomados</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale-[0.2]">
              {takenMeds.map(med => (
                <MedicationCard key={med.id} medication={med} onTake={handleTakeMedication} onDelete={handleDeleteMedication} onEdit={(m) => { setEditingMed(m); setIsModalOpen(true); }} />
              ))}
            </div>
          </section>
        )}
      </main>

      <button onClick={() => { setEditingMed(undefined); setIsModalOpen(true); }} className="fixed bottom-8 right-8 w-16 h-16 bg-sky-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-sky-300 hover:scale-110 active:scale-95 transition-all z-30">
        <Plus size={32} />
      </button>

      {isModalOpen && <MedicationModal onClose={() => setIsModalOpen(false)} onSave={handleSaveMedication} initialData={editingMed} />}
    </div>
  );
};

export default App;
