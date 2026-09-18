import { Link } from "wouter";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <PublicShell
      title="Privacy Policy"
      description="Read the ASTRODODGE privacy policy."
    >
      <article className="max-w-3xl mx-auto">
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-6 sm:p-10">
            <div className="flex items-start gap-4 border-b border-white/10 pb-6 mb-8">
              <div className="p-3 rounded-xl bg-primary/15 text-primary">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono tracking-[0.3em] text-cyan-300 mb-2">COMMANDER DATA / POLICY</p>
                <h1 className="text-3xl sm:text-4xl font-display font-bold">Privacy Policy</h1>
                <p className="text-xs font-mono text-muted-foreground mt-2">Last updated: August 20, 2026</p>
              </div>
            </div>

            <div className="space-y-7 text-muted-foreground leading-relaxed">
              <p>ASTRODODGE respects your privacy. This Privacy Policy explains what information may be collected when you use the ASTRODODGE website and game.</p>
              <PolicySection title="Information We Collect">
                <p>Depending on the features you use, ASTRODODGE may collect information such as your commander name, game scores, achievements, and account information.</p>
                <p>We only collect information that is necessary to provide and improve the game's features.</p>
              </PolicySection>
              <PolicySection title="How We Use Information">
                <p>Information may be used to:</p>
                <BulletList items={["Provide game functionality", "Maintain leaderboards", "Save game progress and achievements", "Improve the game's performance and user experience", "Prevent abuse, cheating, and misuse of the service"]} />
              </PolicySection>
              <PolicySection title="Third-Party Services">
                <p>ASTRODODGE may use third-party services for hosting, analytics, advertising, authentication, payments, or other functionality. These services may process information according to their own privacy policies.</p>
              </PolicySection>
              <PolicySection title="Advertising">
                <p>If advertising is enabled, third-party advertising providers may use cookies or similar technologies to display and measure advertisements.</p>
              </PolicySection>
              <PolicySection title="Data Security">
                <p>We take reasonable measures to protect information associated with ASTRODODGE. However, no internet service can guarantee complete security.</p>
              </PolicySection>
              <PolicySection title="Children's Privacy">
                <p>ASTRODODGE does not knowingly collect personal information from children without appropriate authorization.</p>
              </PolicySection>
              <PolicySection title="Changes to This Policy">
                <p>This Privacy Policy may be updated as ASTRODODGE develops. Changes will be reflected on this page with an updated date.</p>
              </PolicySection>
              <PolicySection title="Contact">
                <p>For privacy-related questions or requests, contact:</p>
                <a href="mailto:astrododge1@gmail.com" className="text-primary hover:text-accent transition-colors">astrododge1@gmail.com</a>
              </PolicySection>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <Button asChild variant="outline" className="font-mono tracking-widest">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> BACK TO ASTRODODGE</Link>
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h2 className="text-lg font-display font-bold text-foreground">{title}</h2>{children}</section>;
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>{item}</span></li>)}</ul>;
}