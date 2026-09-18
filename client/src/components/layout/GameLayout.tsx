import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useProgression } from "@/hooks/use-progression";
import { Button } from "@/components/ui/button";
import { Gem, Rocket, LogOut } from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export function GameLayout({ children }: { children: ReactNode }) {
  const { data: user } = useUser();
  const { data: progression } = useProgression();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-fixed">
      <div className="fixed inset-0 bg-background/90 z-0 pointer-events-none" />
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-wider text-white">
                ASTRO<span className="text-primary">DODGE</span>
              </span>
            </div>

             {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 sm:gap-6 mr-2 sm:mr-4">
                  <Link href="/game" className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary ${location === '/game' ? 'text-primary' : 'text-muted-foreground'}`}>
                    PLAY
                  </Link>
                  <Link href="/hangar" className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary ${location === '/hangar' ? 'text-primary' : 'text-muted-foreground'}`}>
                    HANGAR
                  </Link>
                  <Link href="/leaderboard" className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary ${location === '/leaderboard' ? 'text-primary' : 'text-muted-foreground'}`}>
                    LEADERBOARD
                  </Link>
                  <Link href="/multiplayer" className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary ${location === '/multiplayer' ? 'text-primary' : 'text-muted-foreground'}`}>
                    MULTIPLAYER
                  </Link>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                   <ThemeSelector />
                  <div className="hidden sm:flex items-center gap-1.5 text-sm font-mono text-cyan-300" title="Gem balance">
                    <Gem className="h-4 w-4" />
                    {(progression?.gems ?? user?.gems ?? 0).toLocaleString()}
                  </div>
                  <span className="hidden sm:block text-sm font-mono text-muted-foreground">
                    CMDR. {user.username.toUpperCase()}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => logout()}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
