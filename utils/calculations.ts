
import { Medication } from '../types';

export const calculateNextDose = (med: Medication): Date => {
  const now = new Date();
  const [hours, minutes] = med.dosage_time.split(':').map(Number);
  let baseDose = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  const periodicityMs = med.periodicity_hours * 60 * 60 * 1000;
  
  let currentSlot = baseDose.getTime();
  // Encontra o slot mais próximo no futuro
  while (currentSlot <= now.getTime()) {
    currentSlot += periodicityMs;
  }
  
  return new Date(currentSlot);
};

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
  return Math.min(100, Math.max(0, (remaining / totalWindow) * 100));
};

export const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) return 'Agora!';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const isCurrentDoseTaken = (med: Medication): boolean => {
  if (!med.last_taken_at) return false;
  const lastTaken = new Date(med.last_taken_at).getTime();
  const currentSlotStart = calculatePreviousDose(med).getTime();
  const nextSlotStart = calculateNextDose(med).getTime();
  const now = new Date().getTime();

  // Dose foi tomada dentro do ciclo atual?
  return lastTaken >= currentSlotStart && now < nextSlotStart;
};
