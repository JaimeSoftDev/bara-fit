import { Apple, CalendarDays, Dumbbell, Home, LineChart, MessageCircle, Wallet } from "lucide-react";
import { AppShell, type NavItem } from "../components/layout/AppShell";

const navItems: NavItem[] = [
  { to: "/client", label: "Inicio", icon: Home },
  { to: "/client/workout", label: "Rutina", icon: Dumbbell },
  { to: "/client/nutrition", label: "Nutrición", icon: Apple },
  { to: "/client/progress", label: "Progreso", icon: LineChart },
  { to: "/client/chat", label: "Chat", icon: MessageCircle },
  { to: "/client/calendar", label: "Agenda", icon: CalendarDays },
  { to: "/client/payments", label: "Pagos", icon: Wallet },
];

export default function ClientLayout() {
  return <AppShell navItems={navItems} brand="Área de cliente" />;
}
