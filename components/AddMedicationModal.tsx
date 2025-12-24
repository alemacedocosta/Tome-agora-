
import React, { useState } from 'react';
import { MedicationCategory } from '../types';
import { X } from 'lucide-react';

interface AddMedicationModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    dosage_time: string;
    periodicity_hours: number;
    category: MedicationCategory;
    notes: string;
  }) => void;
}

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage_time: '08:00',
    periodicity_hours: 8,
    category: 'temporário' as MedicationCategory,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Novo Remédio</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Medicamento</label>
            <input
              required
              type="text"
              placeholder="Ex: Amoxicilina"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primeira Dose</label>
              <input
                required
                type="time"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none"
                value={formData.dosage_time}
                onChange={e => setFormData({ ...formData, dosage_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Periodicidade (h)</label>
              <input
                required
                type="number"
                min="1"
                max="168"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none"
                value={formData.periodicity_hours}
                onChange={e => setFormData({ ...formData, periodicity_hours: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoria</label>
            <div className="flex gap-3">
              {(['temporário', 'para sempre'] as MedicationCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`flex-1 py-3 px-4 rounded-2xl border font-medium transition-all ${
                    formData.category === cat
                      ? 'bg-sky-50 border-sky-200 text-sky-700 ring-2 ring-sky-500 ring-offset-1'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Anotações Livres</label>
            <textarea
              placeholder="Ex: Tomar após as refeições"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none h-24 resize-none"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold text-lg hover:bg-sky-700 shadow-xl shadow-sky-200 active:scale-[0.98] transition-all"
          >
            Adicionar à Lista
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;
