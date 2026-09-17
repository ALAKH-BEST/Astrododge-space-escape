import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const themes = [
  { id: "deep-space", name: "Deep Space", description: "Calm premium sci-fi", swatches: ["#070b1f", "#4f46e5", "#38bdf8"] },
  { id: "neon-cyberpunk", name: "Neon Cyberpunk", description: "Purple, pink & cyan HUD", swatches: ["#05030d", "#d946ef", "#22d3ee"] },
  { id: "solar-flare", name: "Solar Flare", description: "Warm energy glow", swatches: ["#160804", "#f97316", "#facc15"] },
  { id: "frozen-galaxy", name: "Frozen Galaxy", description: "Cold crystal atmosphere", swatches: ["#03111f", "#22d3ee", "#f0f9ff"] },
  { id: "void-eclipse", name: "Void / Eclipse", description: "Dark red mystery", swatches: ["#090507", "#991b1b", "#7e22ce"] },
  { id: "starlight-white", name: "Starlight White", description: "Silky pearl sci-fi", swatches: ["#f4f0e8", "#b08d57", "#7c8da6"] },
  { id: "nebula-green", name: "Nebula Green", description: "Emerald cosmic atmosphere", swatches: ["#061a16", "#10b981", "#5eead4"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
const defaultTheme: ThemeId = "deep-space";
const storageKey = "astrododge-theme";
type ThemeContextValue = { theme: ThemeId; setTheme: (theme: ThemeId) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
function isThemeId(value: string | null): value is ThemeId { return themes.some((theme) => theme.id === value); }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const savedTheme = window.localStorage.getItem(storageKey);
    return isThemeId(savedTheme) ? savedTheme : defaultTheme;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme: (nextTheme: ThemeId) => setThemeState(nextTheme) }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
