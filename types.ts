
export type MedicationCategory = 'para sempre' | 'temporário';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage_time: string; // HH:mm
  periodicity_hours: number;
  category: MedicationCategory;
  notes: string;
  last_taken_at: string | null; // ISO string
  last_notified_at: string | null; // ISO string
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
}
