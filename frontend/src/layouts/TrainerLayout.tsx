import { CalendarDays, LayoutDashboard, MessageCircle, Users, Wallet, Dumbbell, Settings } from "lucide-react";
import { AppShell, type NavItem } from "../components/layout/AppShell";

const navItems: NavItem[] = [
  { to: "/trainer", label: "Inicio", icon: LayoutDashboard },
  { to: "/trainer/clients", label: "Clientes", icon: Users },
  { to: "/trainer/calendar", label: "Agenda", icon: CalendarDays },
  { to: "/trainer/payments", label: "Pagos", icon: Wallet },
  { to: "/trainer/chat", label: "Chat", icon: MessageCircle },
  { to: "/trainer/exercises", label: "Ejercicios", icon: Dumbbell },
  { to: "/trainer/settings", label: "Ajustes", icon: Settings },
];

export default function TrainerLayout() {
  return <AppShell navItems={navItems} brand="Panel de entrenador" />;
}
