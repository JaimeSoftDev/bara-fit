import type { Database } from "./seed";
import type { ClientProfile, TrainerProfile } from "../types";

export function getTrainer(db: Database, trainerId: string): TrainerProfile | undefined {
  const u = db.users[trainerId];
  return u && u.role === "trainer" ? u : undefined;
}

export function getClient(db: Database, clientId: string): ClientProfile | undefined {
  const u = db.users[clientId];
  return u && u.role === "client" ? u : undefined;
}

export function getClientsOfTrainer(db: Database, trainerId: string): ClientProfile[] {
  const trainer = getTrainer(db, trainerId);
  if (!trainer) return [];
  return trainer.clientIds.map((id) => getClient(db, id)).filter((c): c is ClientProfile => !!c);
}

export function getActiveWorkoutPlan(db: Database, clientId: string) {
  return Object.values(db.workoutPlans)
    .filter((p) => p.clientId === clientId && p.status === "active")
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))[0];
}

export function getWorkoutPlansOfClient(db: Database, clientId: string) {
  return Object.values(db.workoutPlans).filter((p) => p.clientId === clientId);
}

export function getNutritionPlanOfClient(db: Database, clientId: string) {
  return Object.values(db.nutritionPlans).find((p) => p.clientId === clientId);
}

export function getBookingsOfClient(db: Database, clientId: string) {
  return Object.values(db.bookings)
    .filter((b) => b.clientId === clientId)
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
}

export function getBookingsOfTrainer(db: Database, trainerId: string) {
  return Object.values(db.bookings)
    .filter((b) => b.trainerId === trainerId)
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
}

export function getProgressOfClient(db: Database, clientId: string) {
  return Object.values(db.progressEntries)
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function getConversation(db: Database, trainerId: string, clientId: string) {
  return Object.values(db.conversations).find((c) => c.trainerId === trainerId && c.clientId === clientId);
}

export function getMessages(db: Database, conversationId: string) {
  return Object.values(db.messages)
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function getInvoicesOfClient(db: Database, clientId: string) {
  return Object.values(db.invoices)
    .filter((i) => i.clientId === clientId)
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
}

export function getInvoicesOfTrainer(db: Database, trainerId: string) {
  return Object.values(db.invoices)
    .filter((i) => i.trainerId === trainerId)
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
}

export function getExercisesOfTrainer(db: Database, trainerId: string) {
  return Object.values(db.exercises).filter((e) => e.trainerId === trainerId);
}

export function getExercise(db: Database, exerciseId: string) {
  return db.exercises[exerciseId];
}
