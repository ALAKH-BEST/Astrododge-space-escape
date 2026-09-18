import { Link } from "wouter";
import { Rocket } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary to-accent">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-display font-bold tracking-wider text-foreground">
              ASTRO<span className="text-primary">DODGE</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground tracking-widest">
              SURVIVE. ADAPT. ESCAPE.
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs font-mono text-muted-foreground">
          <Link href="/about" className="hover:text-primary transition-colors">ABOUT</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">PRIVACY POLICY</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">TERMS OF SERVICE</Link>
        </nav>

        <div className="text-[10px] font-mono text-muted-foreground/70">
          © 2026 ASTRODODGE
        </div>
      </div>
    </footer>
  );
}
