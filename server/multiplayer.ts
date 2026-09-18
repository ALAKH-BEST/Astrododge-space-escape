import type { Server } from "http";
import { randomInt } from "crypto";
import { WebSocket, WebSocketServer } from "ws";
import {
  calculateAuthoritativeScore,
} from "./run-authority";

const MAX_PLAYERS = 4;
const ROOM_CODE_LENGTH = 6;
const PLAYER_COLORS = ["#22d3ee", "#f472b6", "#facc15", "#a78bfa"];
const PLAYER_HEARTBEAT_TIMEOUT_MS = 1_200;
const MAX_POSITION_DELTA_PER_SECOND = 2.5;

type RoomPlayer = {
  id: string;
  username: string;
  color: string;
  ready: boolean;
  alive: boolean;
  x: number;
  y: number;
  score: number;
  lastSeenAt: number;
};

type Room = {
  id: string;
  hostId: string;
  seed: number;
  phase: "lobby" | "running";
  startedAt: number | null;
  players: Map<string, { socket: WebSocket; player: RoomPlayer }>;
};

const rooms = new Map<string, Room>();
const connections = new Map<WebSocket, { roomId: string; playerId: string }>();

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: ROOM_CODE_LENGTH }, () => alphabet[randomInt(alphabet.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function createPlayerId() {
  return `${Date.now().toString(36)}-${randomInt(1_000_000).toString(36)}`;
}

function send(socket: WebSocket, message: unknown) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function publicRoom(room: Room, localPlayerId: string) {
  return {
    roomId: room.id,
    hostId: room.hostId,
    localPlayerId,
    maxPlayers: MAX_PLAYERS,
    phase: room.phase,
    seed: room.seed,
    startedAt: room.startedAt,
    players: Array.from(room.players.values()).map(({ player }) => player),
  };
}

function broadcastRoom(room: Room) {
  room.players.forEach(({ socket, player }) => {
    send(socket, { type: "room:update", room: publicRoom(room, player.id) });
  });
}

function broadcastPlayer(room: Room, player: RoomPlayer) {
  room.players.forEach(({ socket }) => {
    send(socket, { type: "player:update", player });
  });
}

function advanceRoom(room: Room, now: number) {
  const startedAt = room.startedAt;
  if (room.phase !== "running" || !startedAt) return;

  room.players.forEach(({ player }) => {
    if (player.alive && now - player.lastSeenAt > PLAYER_HEARTBEAT_TIMEOUT_MS) {
      player.alive = false;
      player.score = calculateAuthoritativeScore(startedAt, player.lastSeenAt);
      broadcastPlayer(room, player);
      return;
    }

    if (player.alive) {
      const nextScore = calculateAuthoritativeScore(startedAt, now);
      if (nextScore !== player.score) {
        player.score = nextScore;
        broadcastPlayer(room, player);
      }
    }
  });
}

function leaveRoom(socket: WebSocket) {
  const connection = connections.get(socket);
  if (!connection) return;
  connections.delete(socket);

  const room = rooms.get(connection.roomId);
  if (!room) return;
  room.players.delete(connection.playerId);

  if (room.players.size === 0) {
    rooms.delete(room.id);
    return;
  }

  if (room.hostId === connection.playerId) {
    room.hostId = room.players.keys().next().value as string;
  }
  if (room.phase === "running") {
    room.phase = "lobby";
    room.startedAt = null;
    room.players.forEach((entry) => {
      entry.player.ready = false;
    });
  }
  broadcastRoom(room);
}

function joinRoom(socket: WebSocket, username: string, roomId: string, create: boolean) {
  const normalizedUsername = username.trim().slice(0, 24);
  if (!normalizedUsername) return send(socket, { type: "room:error", message: "Commander name is required." });

  const id = create ? createRoomCode() : roomId.trim().toUpperCase();
  let room = rooms.get(id);
  if (!room && !create) return send(socket, { type: "room:error", message: "That room no longer exists." });
  if (room && room.players.size >= MAX_PLAYERS) return send(socket, { type: "room:error", message: "That room is full." });
  if (room && room.phase === "running") return send(socket, { type: "room:error", message: "That mission has already started." });

  if (connections.has(socket)) leaveRoom(socket);

  if (!room) {
    room = {
      id,
      hostId: "",
      seed: randomInt(1, 2_147_483_647),
      phase: "lobby",
      startedAt: null,
      players: new Map(),
    };
  }

  const playerId = createPlayerId();
  const player: RoomPlayer = {
    id: playerId,
    username: normalizedUsername,
    color: PLAYER_COLORS[room.players.size] ?? PLAYER_COLORS[0],
    ready: false,
    alive: true,
    x: 0.2,
    y: 0.5,
    score: 0,
    lastSeenAt: Date.now(),
  };
  room.players.set(playerId, { socket, player });
  if (!room.hostId) room.hostId = playerId;
  rooms.set(room.id, room);
  connections.set(socket, { roomId: room.id, playerId });
  broadcastRoom(room);
}

function handleMessage(socket: WebSocket, raw: string) {
  let message: any;
  try {
    message = JSON.parse(raw);
  } catch {
    return send(socket, { type: "room:error", message: "Invalid multiplayer message." });
  }
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return send(socket, { type: "room:error", message: "Invalid multiplayer message." });
  }

  if (message.type === "room:create") return joinRoom(socket, message.username, "", true);
  if (message.type === "room:join") return joinRoom(socket, message.username, message.roomId, false);

  const connection = connections.get(socket);
  if (!connection) return send(socket, { type: "room:error", message: "Create or join a room first." });
  const room = rooms.get(connection.roomId);
  const entry = room?.players.get(connection.playerId);
  if (!room || !entry) return;

  if (message.type === "room:ready") {
    entry.player.ready = Boolean(message.ready);
    const allReady = room.players.size > 0 && Array.from(room.players.values()).every(({ player }) => player.ready);
    if (allReady) {
      const startedAt = Date.now();
      room.players.forEach(({ player }) => {
        player.alive = true;
        player.score = 0;
        player.lastSeenAt = startedAt;
        player.x = 0.2;
        player.y = 0.5;
      });
      room.phase = "running";
      room.startedAt = startedAt;
    }
    broadcastRoom(room);
    return;
  }

  if (message.type === "player:position" && room.phase === "running") {
    const now = Date.now();
    advanceRoom(room, now);
    if (!entry.player.alive) return;
    const x = Number(message.x);
    const y = Number(message.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return send(socket, { type: "room:error", message: "Invalid ship position." });
    }

    const elapsedSeconds = Math.max(0.05, (now - entry.player.lastSeenAt) / 1000);
    const maxDelta = MAX_POSITION_DELTA_PER_SECOND * elapsedSeconds;
    entry.player.x = Math.max(
      Math.max(0, entry.player.x - maxDelta),
      Math.min(1, Math.min(entry.player.x + maxDelta, x)),
    );
    entry.player.y = Math.max(
      Math.max(0, entry.player.y - maxDelta),
      Math.min(1, Math.min(entry.player.y + maxDelta, y)),
    );
    entry.player.lastSeenAt = now;
    entry.player.score = calculateAuthoritativeScore(room.startedAt ?? now, now);

    if ("score" in message || "alive" in message) {
      send(socket, {
        type: "room:error",
        message: "Score and elimination state are server-authoritative.",
      });
    }
    broadcastPlayer(room, entry.player);
  }
}

export function setupMultiplayer(server: Server) {
  const webSocketServer = new WebSocketServer({ server, path: "/ws" });
  const ticker = setInterval(() => {
    const now = Date.now();
    rooms.forEach((room) => advanceRoom(room, now));
  }, 250);
  ticker.unref();
  server.once("close", () => clearInterval(ticker));
  webSocketServer.on("connection", (socket) => {
    socket.on("message", (message) => handleMessage(socket, message.toString()));
    socket.on("close", () => leaveRoom(socket));
    socket.on("error", () => leaveRoom(socket));
  });
}
