import { GameLayout } from "@/components/layout/GameLayout";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <GameLayout>
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <h1 className="text-4xl font-display text-center">PRIVACY POLICY</h1>
        <Card className="p-6 md:p-8 space-y-5 bg-card/60">
          <section>
            <h2 className="text-xl mb-2">Information We Use</h2>
            <p className="text-muted-foreground">
              ASTRODODGE may process account information, gameplay data, scores, and technical
              information needed to operate the service.
            </p>
          </section>
          <section>
            <h2 className="text-xl mb-2">Analytics</h2>
            <p className="text-muted-foreground">
              Anonymous usage analytics may be used to understand site traffic and improve the game.
            </p>
          </section>
          <section>
            <h2 className="text-xl mb-2">Contact</h2>
            <p className="text-muted-foreground">Questions about privacy can be directed to the project owner.</p>
          </section>
        </Card>
      </div>
    </GameLayout>
  );
}
