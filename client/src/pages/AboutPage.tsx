import { Link } from "wouter";
import { ArrowLeft, Crosshair, Rocket, Shield, Trophy } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <PublicShell
      title="About"
      description="Learn about ASTRODODGE, the web-based space survival game."
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <p className="text-xs font-mono tracking-[0.35em] text-cyan-300">MISSION BRIEFING / ABOUT</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold neon-text">ASTRODODGE</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            ASTRODODGE is a fast-paced space survival game where your mission is simple:
            survive the asteroid field for as long as possible.
          </p>
        </section>

        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-6 sm:p-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>
              Take control of <strong className="text-white">Vanguard V1</strong>, navigate through increasingly
              dangerous asteroid fields, and push your score higher with every run.
            </p>
            <p>
              ASTRODODGE is an independent student game project focused on creating a polished,
              web-based space survival experience while exploring modern game development and web technologies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MissionCard icon={<Crosshair />} title="YOUR MISSION" text="Survive the field. Beat your record. Climb the leaderboard." />
              <MissionCard icon={<Shield />} title="YOUR FLEET" text="Start with Vanguard V1 and unlock additional ships in the Hangar." />
              <MissionCard icon={<Trophy />} title="YOUR RECORD" text="Every run is a chance to reach a new sector and earn more gems." />
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-white mb-4">FEATURES</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  "Space survival gameplay",
                  "Increasingly difficult asteroid fields",
                  "Global leaderboard",
                  "Unlockable ships and special abilities",
                  "May include achievements as the project evolves",
                  "May include additional power-ups and special events",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild variant="outline" className="font-mono tracking-widest">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> BACK TO ASTRODODGE</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}

function MissionCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="text-xs font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-sm">{text}</p>
    </div>
  );
}