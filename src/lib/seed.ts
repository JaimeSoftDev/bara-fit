import { addDays, formatISO, subDays } from "date-fns";
import { id } from "./id";
import type {
  AppUser,
  Booking,
  ClientProfile,
  Conversation,
  Exercise,
  Invoice,
  Message,
  NutritionPlan,
  ProgressEntry,
  TrainerProfile,
  WorkoutCompletion,
  WorkoutPlan,
} from "../types";

const iso = (d: Date) => formatISO(d);
const isoDate = (d: Date) => formatISO(d, { representation: "date" });

export interface Database {
  users: Record<string, AppUser>;
  exercises: Record<string, Exercise>;
  workoutPlans: Record<string, WorkoutPlan>;
  workoutCompletions: Record<string, WorkoutCompletion>;
  nutritionPlans: Record<string, NutritionPlan>;
  bookings: Record<string, Booking>;
  progressEntries: Record<string, ProgressEntry>;
  conversations: Record<string, Conversation>;
  messages: Record<string, Message>;
  invoices: Record<string, Invoice>;
}

export function buildSeed(): Database {
  const now = new Date();

  const trainerId = "trainer_demo";
  const client1 = "client_lucia";
  const client2 = "client_marcos";
  const client3 = "client_paula";

  const trainer: TrainerProfile = {
    id: trainerId,
    role: "trainer",
    name: "Carlos Ríos",
    email: "carlos@barafit.app",
    avatarUrl: "",
    specialties: ["Fuerza", "Hipertrofia", "Pérdida de grasa"],
    bio: "Entrenador personal certificado NSCA-CPT. 8 años ayudando a personas a construir hábitos sostenibles.",
    clientIds: [client1, client2, client3],
    brandColor: "#4f46e5",
  };

  const clients: ClientProfile[] = [
    {
      id: client1,
      role: "client",
      name: "Lucía Fernández",
      email: "lucia@example.com",
      trainerId,
      goal: "Ganar fuerza y tono muscular",
      heightCm: 165,
      startWeightKg: 68,
    },
    {
      id: client2,
      role: "client",
      name: "Marcos Iglesias",
      email: "marcos@example.com",
      trainerId,
      goal: "Perder grasa corporal",
      heightCm: 178,
      startWeightKg: 92,
    },
    {
      id: client3,
      role: "client",
      name: "Paula Gómez",
      email: "paula@example.com",
      trainerId,
      goal: "Preparación media maratón",
      heightCm: 170,
      startWeightKg: 61,
    },
  ];

  const users: Record<string, AppUser> = { [trainerId]: trainer };
  for (const c of clients) users[c.id] = c;

  // Exercises
  const exerciseDefs: Array<[string, Exercise["muscleGroup"], string]> = [
    ["Sentadilla trasera", "Piernas", "Barra"],
    ["Press banca", "Pecho", "Barra"],
    ["Peso muerto rumano", "Piernas", "Barra"],
    ["Dominadas", "Espalda", "Peso corporal"],
    ["Press militar", "Hombros", "Mancuernas"],
    ["Remo con barra", "Espalda", "Barra"],
    ["Curl de bíceps", "Brazos", "Mancuernas"],
    ["Plancha", "Core", "Peso corporal"],
    ["Zancadas", "Piernas", "Mancuernas"],
    ["Carrera continua", "Cardio", "Ninguno"],
  ];
  const exercises: Record<string, Exercise> = {};
  const exId: Record<string, string> = {};
  for (const [name, muscleGroup, equipment] of exerciseDefs) {
    const eid = id("ex");
    exId[name] = eid;
    exercises[eid] = {
      id: eid,
      trainerId,
      name,
      muscleGroup,
      equipment,
      notes: "",
    };
  }

  // Workout plan for client1
  const wp1: WorkoutPlan = {
    id: id("wp"),
    trainerId,
    clientId: client1,
    name: "Fuerza Full Body - Fase 1",
    startDate: isoDate(subDays(now, 14)),
    status: "active",
    days: [
      {
        id: id("day"),
        label: "Día 1 - Empuje",
        items: [
          { id: id("it"), exerciseId: exId["Press banca"], sets: 4, reps: "6-8", loadKg: 40, restSeconds: 90 },
          { id: id("it"), exerciseId: exId["Press militar"], sets: 3, reps: "8-10", loadKg: 16, restSeconds: 75 },
          { id: id("it"), exerciseId: exId["Plancha"], sets: 3, reps: "45s", restSeconds: 45 },
        ],
      },
      {
        id: id("day"),
        label: "Día 2 - Tracción",
        items: [
          { id: id("it"), exerciseId: exId["Dominadas"], sets: 4, reps: "6-8", restSeconds: 90 },
          { id: id("it"), exerciseId: exId["Remo con barra"], sets: 4, reps: "8-10", loadKg: 35, restSeconds: 90 },
          { id: id("it"), exerciseId: exId["Curl de bíceps"], sets: 3, reps: "10-12", loadKg: 10, restSeconds: 60 },
        ],
      },
      {
        id: id("day"),
        label: "Día 3 - Piernas",
        items: [
          { id: id("it"), exerciseId: exId["Sentadilla trasera"], sets: 4, reps: "5-6", loadKg: 55, restSeconds: 120 },
          { id: id("it"), exerciseId: exId["Peso muerto rumano"], sets: 3, reps: "8-10", loadKg: 45, restSeconds: 90 },
          { id: id("it"), exerciseId: exId["Zancadas"], sets: 3, reps: "12 x pierna", loadKg: 12, restSeconds: 60 },
        ],
      },
    ],
  };

  const wp2: WorkoutPlan = {
    id: id("wp"),
    trainerId,
    clientId: client2,
    name: "Quema de grasa - Circuitos",
    startDate: isoDate(subDays(now, 7)),
    status: "active",
    days: [
      {
        id: id("day"),
        label: "Circuito A",
        items: [
          { id: id("it"), exerciseId: exId["Sentadilla trasera"], sets: 3, reps: "15", loadKg: 30, restSeconds: 45 },
          { id: id("it"), exerciseId: exId["Remo con barra"], sets: 3, reps: "15", loadKg: 25, restSeconds: 45 },
          { id: id("it"), exerciseId: exId["Carrera continua"], sets: 1, reps: "20 min", restSeconds: 0 },
        ],
      },
    ],
  };

  const wp3: WorkoutPlan = {
    id: id("wp"),
    trainerId,
    clientId: client3,
    name: "Plan resistencia 10K",
    startDate: isoDate(subDays(now, 21)),
    status: "active",
    days: [
      {
        id: id("day"),
        label: "Día largo",
        items: [
          { id: id("it"), exerciseId: exId["Carrera continua"], sets: 1, reps: "50 min", restSeconds: 0 },
          { id: id("it"), exerciseId: exId["Plancha"], sets: 3, reps: "60s", restSeconds: 30 },
        ],
      },
    ],
  };

  const workoutPlans = { [wp1.id]: wp1, [wp2.id]: wp2, [wp3.id]: wp3 };

  const workoutCompletions: Record<string, WorkoutCompletion> = {};
  const comp1Id = id("wc");
  workoutCompletions[comp1Id] = {
    id: comp1Id,
    clientId: client1,
    planId: wp1.id,
    dayId: wp1.days[0].id,
    date: isoDate(subDays(now, 2)),
    completedItemIds: wp1.days[0].items.map((i) => i.id),
  };

  // Nutrition plans
  const np1: NutritionPlan = {
    id: id("np"),
    trainerId,
    clientId: client1,
    name: "Plan nutricional - Recomposición",
    dailyCalories: 2100,
    proteinG: 150,
    carbsG: 210,
    fatG: 65,
    meals: [
      { id: id("meal"), name: "Desayuno", description: "Avena con proteína y fruta", calories: 450, protein: 35, carbs: 55, fat: 10 },
      { id: id("meal"), name: "Comida", description: "Pollo, arroz y verduras", calories: 650, protein: 50, carbs: 70, fat: 15 },
      { id: id("meal"), name: "Merienda", description: "Yogur griego y frutos secos", calories: 300, protein: 20, carbs: 20, fat: 15 },
      { id: id("meal"), name: "Cena", description: "Salmón con ensalada", calories: 550, protein: 40, carbs: 25, fat: 25 },
    ],
  };
  const np2: NutritionPlan = {
    id: id("np"),
    trainerId,
    clientId: client2,
    name: "Plan déficit calórico",
    dailyCalories: 1900,
    proteinG: 170,
    carbsG: 150,
    fatG: 60,
    meals: [
      { id: id("meal"), name: "Desayuno", description: "Huevos revueltos y tostada integral", calories: 400, protein: 30, carbs: 30, fat: 15 },
      { id: id("meal"), name: "Comida", description: "Ternera magra con quinoa", calories: 600, protein: 55, carbs: 50, fat: 15 },
      { id: id("meal"), name: "Cena", description: "Pescado blanco con verduras al vapor", calories: 500, protein: 45, carbs: 20, fat: 20 },
    ],
  };
  const nutritionPlans = { [np1.id]: np1, [np2.id]: np2 };

  // Bookings
  const bookings: Record<string, Booking> = {};
  const bookingDefs: Array<[string, string, number, number, "session" | "class"]> = [
    [client1, "Sesión personal - Fuerza", 1, 10, "session"],
    [client2, "Sesión personal - Cardio HIIT", 2, 17, "session"],
    [client3, "Clase grupal - Running técnico", 3, 8, "class"],
    [client1, "Revisión de progreso mensual", -3, 11, "session"],
  ];
  for (const [clientId, title, dayOffset, hour, type] of bookingDefs) {
    const start = new Date(now);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    const bid = id("bk");
    bookings[bid] = {
      id: bid,
      trainerId,
      clientId,
      title,
      type,
      startsAt: iso(start),
      endsAt: iso(end),
      status: dayOffset < 0 ? "completed" : "confirmed",
      location: type === "class" ? "Sala grupal - Centro BaraFit" : "Box 2 - Entrenamiento individual",
    };
  }

  // Progress entries
  const progressEntries: Record<string, ProgressEntry> = {};
  for (let i = 6; i >= 0; i--) {
    const date = isoDate(subDays(now, i * 7));
    const pid = id("pe");
    progressEntries[pid] = {
      id: pid,
      clientId: client1,
      date,
      weightKg: +(68 - i * 0.35).toFixed(1),
      bodyFatPct: +(26 - i * 0.4).toFixed(1),
      measurements: { waistCm: 74 - i, hipsCm: 98 - i * 0.5 },
    };
  }
  for (let i = 4; i >= 0; i--) {
    const date = isoDate(subDays(now, i * 7));
    const pid = id("pe");
    progressEntries[pid] = {
      id: pid,
      clientId: client2,
      date,
      weightKg: +(92 - i * 0.8).toFixed(1),
      bodyFatPct: +(28 - i * 0.6).toFixed(1),
    };
  }

  // Conversations + messages
  const conversations: Record<string, Conversation> = {};
  const messages: Record<string, Message> = {};
  for (const c of clients) {
    const convId = id("conv");
    conversations[convId] = { id: convId, trainerId, clientId: c.id };
    const m1 = id("msg");
    const m2 = id("msg");
    messages[m1] = {
      id: m1,
      conversationId: convId,
      senderId: trainerId,
      text: `¡Hola ${c.name.split(" ")[0]}! Te he actualizado el plan para esta semana, cualquier duda me dices.`,
      createdAt: iso(subDays(now, 1)),
    };
    messages[m2] = {
      id: m2,
      conversationId: convId,
      senderId: c.id,
      text: "¡Perfecto, gracias! Le echo un vistazo ahora mismo 💪",
      createdAt: iso(subDays(now, 1)),
    };
  }

  // Invoices
  const invoices: Record<string, Invoice> = {};
  const invoiceDefs: Array<[string, string, number, "paid" | "pending" | "overdue", number]> = [
    [client1, "Mensualidad - Plan Fuerza", 60, "paid", -20],
    [client1, "Mensualidad - Plan Fuerza", 60, "pending", 5],
    [client2, "Mensualidad - Plan Pérdida de grasa", 60, "paid", -18],
    [client3, "Bono 10 sesiones", 250, "overdue", -2],
  ];
  for (const [clientId, concept, amount, status, dueOffset] of invoiceDefs) {
    const iid = id("inv");
    const due = addDays(now, dueOffset);
    invoices[iid] = {
      id: iid,
      trainerId,
      clientId,
      concept,
      amount,
      status,
      issuedAt: isoDate(subDays(due, 5)),
      dueDate: isoDate(due),
      paidAt: status === "paid" ? isoDate(due) : undefined,
    };
  }

  return {
    users,
    exercises,
    workoutPlans,
    workoutCompletions,
    nutritionPlans,
    bookings,
    progressEntries,
    conversations,
    messages,
    invoices,
  };
}
