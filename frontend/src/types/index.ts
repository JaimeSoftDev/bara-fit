export type Role = "trainer" | "client";

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
}

export interface TrainerProfile extends BaseUser {
  role: "trainer";
  specialties: string[];
  bio: string;
  brandColor?: string;
  logoUrl?: string;
  businessId?: string;
  businessName?: string;
  businessRole?: "owner" | "staff";
}

export interface ClientProfile extends BaseUser {
  role: "client";
  trainerId: string;
  goal: string;
  heightCm: number;
  startWeightKg: number;
  birthDate?: string;
  brandColor?: string;
  logoUrl?: string;
}

export type AppUser = TrainerProfile | ClientProfile;

export type MuscleGroup =
  | "Pecho"
  | "Espalda"
  | "Piernas"
  | "Hombros"
  | "Brazos"
  | "Core"
  | "Cardio"
  | "Movilidad";

export interface Exercise {
  id: string;
  trainerId: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  videoUrl?: string;
  notes?: string;
}

export interface WorkoutItem {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string; // "8-10" or "12"
  loadKg?: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  label: string; // "Día 1 - Empuje"
  items: WorkoutItem[];
}

export type WorkoutPlanStatus = "active" | "draft" | "completed";

export interface WorkoutPlan {
  id: string;
  trainerId: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: WorkoutPlanStatus;
  days: WorkoutDay[];
}

export interface WorkoutCompletion {
  id: string;
  clientId: string;
  planId: string;
  dayId: string;
  date: string; // ISO date
  completedItemIds: string[];
}

export interface Meal {
  id: string;
  name: string; // "Desayuno"
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlan {
  id: string;
  trainerId: string;
  clientId: string;
  name: string;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  meals: Meal[];
  notes?: string;
}

export type BookingType = "session" | "class";
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type AttendeeStatus = "confirmed" | "pending" | "cancelled";

export interface BookingAttendee {
  id: string;
  name: string;
  status: AttendeeStatus;
  checkedInAt?: string;
}

export interface Recurrence {
  freq: "weekly";
  until: string; // ISO date
}

export interface Booking {
  id: string;
  trainerId: string;
  trainerName?: string;
  title: string;
  type: BookingType;
  startsAt: string; // ISO datetime
  endsAt: string;
  status: BookingStatus;
  location: string;
  notes?: string;
  capacity: number | null; // null = 1:1 session, otherwise max attendees for a class
  attendees: BookingAttendee[];
  attendeeCount: number;
  seriesId?: string;
}

export interface Invite {
  name: string;
  email: string;
  trainerName: string;
  status: "pending" | "accepted" | "expired";
}

export interface Measurements {
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armCm?: number;
  thighCm?: number;
}

export interface ProgressEntry {
  id: string;
  clientId: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  measurements?: Measurements;
  photoUrl?: string;
  note?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  trainerId: string;
  clientId: string;
}

export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface Invoice {
  id: string;
  trainerId: string;
  clientId: string;
  concept: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
}
