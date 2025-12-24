
import React, { useState, useEffect } from 'react';
import { Medication } from '../types';
import { 
  calculateNextDose, 
  getCountdownPercentage, 
  formatRemainingTime, 
  isCurrentDoseTaken 
} from '../utils/calculations';
import CountdownChart from './CountdownChart';
import { Clock, Tag, StickyNote, CheckCircle2, Trash2, Edit3, AlertCircle } from 'lucide-react';

interface MedicationCardProps {
  medication: Medication;
  onTake: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (medication: Medication) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onTake, onDelete, onEdit }) => {
  const [percentage, setPercentage] = useState(getCountdownPercentage(medication));
  const [timeLeft, setTimeLeft] = useState('');
  const [isTaken, setIsTaken] = useState(isCurrentDoseTaken(medication));

  useEffect(() => {
    const update = () => {
      const p = getCountdownPercentage(medication);
      const next = calculateNextDose(medication);
      const diff = next.getTime() - Date.now();
      
      setPercentage(p);
      setTimeLeft(formatRemainingTime(diff));
      setIsTaken(isCurrentDoseTaken(medication));
    };

    update();
    const interval = setInterval(update, 5000); 
    return () => clearInterval(interval);
  }, [medication]);

  const isLate = percentage <= 0 && !isTaken;

  return (
    <div className={`bg-white rounded-[32px] p-6 shadow-sm border transition-all duration-500 flex flex-col h-full ${
      isTaken ? 'bg-slate-50/40 border-green-100 opacity-90' : 
      isLate ? 'border-red-100 bg-red-50/30' : 'border-slate-100 hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 mb-2">
            <span className={`self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
              medication.category === 'para sempre' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {medication.category}
            </span>
            <h3 className="text-xl font-black text-slate-800 truncate leading-tight" title={medication.name}>
              {medication.name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-300" /> {medication.dosage_time}
            </span>
            <span className="flex items-center gap-1">
              <Tag size={12} className="text-slate-300" /> cada {medication.periodicity_hours}h
            </span>
          </div>
        </div>
        
        {/* Agora o gráfico sempre mostra a contagem para a PRÓXIMA vez */}
        <div className={isTaken ? 'opacity-60' : ''}>
          <CountdownChart 
            percentage={percentage} 
            label={timeLeft} 
          />
        </div>
      </div>

      <div className="flex-1">
        {isLate && (
          <div className="mb-3 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <AlertCircle size={14} /> Horário estipulado passou!
          </div>
        )}
        {isTaken && (
          <div className="mb-3 flex items-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={14} /> Próxima dose em:
          </div>
        )}
        {medication.notes && (
          <div className="mb-4 p-3 bg-white/50 rounded-2xl flex gap-2 items-start border border-slate-100/50">
            <StickyNote size={14} className="text-slate-300 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 italic leading-snug line-clamp-3">{medication.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100/50">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(medication)}
            className="p-2 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
            title="Editar"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => onDelete(medication.id)}
            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <button
          onClick={() => onTake(medication.id)}
          disabled={isTaken}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
            isTaken 
              ? 'bg-green-500 text-white cursor-default shadow-lg shadow-green-100/50' 
              : isLate 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'
                : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95 shadow-lg shadow-sky-100'
          }`}
        >
          {isTaken ? (
            <>
              <CheckCircle2 size={18} />
              Concluído
            </>
          ) : (
            'Marcar Tomado'
          )}
        </button>
      </div>
    </div>
  );
};

export default MedicationCard;
