import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { WebSocket } from "ws";
import { setupMultiplayer } from "./multiplayer";

type Player = { id: string; username: string; alive: boolean; x: number; y: number; score: number };
type MultiplayerMessage = { type: string; room?: { roomId: string; localPlayerId: string; phase: "lobby" | "running"; players: Player[] }; player?: Player };
function send(socket: WebSocket, message: object) { socket.send(JSON.stringify(message)); }
function nextMessage(socket: WebSocket, predicate: (message: MultiplayerMessage) => boolean, timeoutMs = 1_000) {
  return new Promise<MultiplayerMessage>((resolve, reject) => {
    const timer = setTimeout(() => { socket.off("message", onMessage); reject(new Error(`Timed out waiting for a matching WebSocket message after ${timeoutMs}ms.`)); }, timeoutMs);
    const onMessage = (data: WebSocket.RawData) => { const message = JSON.parse(data.toString()) as MultiplayerMessage; if (!predicate(message)) return; clearTimeout(timer); socket.off("message", onMessage); resolve(message); };
    socket.on("message", onMessage);
  });
}
async function openSocket(url: string) { const socket = new WebSocket(url); await new Promise<void>((resolve, reject) => { socket.once("open", resolve); socket.once("error", reject); }); return socket; }
async function closeSocket(socket: WebSocket) { if (socket.readyState === WebSocket.CLOSED) return; await new Promise<void>((resolve) => { socket.once("close", resolve); socket.close(); }); }

test("rejects client score and alive tampering in multiplayer", async () => {
  const server = createServer(); setupMultiplayer(server); await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); assert(address && typeof address !== "string');
  const url = `ws://127.0.0.1:${address.port}/ws`; const playerOne = await openSocket(url); const playerTwo = await openSocket(url);
  try {
    const playerOneRoomUpdate = nextMessage(playerOne, (message) => message.type === "room:update"); send(playerOne, { type: "room:create", username: "Pilot One" }); const createdRoom = (await playerOneRoomUpdate).room; assert(createdRoom);
    const playerOneJoined = nextMessage(playerOne, (message) => message.type === "room:update" && message.room?.players.length === 2);
    const playerTwoJoined = nextMessage(playerTwo, (message) => message.type === "room:update" && message.room?.players.length === 2);
    send(playerTwo, { type: "room:join", roomId: createdRoom.roomId, username: "Pilot Two" }); await Promise.all([playerOneJoined, playerTwoJoined]);
    const lobbyForPlayerOne = nextMessage(playerOne, (message) => message.type === "room:update" && message.room?.phase === "lobby"); const lobbyForPlayerTwo = nextMessage(playerTwo, (message) => message.type === "room:update" && message.room?.phase === "lobby"); send(playerOne, { type: "room:ready", ready: true }); await Promise.all([lobbyForPlayerOne, lobbyForPlayerTwo]);
    const runningForPlayerOne = nextMessage(playerOne, (message) => message.type === "room:update" && message.room?.phase === "running"); const runningForPlayerTwo = nextMessage(playerTwo, (message) => message.type === "room:update" && message.room?.phase === "running"); send(playerTwo, { type: "room:ready", ready: true }); await Promise.all([runningForPlayerOne, runningForPlayerTwo]);
    const scoreForPlayerOne = nextMessage(playerOne, (message) => message.type === "player:update" && message.player?.username === "Pilot One"); const scoreForPlayerTwo = nextMessage(playerTwo, (message) => message.type === "player:update" && message.player?.username === "Pilot One"); const tamperRejected = nextMessage(playerOne, (message) => message.type === "room:error" && message.player === undefined);
    send(playerOne, { type: "player:position", x: 0.3, y: 0.4, score: 999_999_999, alive: false }); const [scoreUpdateOne, scoreUpdateTwo] = await Promise.all([scoreForPlayerOne, scoreForPlayerTwo]); assert.equal(scoreUpdateOne.player?.username, "Pilot One"); assert.equal(scoreUpdateTwo.player?.username, "Pilot One"); assert.equal(scoreUpdateOne.player?.alive, true); assert.equal(scoreUpdateTwo.player?.alive, true); assert.ok((scoreUpdateOne.player?.score ?? 0) < 999_999_999); assert.ok((scoreUpdateTwo.player?.score ?? 0) < 999_999_999); assert.equal(scoreUpdateOne.player?.alive, true); await tamperRejected;
    const deathForPlayerOne = nextMessage(playerOne, (message) => message.type === "player:update" && message.player?.username === "Pilot One" && message.player?.alive === false, 2_500); const deathForPlayerTwo = nextMessage(playerTwo, (message) => message.type === "player:update" && message.player?.username === "Pilot One" && message.player?.alive === false, 2_500); const [deathUpdateOne, deathUpdateTwo] = await Promise.all([deathForPlayerOne, deathForPlayerTwo]); assert.ok((deathUpdateOne.player?.score ?? 0) < 999_999_999); assert.ok((deathUpdateTwo.player?.score ?? 0) < 999_999_999);
  } finally { await Promise.all([closeSocket(playerOne), closeSocket(playerTwo)]); await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
});
