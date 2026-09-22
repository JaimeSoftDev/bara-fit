export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(d);
}

export function formatDateLong(dateIso: string): string {
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "2-digit", month: "long" }).format(d);
}

export function formatTime(dateIso: string): string {
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(d);
}
