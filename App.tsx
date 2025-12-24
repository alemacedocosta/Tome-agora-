
import React, { useState, useEffect } from 'react';
import { Pill, Plus, LogOut, Bell, Search, BellOff, CheckCircle2, Clock, CalendarClock } from 'lucide-react';
import { Medication, UserProfile } from './types';
import MedicationCard from './components/MedicationCard';
import MedicationModal from './components/MedicationModal';
import Auth from './components/Auth';
import { calculateNextDose, isCurrentDoseTaken } from './utils/calculations';
import { requestNotificationPermission, sendNotification } from './utils/notifications';

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

  // Load initial state
  useEffect(() => {
    const savedUser = localStorage.getItem('tome_agora_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedMeds = localStorage.getItem('tome_agora_meds');
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    }
    setIsLoading(false);
  }, []);

  // Save state
  useEffect(() => {
    if (user) {
      localStorage.setItem('tome_agora_meds', JSON.stringify(medications));
    }
  }, [medications, user]);

  // Notification Check Loop
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
            `Está na hora de tomar seu medicamento (${med.dosage_time}). Não esqueça!`
          );
          hasUpdates = true;
          return { ...med, last_notified_at: now.toISOString() };
        }
        return med;
      });

      if (hasUpdates) {
        setMedications(updatedMeds);
      }
    };

    const interval = setInterval(checkNotifications, 60000); 
    return () => clearInterval(interval);
  }, [medications, user, notificationPermission]);

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  const handleLogin = (email: string) => {
    const newUser = { id: crypto.randomUUID(), email };
    setUser(newUser);
    localStorage.setItem('tome_agora_user', JSON.stringify(newUser));
    requestNotificationPermission().then(granted => {
      setNotificationPermission(granted ? 'granted' : 'denied');
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tome_agora_user');
  };

  const handleSaveMedication = (data: any) => {
    if (!user) return;

    if (editingMed) {
      setMedications(prev => prev.map(m => 
        m.id === editingMed.id ? { ...m, ...data } : m
      ));
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

  const handleEditRequest = (med: Medication) => {
    setEditingMed(med);
    setIsModalOpen(true);
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

  const filteredMeds = medications.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingMeds = filteredMeds.filter(m => !isCurrentDoseTaken(m));
  const takenMeds = filteredMeds.filter(m => isCurrentDoseTaken(m));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Pill className="text-sky-500 animate-bounce" size={48} />
          <p className="text-slate-400 font-medium">Carregando sua saúde...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-500">
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
                notificationPermission === 'granted' 
                  ? 'bg-sky-50 text-sky-600' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {notificationPermission === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[16px] transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-none">Minha Rotina</h2>
            <p className="text-slate-500 font-medium">Controle seus medicamentos com precisão.</p>
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

        {/* Seção: Pendentes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-[16px]">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold">Para Tomar Agora</h3>
              <span className="ml-2 px-2.5 py-0.5 bg-slate-200 text-slate-600 text-xs font-black rounded-full">
                {pendingMeds.length}
              </span>
            </div>
          </div>

          {pendingMeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {pendingMeds.map(med => (
                <MedicationCard 
                  key={med.id} 
                  medication={med} 
                  onTake={handleTakeMedication}
                  onDelete={handleDeleteMedication}
                  onEdit={handleEditRequest}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[16px] border-2 border-dashed border-slate-100">
              <CheckCircle2 size={40} className="text-green-200 mb-3" />
              <p className="text-slate-400 font-bold">Tudo em dia por aqui!</p>
              {medications.length === 0 && (
                <button 
                  onClick={() => { setEditingMed(undefined); setIsModalOpen(true); }}
                  className="mt-4 text-sky-600 font-bold hover:underline"
                >
                  Cadastrar meu primeiro remédio
                </button>
              )}
            </div>
          )}
        </section>

        {/* Seção: Concluídos */}
        {takenMeds.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="p-2 bg-green-100 text-green-600 rounded-[16px]">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-xl font-bold">Já Tomados</h3>
                <span className="ml-2 px-2.5 py-0.5 bg-slate-100 text-slate-400 text-xs font-black rounded-full">
                  {takenMeds.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {takenMeds.map(med => (
                <MedicationCard 
                  key={med.id} 
                  medication={med} 
                  onTake={handleTakeMedication}
                  onDelete={handleDeleteMedication}
                  onEdit={handleEditRequest}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State de Busca */}
        {filteredMeds.length === 0 && medications.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[16px] border-2 border-dashed border-slate-200">
            <Search size={40} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Nenhum resultado para "{searchTerm}"</h3>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-sky-600 font-bold"
            >
              Limpar busca
            </button>
          </div>
        )}
      </main>

      <button 
        onClick={() => { setEditingMed(undefined); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-sky-600 text-white rounded-[16px] flex items-center justify-center shadow-2xl shadow-sky-400 hover:scale-110 active:scale-95 transition-all z-30"
      >
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <MedicationModal 
          onClose={() => { setIsModalOpen(false); setEditingMed(undefined); }} 
          onSave={handleSaveMedication}
          initialData={editingMed}
        />
      )}
    </div>
  );
};

export default App;
