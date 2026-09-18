import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <PublicShell title="Terms of Service" description="Read the ASTRODODGE terms of service.">
      <article className="max-w-3xl mx-auto">
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-6 sm:p-10">
            <div className="flex items-start gap-4 border-b border-white/10 pb-6 mb-8">
              <div className="p-3 rounded-xl bg-primary/15 text-primary"><FileText className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-mono tracking-[0.3em] text-cyan-300 mb-2">COMMANDER AGREEMENT</p>
                <h1 className="text-3xl sm:text-4xl font-display font-bold">Terms of Service</h1>
                <p className="text-xs font-mono text-muted-foreground mt-2">Last updated: August 20, 2026</p>
              </div>
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>ASTRODODGE is an independent student game project. By using the website, you agree to use the service responsibly and respect the integrity of the game and its community.</p>
              <section className="space-y-2"><h2 className="text-lg font-display font-bold text-foreground">Fair Play</h2><p>Do not attempt to disrupt the service, impersonate another commander, manipulate leaderboard records, or use the game to harm other players.</p></section>
              <section className="space-y-2"><h2 className="text-lg font-display font-bold text-foreground">Service Changes</h2><p>ASTRODODGE may change, improve, or temporarily suspend features as the project develops.</p></section>
              <section className="space-y-2"><h2 className="text-lg font-display font-bold text-foreground">Contact</h2><p>Questions about these terms can be sent to <a href="mailto:astrododge1@gmail.com" className="text-primary hover:text-accent transition-colors">astrododge1@gmail.com</a>.</p></section>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8"><Button asChild variant="outline" className="font-mono tracking-widest"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> BACK TO ASTRODODGE</Link></Button></div>
      </article>
    </PublicShell>
  );
}