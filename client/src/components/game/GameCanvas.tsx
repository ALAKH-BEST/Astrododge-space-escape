import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Gem, Play, RotateCcw, Shield, Sparkles, Trophy, Zap } from "lucide-react";
import { useStartRun, useSubmitScore } from "@/hooks/use-scores";
import { useProgression } from "@/hooks/use-progression";
import { ships, type ShipId } from "@shared/ships";
import { Button } from "@/components/ui/button";
import type { MultiplayerRoom } from "@/hooks/use-multiplayer";

interface GameState {
  isPlaying: boolean;
  score: number;
  gameOver: boolean;
  survivalTime: number;
  sector: number;
}

interface AbilityUi {
  label: string;
  status: string;
  active: boolean;
}

type Obstacle = {
  x: number;
  y: number;
  type: "planet" | "asteroid" | "stone";
  size: number;
  speed: number;
};

type DeathBurst = {
  x: number;
  y: number;
  color: string;
  startedAt: number;
};

const PLAYER_SIZE = 30;
const OBSTACLE_SPEED = 3.5;
const SPAWN_RATE = 1500;

export function GameCanvas({
  multiplayer,
}: {
  multiplayer?: {
    room: MultiplayerRoom;
    onPosition: (x: number, y: number) => void;
  };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const shipRef = useRef<ShipId>("vanguard");
  const scoreMutation = useSubmitScore();
  const startRunMutation = useStartRun();
  const { data: progression } = useProgression();
  const startingRunRef = useRef(false);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    gameOver: false,
    survivalTime: 0,
    sector: 1,
  });
  const [abilityUi, setAbilityUi] = useState<AbilityUi>({
    label: "SYSTEMS",
    status: "SELECT A SHIP",
    active: false,
  });

  const gameStateRef = useRef({
    player: { x: 50, y: 200 },
    obstacles: [] as Obstacle[],
    stars: [] as { x: number; y: number; size: number; speed: number }[],
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false },
    lastSpawn: 0,
    score: 0,
    isPlaying: false,
    startedAt: 0,
    runId: "",
    runToken: "",
    shieldCharges: 0,
    abilityActiveUntil: 0,
    abilityCooldownUntil: 0,
    rngSeed: 1,
    lastPositionBroadcast: 0,
  });
  const multiplayerRef = useRef(multiplayer);
  const remoteAliveRef = useRef(new Map<string, boolean>());
  const deathBurstsRef = useRef(new Map<string, DeathBurst>());
  useEffect(() => {
    multiplayerRef.current = multiplayer;
  }, [multiplayer]);

  const selectedShip = ships[shipRef.current];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < 100; i++) {
      gameStateRef.current.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (multiplayer?.room.phase === "running" && multiplayer.room.startedAt && !gameStateRef.current.isPlaying) {
      startGame();
    }
  }, [multiplayer?.room.phase, multiplayer?.room.startedAt]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.code === "Space" && state.isPlaying) {
        e.preventDefault();
        activateAbility();
        return;
      }
      if (Object.prototype.hasOwnProperty.call(state.keys, e.key)) {
        state.keys[e.key as keyof typeof state.keys] = true;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (Object.prototype.hasOwnProperty.call(gameStateRef.current.keys, e.key)) {
        gameStateRef.current.keys[e.key as keyof typeof gameStateRef.current.keys] = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const state = gameStateRef.current;
      if (!state.isPlaying) return;
      const ship = ships[shipRef.current];
      const now = performance.now();
      if (ship.id === "titan") {
        setAbilityUi({ label: "FORTRESS", status: `${state.shieldCharges} SHIELDS`, active: state.shieldCharges > 0 });
      } else if (ship.id === "vanguard") {
        setAbilityUi({ label: "ABILITY", status: "NONE", active: false });
      } else if (now < state.abilityActiveUntil) {
        setAbilityUi({
          label: ship.ability,
          status: `ACTIVE — ${((state.abilityActiveUntil - now) / 1000).toFixed(1)}s`,
          active: true,
        });
      } else if (now < state.abilityCooldownUntil) {
        setAbilityUi({
          label: ship.ability,
          status: `COOLDOWN — ${Math.ceil((state.abilityCooldownUntil - now) / 1000)}s`,
          active: false,
        });
      } else {
        setAbilityUi({ label: ship.ability, status: "READY — SPACE", active: false });
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  const activateAbility = () => {
    const state = gameStateRef.current;
    const ship = ships[shipRef.current];
    const now = performance.now();
    if (!state.isPlaying || ship.id === "vanguard" || ship.id === "titan" || now < state.abilityCooldownUntil) return;

    const duration = ship.id === "phantom" ? 3000 : 5000;
    const cooldown = ship.id === "phantom" ? 12000 : 15000;
    state.abilityActiveUntil = now + duration;
    state.abilityCooldownUntil = now + cooldown;
    setAbilityUi({ label: ship.ability, status: `ACTIVE — ${(duration / 1000).toFixed(1)}s`, active: true });
  };

  const startGame = async () => {
    const canvas = canvasRef.current;
    if (!canvas || startingRunRef.current || gameStateRef.current.isPlaying) return;
    startingRunRef.current = true;
    scoreMutation.reset();
    try {
      const run = await startRunMutation.mutateAsync(multiplayerRef.current ? "multiplayer" : "solo");
      const equippedShip = progression?.equippedShip ?? "vanguard";
      shipRef.current = equippedShip;
      const now = performance.now();
      gameStateRef.current = {
        ...gameStateRef.current,
        player: { x: 50, y: canvas.height / 2 },
        obstacles: [],
        score: 0,
        isPlaying: true,
        lastSpawn: now,
        startedAt: now,
        runId: run.runId,
        runToken: run.runToken,
        shieldCharges: equippedShip === "titan" ? 3 : 0,
        abilityActiveUntil: 0,
        abilityCooldownUntil: 0,
        rngSeed: multiplayerRef.current?.room.seed ?? Math.floor(Math.random() * 2_147_483_647),
        lastPositionBroadcast: 0,
      };
      remoteAliveRef.current.clear();
      deathBurstsRef.current.clear();
      setAbilityUi({
        label: ships[equippedShip].ability,
        status: equippedShip === "titan" ? "3 SHIELDS" : equippedShip === "vanguard" ? "NONE" : "READY — SPACE",
        active: equippedShip === "titan",
      });
      setGameState({ isPlaying: true, score: 0, gameOver: false, survivalTime: 0, sector: 1 });
      requestRef.current = requestAnimationFrame(gameLoop);
    } finally {
      startingRunRef.current = false;
    }
  };

  const stopGame = () => {
    const state = gameStateRef.current;
    if (!state.isPlaying) return;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    state.isPlaying = false;
    const finalScore = Math.floor(state.score);
    const survivalTime = Math.max(0, (performance.now() - state.startedAt) / 1000);
    const activeMultiplayer = multiplayerRef.current;
    const canvas = canvasRef.current;
    if (activeMultiplayer?.room.phase === "running" && canvas) {
      activeMultiplayer.onPosition(state.player.x / canvas.width, state.player.y / canvas.height);
    }
    setGameState({
      isPlaying: false,
      score: finalScore,
      gameOver: true,
      survivalTime,
      sector: Math.max(1, Math.floor(finalScore / 100) + 1),
    });
    if (state.runId && state.runToken) {
      scoreMutation.mutate(
        { runId: state.runId, runToken: state.runToken },
        {
          onSuccess: (result) => {
            setGameState((previous) => ({
              ...previous,
              score: result.score.score,
              sector: Math.max(1, Math.floor(result.score.score / 100) + 1),
            }));
          },
        },
      );
    }
  };

  const gameLoop = (timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const state = gameStateRef.current;
    const ship = ships[shipRef.current];
    if (!canvas || !ctx || !state.isPlaying) return;

    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    const abilityActive = now < state.abilityActiveUntil;
    const movementSpeed = (4.5 + ship.speed * 0.4) * (0.8 + ship.handling * 0.05) * (ship.id === "nova" && abilityActive ? 1.5 : 1);
    if (state.keys.ArrowUp || state.keys.w) state.player.y -= movementSpeed;
    if (state.keys.ArrowDown || state.keys.s) state.player.y += movementSpeed;
    if (state.keys.ArrowLeft || state.keys.a) state.player.x -= movementSpeed;
    if (state.keys.ArrowRight || state.keys.d) state.player.x += movementSpeed;
    state.player.y = Math.max(PLAYER_SIZE, Math.min(canvas.height - PLAYER_SIZE, state.player.y));
    state.player.x = Math.max(PLAYER_SIZE, Math.min(canvas.width - PLAYER_SIZE, state.player.x));

    state.stars.forEach((star) => {
      star.x -= star.speed;
      if (star.x < 0) star.x = canvas.width;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (timestamp - state.lastSpawn > SPAWN_RATE - Math.min(700, state.score * 0.5)) {
      const types: Obstacle["type"][] = ["planet", "asteroid", "stone"];
      const type = types[Math.floor(nextRandom(state) * types.length)];
      const size = type === "planet" ? 40 : type === "asteroid" ? 25 : 10;
      const speed = type === "planet" ? OBSTACLE_SPEED * 0.8 : type === "asteroid" ? OBSTACLE_SPEED * 1.2 : OBSTACLE_SPEED * 1.5;
      state.obstacles.push({
        x: canvas.width + 50,
        y: nextRandom(state) * (canvas.height - 100) + 50,
        type,
        size,
        speed: speed + state.score / 500,
      });
      state.lastSpawn = timestamp;
    }

    for (let index = state.obstacles.length - 1; index >= 0; index--) {
      const obstacle = state.obstacles[index];
      obstacle.x -= obstacle.speed;
      drawObstacle(ctx, obstacle);

      const dx = state.player.x - obstacle.x;
      const dy = state.player.y - obstacle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const collisionRadius = PLAYER_SIZE / 1.5 + obstacle.size - ship.shield * 0.5;
      if (distance < collisionRadius) {
        if (ship.id === "phantom" && abilityActive) {
          continue;
        }
        if (ship.id === "titan" && state.shieldCharges > 0) {
          state.shieldCharges -= 1;
          state.obstacles.splice(index, 1);
          setAbilityUi({ label: "FORTRESS", status: `${state.shieldCharges} SHIELDS`, active: state.shieldCharges > 0 });
          continue;
        }
        stopGame();
        return;
      }

      if (obstacle.x < -100) {
        state.obstacles.splice(index, 1);
        state.score += 10 * (ship.id === "nova" && abilityActive ? 2 : 1);
      }
    }

    state.score += 0.1 * (ship.id === "nova" && abilityActive ? 2 : 1);

    const activeMultiplayer = multiplayerRef.current;
    if (activeMultiplayer?.room.phase === "running") {
      const visibleRemotePlayerIds = new Set<string>();
      activeMultiplayer.room.players.forEach((player) => {
        if (player.id === activeMultiplayer.room.localPlayerId) return;
        visibleRemotePlayerIds.add(player.id);
        const wasAlive = remoteAliveRef.current.get(player.id);
        if (wasAlive === true && !player.alive) {
          deathBurstsRef.current.set(player.id, {
            x: player.x * canvas.width,
            y: player.y * canvas.height,
            color: player.color,
            startedAt: performance.now(),
          });
        }
        remoteAliveRef.current.set(player.id, player.alive);

        const burst = deathBurstsRef.current.get(player.id);
        if (burst) {
          const progress = (performance.now() - burst.startedAt) / 900;
          if (progress < 1) {
            drawDeathBurst(ctx, burst.x, burst.y, burst.color, progress);
          } else {
            deathBurstsRef.current.delete(player.id);
          }
        }

        if (player.alive) {
          drawRemotePlayer(
            ctx,
            player.x * canvas.width,
            player.y * canvas.height,
            player.color,
            player.username,
            activeMultiplayer.room.players.findIndex((item) => item.id === player.id) + 1,
          );
        }
      });
      remoteAliveRef.current.forEach((_, playerId) => {
        if (!visibleRemotePlayerIds.has(playerId)) remoteAliveRef.current.delete(playerId);
      });
      if (timestamp - state.lastPositionBroadcast > 60) {
        activeMultiplayer.onPosition(
          state.player.x / canvas.width,
          state.player.y / canvas.height,
        );
        state.lastPositionBroadcast = timestamp;
      }
    }

    drawPlayer(ctx, state.player.x, state.player.y, ship, abilityActive);
    setGameState((previous) => ({ ...previous, score: state.score }));
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const currentShip = ships[shipRef.current];

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 bg-black">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 right-4 text-right font-mono text-white">
        <div className="text-2xl font-bold neon-text">SCORE: {Math.floor(gameState.score)}</div>
        {gameState.isPlaying && <div className="text-[10px] text-muted-foreground tracking-widest">{currentShip.name}</div>}
      </div>

      {gameState.isPlaying && (
        <button
          type="button"
          onClick={activateAbility}
          disabled={currentShip.id === "vanguard" || currentShip.id === "titan"}
          className={`absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border px-4 py-2 text-left font-mono transition-all ${abilityUi.active ? "border-primary bg-primary/30 shadow-[0_0_20px_rgba(124,58,237,0.45)]" : "border-white/20 bg-black/60"} disabled:cursor-default`}
        >
          {currentShip.id === "titan" ? <Shield className="h-5 w-5 text-amber-300" /> : <Sparkles className="h-5 w-5 text-cyan-300" />}
          <span><span className="block text-[10px] tracking-widest text-muted-foreground">{abilityUi.label}</span><span className="block text-xs text-white">{abilityUi.status}</span></span>
        </button>
      )}

       {!gameState.isPlaying && !gameState.gameOver && !multiplayer && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <h2 className="text-4xl font-display font-bold text-white mb-6 animate-pulse">READY COMMANDER?</h2>
          <Button onClick={startGame} size="lg" className="text-xl px-12 py-8 rounded-full bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform shadow-lg shadow-primary/40">
            <Play className="mr-3 h-8 w-8" /> LAUNCH MISSION
          </Button>
          <div className="mt-8 text-muted-foreground font-mono text-sm">CONTROLS: ARROW KEYS OR WASD · ABILITY: SPACE</div>
        </div>
      )}

      {gameState.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-destructive mb-5 neon-text">MISSION TERMINATED</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-mono w-full max-w-md mb-6">
            <Result label="FINAL SCORE" value={gameState.score.toLocaleString()} />
            <Result label="SECTOR REACHED" value={gameState.sector.toString().padStart(2, "0")} />
            <Result label="SURVIVAL TIME" value={`${gameState.survivalTime.toFixed(1)}s`} />
            <Result label="GEMS EARNED" value={scoreMutation.data ? `+${scoreMutation.data.gemsEarned}` : "..."} accent />
            <div className="col-span-2 border-t border-white/10 pt-3 flex justify-between text-cyan-300">
              <span>TOTAL GEMS</span>
              <span className="flex items-center gap-1.5 text-white"><Gem className="h-4 w-4" />{scoreMutation.data?.totalGems ?? "..."}</span>
            </div>
          </div>
          {scoreMutation.isPending && <p className="mb-4 text-primary animate-pulse font-mono text-xs">UPLOADING FLIGHT RECORD...</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={startGame} size="lg" className="font-mono"><RotateCcw className="mr-2 h-5 w-5" /> PLAY AGAIN</Button>
            <Button asChild variant="outline" size="lg" className="font-mono"><Link href="/hangar">HANGAR</Link></Button>
            <Button asChild variant="outline" size="lg" className="font-mono"><Link href="/leaderboard"><Trophy className="mr-2 h-5 w-5" /> LEADERBOARD</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}

function nextRandom(state: { rngSeed: number }) {
  state.rngSeed = (state.rngSeed * 1664525 + 1013904223) >>> 0;
  return state.rngSeed / 4_294_967_296;
}

function Result({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div><div className="text-[10px] tracking-widest text-muted-foreground mb-1">{label}</div><div className={accent ? "text-lg text-cyan-300" : "text-lg text-white"}>{value}</div></div>;
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  ctx.save();
  if (obstacle.type === "planet") {
    const gradient = ctx.createRadialGradient(obstacle.x - obstacle.size / 3, obstacle.y - obstacle.size / 3, obstacle.size / 10, obstacle.x, obstacle.y, obstacle.size);
    gradient.addColorStop(0, "#818cf8");
    gradient.addColorStop(0.6, "#4f46e5");
    gradient.addColorStop(1, "#312e81");
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(79, 70, 229, 0.4)";
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(obstacle.x, obstacle.y, obstacle.size * 1.5, obstacle.size * 0.4, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (obstacle.type === "asteroid") {
    ctx.fillStyle = "#475569";
    ctx.strokeStyle = "#1e293b";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = obstacle.size + Math.sin(angle * 3 + obstacle.x / 10) * obstacle.size * 0.3;
      const px = obstacle.x + Math.cos(angle) * radius;
      const py = obstacle.y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#94a3b8";
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, ship: typeof ships[ShipId], abilityActive: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = abilityActive ? 35 : 20;
  ctx.shadowColor = ship.color;
  const flameHeight = 15 + Math.random() * 10;
  const flameGradient = ctx.createLinearGradient(0, 0, -flameHeight, 0);
  flameGradient.addColorStop(0, ship.id === "titan" ? "#f59e0b" : "#f472b6");
  flameGradient.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.fillStyle = flameGradient;
  ctx.moveTo(-10, -5);
  ctx.lineTo(-10 - flameHeight, 0);
  ctx.lineTo(-10, 5);
  ctx.fill();

  if (ship.id === "titan") {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(24, 0); ctx.lineTo(-8, 15); ctx.lineTo(-15, 9); ctx.lineTo(-15, -9); ctx.lineTo(-8, -15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#78350f";
    ctx.fillRect(-2, -8, 14, 16);
  } else if (ship.id === "phantom") {
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.moveTo(28, 0); ctx.lineTo(-12, 12); ctx.lineTo(-3, 0); ctx.lineTo(-12, -12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#22d3ee";
    ctx.beginPath(); ctx.moveTo(-4, -13); ctx.lineTo(-15, -20); ctx.moveTo(-4, 13); ctx.lineTo(-15, 20); ctx.stroke();
  } else if (ship.id === "nova") {
    ctx.fillStyle = "#fdf2f8";
    ctx.beginPath();
    ctx.moveTo(28, 0); ctx.lineTo(-10, 12); ctx.lineTo(-4, 0); ctx.lineTo(-10, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f472b6";
    ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(-16, -16); ctx.lineTo(-10, 0); ctx.lineTo(-16, 16); ctx.lineTo(-3, 4); ctx.fill();
  } else {
    ctx.fillStyle = "#4f46e5";
    ctx.beginPath(); ctx.moveTo(-5, -15); ctx.lineTo(10, -5); ctx.lineTo(10, 5); ctx.lineTo(-5, 15); ctx.fill();
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(25, 0); ctx.lineTo(-10, 12); ctx.lineTo(-5, 0); ctx.lineTo(-10, -12); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = ship.id === "titan" ? "#fde68a" : "#0ea5e9";
  ctx.beginPath();
  ctx.ellipse(8, 0, ship.id === "titan" ? 7 : 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRemotePlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  username: string,
  playerNumber: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 27, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(19, 0);
  ctx.lineTo(-12, 11);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, -11);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = "bold 10px 'Share Tech Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${playerNumber}`, 0, 3);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "10px 'Share Tech Mono', monospace";
  ctx.fillText(username.toUpperCase().slice(0, 14), 0, -34);
  ctx.restore();
}

function drawDeathBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  progress: number,
) {
  const radius = 12 + progress * 48;
  const alpha = Math.max(0, 1 - progress);
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 26;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 + (1 - progress) * 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#fef3c7";
  ctx.lineWidth = 2;
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const innerRadius = radius * 0.55;
    const outerRadius = radius + 12 * (1 - progress);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    ctx.stroke();
  }
  ctx.restore();
}
