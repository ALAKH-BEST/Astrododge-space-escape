import { motion } from "framer-motion";
import { Check, Gem, Gauge, LockKeyhole, Rocket, Shield, Sparkles, Zap } from "lucide-react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEquipShip, useProgression, usePurchaseShip } from "@/hooks/use-progression";
import { ships, type ShipDefinition, type ShipId } from "@shared/ships";

const shipOrder: ShipId[] = ["vanguard", "phantom", "titan", "nova"];

export default function HangarPage() {
  const { data: progression, isLoading } = useProgression();
  const purchase = usePurchaseShip();
  const equip = useEquipShip();

  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono tracking-[0.35em] text-cyan-300 mb-3">FLEET COMMAND / SHIP SYSTEMS</p>
            <h1 className="text-5xl font-display font-bold neon-text">HANGAR</h1>
            <p className="text-muted-foreground font-mono mt-3">Configure your vessel before entering the asteroid field.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 shadow-[0_0_25px_rgba(34,211,238,0.12)]">
            <Gem className="h-6 w-6 text-cyan-300" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-cyan-200/70 font-mono">Gem balance</div>
              <div className="text-2xl font-display font-bold text-white">
                {isLoading ? "----" : (progression?.gems ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shipOrder.map((shipId, index) => (
            <ShipCard
              key={shipId}
              ship={ships[shipId]}
              owned={progression?.ownedShips.includes(shipId) ?? false}
              equipped={progression?.equippedShip === shipId}
              canAfford={(progression?.gems ?? 0) >= ships[shipId].price}
              onPurchase={() => purchase.mutate({ shipId })}
              onEquip={() => equip.mutate({ shipId })}
              busy={purchase.isPending || equip.isPending}
              delay={index * 80}
            />
          ))}
        </div>
      </div>
    </GameLayout>
  );
}

function ShipCard({ ship, owned, equipped, canAfford, onPurchase, onEquip, busy, delay }: { ship: ShipDefinition; owned: boolean; equipped: boolean; canAfford: boolean; onPurchase: () => void; onEquip: () => void; busy: boolean; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay / 1000 }}>
      <Card className={`group relative overflow-hidden bg-card/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${equipped ? "border-primary/70 shadow-[0_0_35px_rgba(124,58,237,0.25)]" : "border-white/10 hover:border-primary/40"}`}>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 75% 15%, ${ship.color}, transparent 45%)` }} />
        <CardHeader className="relative flex flex-row items-start justify-between pb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={equipped ? "default" : owned ? "secondary" : "outline"} className="font-mono text-[10px] tracking-widest">{equipped ? "EQUIPPED" : owned ? "OWNED" : "LOCKED"}</Badge>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{ship.role}</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">{ship.name}</h2>
          </div>
          <ShipVisual shipId={ship.id} color={ship.color} />
        </CardHeader>
        <CardContent className="relative space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="SPEED" value={ship.speed} icon={<Gauge className="h-3.5 w-3.5" />} />
            <Stat label="HANDLING" value={ship.handling} icon={<Zap className="h-3.5 w-3.5" />} />
            <Stat label="SHIELD" value={ship.shield} icon={<Shield className="h-3.5 w-3.5" />} />
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-primary mb-1"><Sparkles className="h-3.5 w-3.5" /> {ship.ability}</div>
            <p className="text-sm text-muted-foreground">{ship.abilityDescription}</p>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 font-mono">{ship.price === 0 ? <span className="text-sm text-emerald-300">FREE</span> : <><Gem className="h-4 w-4 text-cyan-300" /><span className="text-lg text-white">{ship.price.toLocaleString()}</span></>}</div>
            {equipped ? <Button disabled variant="outline" className="font-mono tracking-widest text-xs"><Check className="mr-2 h-4 w-4" /> EQUIPPED</Button> : owned ? <Button onClick={onEquip} disabled={busy} className="font-mono tracking-widest text-xs">EQUIP SHIP</Button> : <Button onClick={onPurchase} disabled={!canAfford || busy} className="font-mono tracking-widest text-xs bg-gradient-to-r from-primary to-accent">{canAfford ? "PURCHASE" : <><LockKeyhole className="mr-2 h-4 w-4" /> LOCKED</>}</Button>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="rounded-lg border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">{icon}{label}</div><div className="flex gap-1 mt-2">{[1, 2, 3, 4, 5].map((dot) => <span key={dot} className={`h-1.5 flex-1 rounded-full ${dot <= value ? "bg-primary shadow-[0_0_7px_hsl(var(--primary))]" : "bg-white/10"}`} />)}</div><div className="text-xs font-mono text-white/70 mt-1">{value}/5</div></div>;
}

function ShipVisual({ shipId, color }: { shipId: ShipId; color: string }) {
  return <div className="h-24 w-32 flex items-center justify-center" style={{ color }}><svg viewBox="0 0 160 100" className="h-full w-full drop-shadow-[0_0_14px_currentColor]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
    {shipId === "vanguard" && <><path fill="#f8fafc" d="M142 50 56 20 68 50 56 80Z" /><path fill={color} d="M68 50 35 28 48 50 35 72Z" /><ellipse cx="98" cy="50" rx="16" ry="7" fill="#0ea5e9" /></>}
    {shipId === "phantom" && <><path fill="#e0f2fe" d="M145 50 47 18 65 50 47 82Z" /><path fill={color} d="M65 50 28 38 43 50 28 62Z" /><path d="M83 35 63 16M83 65 63 84" /></>}
    {shipId === "titan" && <><path fill="#fbbf24" d="M135 50 75 22 57 35 38 50 57 65 75 78Z" /><path fill="#78350f" d="M75 35h35l17 15-17 15H75l-12-15Z" /><rect x="43" y="39" width="12" height="22" rx="3" /></>}
    {shipId === "nova" && <><path fill="#fdf2f8" d="M148 50 52 22 72 50 52 78Z" /><path fill={color} d="M75 50 42 20 49 50 42 80Z" /><path d="m85 32 25-15M85 68l25 15" /><ellipse cx="103" cy="50" rx="12" ry="5" fill="#db2777" /></>}
  </svg></div>;
}