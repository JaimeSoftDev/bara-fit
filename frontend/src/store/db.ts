import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatISO } from "date-fns";
import { buildSeed, type Database } from "../lib/seed";
import { id } from "../lib/id";
import type {
  Booking,
  BookingStatus,
  ClientProfile,
  Exercise,
  Invoice,
  InvoiceStatus,
  Message,
  NutritionPlan,
  ProgressEntry,
  WorkoutPlan,
} from "../types";

interface DbState {
  db: Database;
  resetDemoData: () => void;

  addProgressEntry: (entry: Omit<ProgressEntry, "id">) => void;
  addMessage: (conversationId: string, senderId: string, text: string) => void;
  setWorkoutCompletion: (
    clientId: string,
    planId: string,
    dayId: string,
    date: string,
    completedItemIds: string[],
  ) => void;
  addBooking: (booking: Omit<Booking, "id">) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  upsertExercise: (exercise: Exercise) => void;
  deleteExercise: (exerciseId: string) => void;
  upsertWorkoutPlan: (plan: WorkoutPlan) => void;
  upsertNutritionPlan: (plan: NutritionPlan) => void;
  markInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  addInvoice: (invoice: Omit<Invoice, "id">) => void;
  inviteClient: (client: Omit<ClientProfile, "id" | "role"> & { role?: "client" }) => string;
}

export const useDb = create<DbState>()(
  persist(
    (set) => ({
      db: buildSeed(),

      resetDemoData: () => set({ db: buildSeed() }),

      addProgressEntry: (entry) =>
        set((state) => {
          const pid = id("pe");
          return {
            db: {
              ...state.db,
              progressEntries: {
                ...state.db.progressEntries,
                [pid]: { ...entry, id: pid },
              },
            },
          };
        }),

      addMessage: (conversationId, senderId, text) =>
        set((state) => {
          const mid = id("msg");
          const msg: Message = {
            id: mid,
            conversationId,
            senderId,
            text,
            createdAt: formatISO(new Date()),
          };
          return {
            db: { ...state.db, messages: { ...state.db.messages, [mid]: msg } },
          };
        }),

      setWorkoutCompletion: (clientId, planId, dayId, date, completedItemIds) =>
        set((state) => {
          const existing = Object.values(state.db.workoutCompletions).find(
            (w) => w.clientId === clientId && w.planId === planId && w.dayId === dayId && w.date === date,
          );
          const wcId = existing?.id ?? id("wc");
          return {
            db: {
              ...state.db,
              workoutCompletions: {
                ...state.db.workoutCompletions,
                [wcId]: { id: wcId, clientId, planId, dayId, date, completedItemIds },
              },
            },
          };
        }),

      addBooking: (booking) =>
        set((state) => {
          const bid = id("bk");
          return {
            db: { ...state.db, bookings: { ...state.db.bookings, [bid]: { ...booking, id: bid } } },
          };
        }),

      updateBookingStatus: (bookingId, status) =>
        set((state) => {
          const existing = state.db.bookings[bookingId];
          if (!existing) return state;
          return {
            db: {
              ...state.db,
              bookings: { ...state.db.bookings, [bookingId]: { ...existing, status } },
            },
          };
        }),

      upsertExercise: (exercise) =>
        set((state) => ({
          db: { ...state.db, exercises: { ...state.db.exercises, [exercise.id]: exercise } },
        })),

      deleteExercise: (exerciseId) =>
        set((state) => {
          const next = { ...state.db.exercises };
          delete next[exerciseId];
          return { db: { ...state.db, exercises: next } };
        }),

      upsertWorkoutPlan: (plan) =>
        set((state) => ({
          db: { ...state.db, workoutPlans: { ...state.db.workoutPlans, [plan.id]: plan } },
        })),

      upsertNutritionPlan: (plan) =>
        set((state) => ({
          db: { ...state.db, nutritionPlans: { ...state.db.nutritionPlans, [plan.id]: plan } },
        })),

      markInvoiceStatus: (invoiceId, status) =>
        set((state) => {
          const existing = state.db.invoices[invoiceId];
          if (!existing) return state;
          return {
            db: {
              ...state.db,
              invoices: {
                ...state.db.invoices,
                [invoiceId]: {
                  ...existing,
                  status,
                  paidAt: status === "paid" ? formatISO(new Date(), { representation: "date" }) : existing.paidAt,
                },
              },
            },
          };
        }),

      addInvoice: (invoice) =>
        set((state) => {
          const iid = id("inv");
          return { db: { ...state.db, invoices: { ...state.db.invoices, [iid]: { ...invoice, id: iid } } } };
        }),

      inviteClient: (client) => {
        const cid = id("client");
        set((state) => {
          const trainer = state.db.users[client.trainerId];
          const updatedTrainer =
            trainer && trainer.role === "trainer"
              ? { ...trainer, clientIds: [...trainer.clientIds, cid] }
              : trainer;
          return {
            db: {
              ...state.db,
              users: {
                ...state.db.users,
                [cid]: { ...client, id: cid, role: "client" },
                ...(updatedTrainer ? { [client.trainerId]: updatedTrainer } : {}),
              },
            },
          };
        });
        return cid;
      },
    }),
    { name: "barafit-db", version: 1 },
  ),
);

export function useCurrentDb() {
  return useDb((s) => s.db);
}

export const dbActions = () => useDb.getState();
