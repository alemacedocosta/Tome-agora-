
import { Medication } from '../types';

/**
 * Calcula o slot de horário estipulado mais próximo (o próximo a acontecer).
 */
export const calculateNextDose = (med: Medication): Date => {
  const now = new Date();
  const [hours, minutes] = med.dosage_time.split(':').map(Number);
  
  let baseDose = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  const periodicityMs = med.periodicity_hours * 60 * 60 * 1000;
  
  let currentSlot = baseDose.getTime();
  
  // Ajusta o slot para trás se estiver no futuro, para encontrar o ciclo atual
  while (currentSlot > now.getTime()) {
    currentSlot -= periodicityMs;
  }
  
  const nextSlot = currentSlot + periodicityMs;
  return new Date(nextSlot);
};

/**
 * Calcula o slot de horário que acabou de passar.
 */
export const calculatePreviousDose = (med: Medication): Date => {
  const nextDose = calculateNextDose(med);
  const periodicityMs = med.periodicity_hours * 60 * 60 * 1000;
  return new Date(nextDose.getTime() - periodicityMs);
};

export const getCountdownPercentage = (med: Medication): number => {
  const now = new Date().getTime();
  const next = calculateNextDose(med).getTime();
  const prev = calculatePreviousDose(med).getTime();
  
  const totalWindow = next - prev;
  const remaining = next - now;
  const percentage = (remaining / totalWindow) * 100;
  
  return Math.min(100, Math.max(0, percentage));
};

export const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) return 'Agora!';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Verifica se a dose deve aparecer como "Tomada".
 * Regra: 
 * 1. Reseta à meia-noite se periodicity <= 24h.
 * 2. Reseta apenas no próximo slot se periodicity > 48h.
 */
export const isCurrentDoseTaken = (med: Medication): boolean => {
  if (!med.last_taken_at) return false;
  
  const lastTaken = new Date(med.last_taken_at);
  const now = new Date();

  // Regra de Meia-Noite para remédios diários (<= 24h)
  if (med.periodicity_hours <= 24) {
    const isSameDay = lastTaken.getDate() === now.getDate() &&
                     lastTaken.getMonth() === now.getMonth() &&
                     lastTaken.getFullYear() === now.getFullYear();
    
    // Se mudou o dia, o checkbox deve resetar (voltar para pendentes)
    if (!isSameDay) return false;
  }

  // Regra de Slot (para todos, garantindo que não fique marcado após o horário da próxima dose)
  const currentSlotStart = calculatePreviousDose(med).getTime();
  const nextSlotStart = calculateNextDose(med).getTime();
  
  // Se a última vez que tomou foi antes do slot atual começar, ou se já passamos do próximo horário
  return lastTaken.getTime() >= currentSlotStart && now.getTime() < nextSlotStart;
};
