import { GameLayout } from "@/components/layout/GameLayout";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <GameLayout>
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-display">ABOUT ASTRODODGE</h1>
          <p className="text-muted-foreground font-mono">A real-time arcade survival experience.</p>
        </div>
        <Card className="p-6 md:p-8 space-y-4 bg-card/60 backdrop-blur-sm">
          <p>
            ASTRODODGE is a browser-based space survival game built around fast reactions,
            persistent progression, and competitive leaderboards.
          </p>
          <p>
            The project combines a React and TypeScript client with a Node.js server,
            PostgreSQL persistence, and real-time multiplayer communication.
          </p>
        </Card>
      </div>
    </GameLayout>
  );
}
