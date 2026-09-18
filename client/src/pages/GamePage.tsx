import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Card } from "@/components/ui/card";
import { Info, Play, Rocket, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useProgression } from "@/hooks/use-progression";
import { ships } from "@shared/ships";

export default function GamePage() {
  const [showGame, setShowGame] = useState(false);
  const { data: progression } = useProgression();
  const currentShip = ships[progression?.equippedShip ?? "vanguard"];

  return (
    <GameLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <AnimatePresence mode="wait">
          {!showGame ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Rocket className="w-24 h-24 text-primary relative z-10 animate-bounce" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl font-display font-bold text-foreground tracking-tighter">
                  ASTRODODGE
                </h1>
                <p className="text-xl text-muted-foreground font-mono max-w-lg mx-auto">
                  Navigate the asteroid field. Survive as long as you can.
                </p>
              </div>

              <Card className="w-full max-w-md p-6 border-primary/20 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground font-mono uppercase">Current Vessel</div>
                    <div className="font-display text-lg text-primary">{currentShip?.name ?? "Vanguard V1"}</div>
                  </div>
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <Button className="w-full h-14 text-lg font-display" onClick={() => setShowGame(true)}>
                  <Play className="mr-2 h-5 w-5" />
                  BEGIN MISSION
                </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                <Card className="p-4 bg-card/40 border-border/50">
                  <Target className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <div className="font-display text-sm">SURVIVE</div>
                  <div className="text-xs text-muted-foreground mt-1">Avoid incoming asteroids</div>
                </Card>
                <Card className="p-4 bg-card/40 border-border/50">
                  <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="font-display text-sm">SCORE</div>
                  <div className="text-xs text-muted-foreground mt-1">Climb the leaderboard</div>
                </Card>
                <Card className="p-4 bg-card/40 border-border/50">
                  <Info className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="font-display text-sm">MASTER</div>
                  <div className="text-xs text-muted-foreground mt-1">Choose your ship wisely</div>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Button variant="outline" onClick={() => setShowGame(false)}>
                ← Return to Launch Bay
              </Button>
              <GameCanvas />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}
