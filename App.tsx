
import React, { useState, useEffect } from 'react';
import { Pill, Plus, LogOut, Bell, Search, BellOff, CheckCircle2, Clock } from 'lucide-react';
import { Medication, UserProfile } from './types';
import MedicationCard from './components/MedicationCard';
import MedicationModal from './components/MedicationModal';
import Auth from './components/Auth';
import { calculateNextDose, isCurrentDoseTaken } from './utils/calculations';
import { requestNotificationPermission, sendNotification } from './utils/notifications';
import { supabase, isSupabaseConfigured } from './utils/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    const initSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email! });
          }
        } else {
          const demoUser = localStorage.getItem('tome_agora_demo_user');
          if (demoUser) setUser(JSON.parse(demoUser));
        }
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (user) {
      const savedMeds = localStorage.getItem(`tome_agora_meds_${user.id}`);
      if (savedMeds) setMedications(JSON.parse(savedMeds));
      else setMedications([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`tome_agora_meds_${user.id}`, JSON.stringify(medications));
    }
  }, [medications, user]);

  useEffect(() => {
    if (!user || notificationPermission !== 'granted') return;

    const checkNotifications = () => {
      const now = new Date();
      let hasUpdates = false;
      const updatedMeds = medications.map(med => {
        const nextDose = calculateNextDose(med);
        const lastNotified = med.last_notified_at ? new Date(med.last_notified_at) : null;

        if (now >= nextDose && (!lastNotified || lastNotified < nextDose)) {
          sendNotification(
            `Hora do remédio: ${med.name}`,
            `Está na hora de tomar seu medicamento (${med.dosage_time}).`
          );
          hasUpdates = true;
          return { ...med, last_notified_at: now.toISOString() };
        }
        return med;
      });

      if (hasUpdates) setMedications(updatedMeds);
    };

    const interval = setInterval(checkNotifications, 60000); 
    return () => clearInterval(interval);
  }, [medications, user, notificationPermission]);

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    else localStorage.removeItem('tome_agora_demo_user');
    setUser(null);
  };

  const handleSaveMedication = (data: any) => {
    if (!user) return;
    if (editingMed) {
      setMedications(prev => prev.map(m => m.id === editingMed.id ? { ...m, ...data } : m));
    } else {
      const newMed: Medication = {
        ...data,
        id: crypto.randomUUID(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        last_taken_at: null,
        last_notified_at: null,
      };
      setMedications(prev => [...prev, newMed]);
    }
    setIsModalOpen(false);
    setEditingMed(undefined);
  };

  const handleTakeMedication = (id: string) => {
    setMedications(prev => prev.map(m => 
      m.id === id ? { ...m, last_taken_at: new Date().toISOString() } : m
    ));
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm('Deseja realmente excluir este medicamento?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Pill className="text-sky-500 animate-bounce" size={48} />
          <p className="text-slate-400 font-medium">Carregando sua rotina...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={(email) => {
      if (!isSupabaseConfigured) {
        const demoUser = { id: 'demo-user', email };
        setUser(demoUser);
        localStorage.setItem('tome_agora_demo_user', JSON.stringify(demoUser));
      }
    }} />;
  }

  const filteredMeds = medications.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const pendingMeds = filteredMeds.filter(m => !isCurrentDoseTaken(m));
  const takenMeds = filteredMeds.filter(m => isCurrentDoseTaken(m));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-600 rounded-[16px] flex items-center justify-center text-white shadow-lg shadow-sky-200">
              <Pill size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tome agora!</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleNotifications}
              className={`p-2.5 rounded-[16px] transition-all ${
                notificationPermission === 'granted' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {notificationPermission === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[16px] transition-colors" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-none">Minha Rotina</h2>
            <p className="text-slate-500 font-medium">Saúde em dia para <span className="text-sky-600 font-bold">{user.email}</span></p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar remédio..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[16px] outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-[16px]">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold">Para Tomar Agora</h3>
              <span className="ml-2 px-2.5 py-0.5 bg-slate-200 text-slate-600 text-xs font-black rounded-full">{pendingMeds.length}</span>
            </div>
          </div>

          {pendingMeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {pendingMeds.map(med => (
                <MedicationCard key={med.id} medication={med} onTake={handleTakeMedication} onDelete={handleDeleteMedication} onEdit={(m) => {setEditingMed(m); setIsModalOpen(true);}} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[16px] border-2 border-dashed border-slate-100">
              <CheckCircle2 size={40} className="text-green-200 mb-3" />
              <p className="text-slate-400 font-bold">Tudo em dia por aqui!</p>
            </div>
          )}
        </section>

        {takenMeds.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="p-2 bg-green-100 text-green-600 rounded-[16px]">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-xl font-bold">Já Tomados</h3>
                <span className="ml-2 px-2.5 py-0.5 bg-slate-100 text-slate-400 text-xs font-black rounded-full">{takenMeds.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {takenMeds.map(med => (
                <MedicationCard key={med.id} medication={med} onTake={handleTakeMedication} onDelete={handleDeleteMedication} onEdit={(m) => {setEditingMed(m); setIsModalOpen(true);}} />
              ))}
            </div>
          </section>
        )}
      </main>

      <button onClick={() => { setEditingMed(undefined); setIsModalOpen(true); }} className="fixed bottom-8 right-8 w-16 h-16 bg-sky-600 text-white rounded-[16px] flex items-center justify-center shadow-2xl shadow-sky-400 hover:scale-110 active:scale-95 transition-all z-30">
        <Plus size={32} />
      </button>

      {isModalOpen && <MedicationModal onClose={() => { setIsModalOpen(false); setEditingMed(undefined); }} onSave={handleSaveMedication} initialData={editingMed} />}
    </div>
  );
};

export default App;
