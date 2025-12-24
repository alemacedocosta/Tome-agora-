
import React, { useState, useEffect } from 'react';
import { Medication, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { isCurrentDoseTaken } from '../utils/calculations';
import MedicationCard from './MedicationCard';
import MedicationModal from './MedicationModal';
// Added Loader2 to the imports to resolve the missing reference error
import { Pill, Plus, LogOut, Search, Clock, CheckCircle2, Bell, BellOff, Database, Loader2 } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notifications';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');

  const fetchMeds = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setMedications(data);
    } else {
      const local = localStorage.getItem(`meds_${user.id}`);
      if (local) setMedications(JSON.parse(local));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeds();
  }, [user]);

  const saveToLocal = (newMeds: Medication[]) => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(`meds_${user.id}`, JSON.stringify(newMeds));
    }
  };

  const handleTake = async (id: string) => {
    const timestamp = new Date().toISOString();
    const updated = medications.map(m => m.id === id ? { ...m, last_taken_at: timestamp } : m);
    setMedications(updated);
    saveToLocal(updated);

    if (isSupabaseConfigured) {
      await supabase.from('medications').update({ last_taken_at: timestamp }).eq('id', id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este medicamento?')) return;
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    saveToLocal(updated);

    if (isSupabaseConfigured) {
      await supabase.from('medications').delete().eq('id', id);
    }
  };

  const handleSave = async (data: any) => {
    if (isSupabaseConfigured) {
      if (editingMed) {
        await supabase.from('medications').update(data).eq('id', editingMed.id);
      } else {
        await supabase.from('medications').insert({ ...data, user_id: user.id });
      }
    } else {
      if (editingMed) {
        const updated = medications.map(m => m.id === editingMed.id ? { ...m, ...data } : m);
        setMedications(updated);
        saveToLocal(updated);
      } else {
        const newMed: Medication = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          user_id: user.id,
          created_at: new Date().toISOString(),
          last_taken_at: null,
          last_notified_at: null
        };
        const updated = [newMed, ...medications];
        setMedications(updated);
        saveToLocal(updated);
      }
    }
    setIsModalOpen(false);
    setEditingMed(undefined);
    fetchMeds();
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('tome_agora_user');
      window.location.reload();
    }
  };

  const handleToggleNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifPerm(granted ? 'granted' : 'denied');
  };

  const filteredMeds = medications.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const pending = filteredMeds.filter(m => !isCurrentDoseTaken(m));
  const taken = filteredMeds.filter(m => isCurrentDoseTaken(m));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-sky-100">
              <Pill size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Tome agora!</h1>
              {!isSupabaseConfigured && <span className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter">Preview Offline</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleNotif} className={`p-2.5 rounded-[12px] transition-all ${notifPerm === 'granted' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
              {notifPerm === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-slate-100 text-slate-600 rounded-[12px] hover:bg-red-50 hover:text-red-500 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Olá,</h2>
            <p className="text-slate-500 font-bold">
              {loading ? 'Carregando...' : `Gerenciando ${medications.length} remédios hoje.`}
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" placeholder="Filtrar por nome..." 
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[16px] outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Clock className="text-amber-500" size={24} />
            <h3 className="text-2xl font-black text-slate-800">Próximas Doses</h3>
            <span className="bg-amber-100 text-amber-600 px-3 py-0.5 rounded-full text-xs font-black">{pending.length}</span>
          </div>
          {loading ? (
             <div className="flex justify-center py-12">
               {/* Added comment above fix: Using Loader2 component after importing it */}
               <Loader2 className="animate-spin text-slate-200" size={40} />
             </div>
          ) : pending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {pending.map(m => (
                <MedicationCard key={m.id} medication={m} onTake={handleTake} onDelete={handleDelete} onEdit={(med) => {setEditingMed(med); setIsModalOpen(true);}} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-12 text-center border-2 border-dashed border-slate-100">
              <CheckCircle2 className="mx-auto text-green-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">Nenhuma dose pendente para agora!</p>
            </div>
          )}
        </section>

        {taken.length > 0 && (
          <section className="opacity-70 grayscale-[0.3]">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <CheckCircle2 className="text-green-500" size={24} />
              <h3 className="text-2xl font-black text-slate-800">Já Tomados hoje</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taken.map(m => (
                <MedicationCard key={m.id} medication={m} onTake={handleTake} onDelete={handleDelete} onEdit={(med) => {setEditingMed(med); setIsModalOpen(true);}} />
              ))}
            </div>
          </section>
        )}
      </main>

      <button 
        onClick={() => {setEditingMed(undefined); setIsModalOpen(true);}}
        className="fixed bottom-10 right-10 w-16 h-16 bg-sky-600 text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-sky-300 hover:scale-110 active:scale-95 transition-all z-30"
      >
        <Plus size={32} />
      </button>

      {isModalOpen && <MedicationModal onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingMed} />}
    </div>
  );
};

export default Dashboard;
