import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { Rocket } from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export function PublicShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content");
    document.title = `${title} | ASTRODODGE`;
    descriptionTag?.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription) {
        descriptionTag.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-fixed">
      <div className="fixed inset-0 bg-background/90 z-0 pointer-events-none" />
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:shadow-[0_0_18px_rgba(168,85,247,0.45)] transition-shadow">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold tracking-wider text-white">
              ASTRO<span className="text-primary">DODGE</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSelector />
            <Link href="/" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
              BACK TO GAME
            </Link>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex-1 container mx-auto px-4 py-10 sm:py-16">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
