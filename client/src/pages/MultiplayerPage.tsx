import { useState } from "react";
import { Copy, LogOut, Radio, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-auth";
import { useMultiplayer } from "@/hooks/use-multiplayer";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GameLayout } from "@/components/layout/GameLayout";

export default function MultiplayerPage() {
  const { data: user } = useUser();
  const multiplayer = useMultiplayer(user?.username);
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    if (!multiplayer.room) return;
    await navigator.clipboard.writeText(multiplayer.room.roomId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <GameLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        {!multiplayer.room ? (
          <div className="mx-auto grid max-w-4xl gap-6 pt-10 md:grid-cols-2">
            <RoomEntryCard title="CREATE A SQUADRON" description="Open a private asteroid field for up to four commanders." buttonLabel="CREATE ROOM" onSubmit={multiplayer.createRoom} />
            <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
              <CardHeader><CardTitle className="font-display tracking-wider text-white">JOIN A SQUADRON</CardTitle><CardDescription className="font-mono text-muted-foreground">Enter the six-character room code from your host.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase().slice(0, 6))} placeholder="E.G. 7KQ2MX" className="h-12 border-white/10 bg-background/60 text-center font-mono text-lg tracking-[0.35em]" maxLength={6} />
                <Button className="h-12 w-full font-display tracking-widest" disabled={!multiplayer.connected || roomCode.length < 6} onClick={() => multiplayer.joinRoom(roomCode)}><Users className="mr-2 h-5 w-5" /> JOIN ROOM</Button>
              </CardContent>
            </Card>
          </div>
        ) : multiplayer.room.phase === "running" ? (
          <RunningRoom room={multiplayer.room} sendPosition={multiplayer.sendPosition} />
        ) : (
          <Lobby room={multiplayer.room} copied={copied} onCopy={copyRoomCode} onReady={() => { const player = multiplayer.room?.players.find((item) => item.id === multiplayer.room?.localPlayerId); multiplayer.setReady(!player?.ready); }} onLeave={multiplayer.leaveRoom} />
        )}
        {!multiplayer.connected && !multiplayer.room && <div className="flex items-center justify-center gap-2 text-xs font-mono text-destructive"><WifiOff className="h-4 w-4" /> MULTIPLAYER LINK OFFLINE</div>}
        {multiplayer.error && <p className="text-center font-mono text-sm text-destructive">{multiplayer.error}</p>}
      </div>
    </GameLayout>
  );
}

function RoomEntryCard({ title, description, buttonLabel, onSubmit }: { title: string; description: string; buttonLabel: string; onSubmit: () => void }) {
  return <Card className="border-primary/30 bg-card/50 shadow-2xl shadow-primary/10 backdrop-blur-xl"><CardHeader><CardTitle className="font-display tracking-wider text-white">{title}</CardTitle><CardDescription className="font-mono text-muted-foreground">{description}</CardDescription></CardHeader><CardContent><Button className="h-12 w-full font-display tracking-widest" onClick={onSubmit}><Radio className="mr-2 h-5 w-5" /> {buttonLabel}</Button></CardContent></Card>;
}

function Lobby({ room, copied, onCopy, onReady, onLeave }: { room: NonNullable<ReturnType<typeof useMultiplayer>["room"]>; copied: boolean; onCopy: () => void; onReady: () => void; onLeave: () => void }) {
  const localPlayer = room.players.find((player) => player.id === room.localPlayerId);
  const allReady = room.players.length > 0 && room.players.every((player) => player.ready);
  return <Card className="mx-auto mt-8 max-w-3xl border-primary/30 bg-card/60 shadow-2xl shadow-primary/10 backdrop-blur-xl"><CardHeader className="border-b border-white/10"><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle className="font-display tracking-widest text-white">SQUADRON ASSEMBLY</CardTitle><CardDescription className="mt-2 font-mono text-muted-foreground">All commanders must be ready before Sector 7 unlocks.</CardDescription></div><div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-center"><div className="text-[10px] font-mono tracking-widest text-muted-foreground">ROOM CODE</div><div className="flex items-center gap-2 font-display text-xl tracking-[0.25em] text-primary">{room.roomId}<button type="button" onClick={onCopy} title="Copy room code" className="text-muted-foreground hover:text-white"><Copy className="h-4 w-4" /></button></div>{copied && <div className="text-[9px] font-mono text-emerald-400">COPIED</div>}</div></div></CardHeader><CardContent className="space-y-6 pt-6"><div className="grid gap-3 sm:grid-cols-2">{room.players.map((player, index) => <div key={player.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-background/40 px-4 py-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs" style={{ borderColor: player.color, color: player.color }}>{index + 1}</span><div><div className="font-mono text-sm text-white">{player.username}</div><div className="text-[10px] font-mono tracking-widest text-muted-foreground">{player.id === room.hostId ? "SQUADRON LEAD" : "WINGMAN"}</div></div></div><span className={`rounded px-2 py-1 text-[10px] font-mono tracking-widest ${player.ready ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>{player.ready ? "READY" : "STANDBY"}</span></div>)}{Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => <div key={`empty-${index}`} className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 px-4 py-3 text-muted-foreground"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 font-mono text-xs">+</span><span className="text-xs font-mono tracking-widest">AWAITING WINGMAN</span></div>)}</div><Button onClick={onReady} className={`h-14 w-full font-display text-lg tracking-[0.2em] transition-all ${localPlayer?.ready ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/30" : "bg-gradient-to-r from-primary to-accent hover:scale-[1.01]"}`}>{localPlayer?.ready ? "READY — WAITING FOR SQUADRON" : "I AM READY"}</Button><div className={`flex items-center justify-center gap-2 text-center text-xs font-mono tracking-widest ${allReady ? "text-emerald-300" : "text-muted-foreground"}`}>{allReady ? <Wifi className="h-4 w-4" /> : <Users className="h-4 w-4" />}{allReady ? "ALL COMMANDERS READY — LAUNCHING SECTOR" : `${room.players.filter((player) => player.ready).length}/${room.players.length} COMMANDERS READY`}</div><Button variant="ghost" onClick={onLeave} className="mx-auto flex font-mono text-xs text-muted-foreground hover:text-destructive"><LogOut className="mr-2 h-4 w-4" /> LEAVE ROOM</Button></CardContent></Card>;
}

function RunningRoom({ room, sendPosition }: { room: NonNullable<ReturnType<typeof useMultiplayer>["room"]>; sendPosition: (x: number, y: number) => void }) {
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-3xl tracking-wider text-white">SECTOR 7: SQUADRON RUN</h1><p className="font-mono text-xs tracking-widest text-emerald-300">ALL SHIPS DEPLOYED · ROOM {room.roomId}</p></div><div className="flex items-center gap-2 text-xs font-mono text-muted-foreground"><Users className="h-4 w-4 text-primary" /> {room.players.length}/4 IN FIELD</div></div><GameCanvas multiplayer={{ room, onPosition: sendPosition }} /><div className="flex flex-wrap gap-2">{room.players.map((player) => <div key={player.id} className="rounded border border-white/10 bg-card/40 px-3 py-2 text-xs font-mono" style={{ color: player.color }}><span className={player.alive ? "" : "line-through opacity-50"}>{player.username}</span>{" · "}{player.alive ? player.score.toLocaleString() : "ELIMINATED"}</div>)}</div></div>;
}