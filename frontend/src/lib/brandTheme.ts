/** Lighten (positive percent) or darken (negative percent) a hex color. */
function shade(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const DEFAULT_BRAND = "#4f46e5";
const VARS = ["--color-brand-500", "--color-brand-600", "--color-brand-700"] as const;

/** Override Tailwind's brand-* CSS variables at runtime so bg-brand-600 etc. reflect the trainer's brand. */
export function applyBrandColor(hex: string | undefined | null) {
  const root = document.documentElement.style;
  const color = hex && /^#[0-9a-fA-F]{3,6}$/.test(hex) ? hex : null;

  if (!color) {
    for (const v of VARS) root.removeProperty(v);
    return;
  }

  root.setProperty("--color-brand-500", shade(color, 10));
  root.setProperty("--color-brand-600", color);
  root.setProperty("--color-brand-700", shade(color, -12));
}

export const DEFAULT_BRAND_COLOR = DEFAULT_BRAND;
