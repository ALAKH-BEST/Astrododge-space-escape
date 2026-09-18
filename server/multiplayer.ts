import type { Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { randomBytes } from "node:crypto";

const MAX_PLAYERS = 4;
const rooms = new Map<string, Room>();

type Player = { id: string; username: string; color: string; ready: boolean; alive: boolean; x: number; y: number; score: number };
type Room = { roomId: string; hostId: string; phase: "lobby" | "running"; players: Map<string, Player>; sockets: Map<string, WebSocket>; createdAt: number };

const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399"];

function roomId() { return randomBytes(3).toString("hex").toUpperCase(); }
function send(socket: WebSocket, payload: unknown) { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload)); }
function snapshot(room: Room, localPlayerId: string) { return { roomId: room.roomId, localPlayerId, hostId: room.hostId, phase: room.phase, maxPlayers: MAX_PLAYERS, players: [...room.players.values()] }; }
function broadcast(room: Room) { for (const [id, socket] of room.sockets) send(socket, { type: "room:update", room: snapshot(room, id) }); }
function error(socket: WebSocket, message: string) { send(socket, { type: "room:error", message }); }

function startRoom(room: Room) { room.phase = "running"; for (const player of room.players.values()) { player.alive = true; player.score = 0; } broadcast(room); }
function removePlayer(room: Room, id: string) { room.players.delete(id); room.sockets.delete(id); if (room.players.size === 0) rooms.delete(room.roomId); else { if (room.hostId === id) room.hostId = room.players.keys().next().value as string; broadcast(room); } }

export function setupMultiplayer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (socket) => {
    let room: Room | undefined;
    let playerId = randomBytes(8).toString("hex");

    socket.on("message", (raw) => {
      let message: any;
      try { message = JSON.parse(raw.toString()); } catch { return error(socket, "Invalid message."); }
      switch (message.type) {
        case "room:create": {
          if (room) return error(socket, "Already in a room.");
          const id = roomId();
          room = { roomId: id, hostId: playerId, phase: "lobby", players: new Map(), sockets: new Map(), createdAt: Date.now() };
          const player: Player = { id: playerId, username: String(message.username || "Commander").slice(0, 24), color: COLORS[0], ready: false, alive: true, x: 0.5, y: 0.5, score: 0 };
          room.players.set(playerId, player); room.sockets.set(playerId, socket); rooms.set(id, room); broadcast(room); break;
        }
        case "room:join": {
          if (room) return error(socket, "Already in a room.");
          const target = rooms.get(String(message.roomId || "").toUpperCase());
          if (!target) return error(socket, "Room not found.");
          if (target.phase !== "lobby") return error(socket, "That room is already running.");
          if (target.players.size >= MAX_PLAYERS) return error(socket, "Room is full.");
          room = target;
          const player: Player = { id: playerId, username: String(message.username || "Commander").slice(0, 24), color: COLORS[target.players.size % COLORS.length], ready: false, alive: true, x: 0.5, y: 0.5, score: 0 };
          target.players.set(playerId, player); target.sockets.set(playerId, socket); broadcast(target); break;
        }
        case "room:ready": {
          if (!room) return error(socket, "Not in a room.");
          const player = room.players.get(playerId); if (!player || room.phase !== "lobby") return;
          player.ready = Boolean(message.ready); broadcast(room);
          if (room.players.size > 0 && room.players.size === [...room.players.values()].filter((p) => p.ready).length) startRoom(room);
          break;
        }
        case "player:position": {
          if (!room || room.phase !== "running") return;
          const player = room.players.get(playerId); if (!player || !player.alive) return;
          player.x = Math.max(0, Math.min(1, Number(message.x) || 0)); player.y = Math.max(0, Math.min(1, Number(message.y) || 0));
          player.score = Math.min(1000000, Math.max(0, Math.floor((Date.now() - room.createdAt) / 1000) * 12));
          for (const [id, socket] of room.sockets) send(socket, { type: "player:update", player });
          break;
        }
        default: error(socket, "Unknown message type.");
      }
    });
    socket.on("close", () => { if (room) removePlayer(room, playerId); });
  });
  return wss;
}
