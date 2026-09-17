import { Palette } from "lucide-react";
import { themes, useTheme } from "./ThemeProvider";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  return (
    <label className="theme-selector group" title="Choose visual theme">
      <Palette className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="sr-only">Theme</span>
      <select value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)} aria-label="Choose visual theme" className="max-w-[8.5rem] cursor-pointer appearance-none bg-transparent pr-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground outline-none transition-colors group-hover:text-foreground">
        {themes.map((option) => (
          <option key={option.id} value={option.id} className="bg-background text-foreground">{option.name}</option>
        ))}
      </select>
    </label>
  );
}
