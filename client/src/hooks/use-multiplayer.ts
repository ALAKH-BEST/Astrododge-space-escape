import { useCallback, useEffect, useRef, useState } from "react";
import { apiBaseUrl } from "@/lib/apiBase";

export type MultiplayerPlayer = {
  id: string;
  username: string;
  color: string;
  ready: boolean;
  alive: boolean;
  x: number;
  y: number;
  score: number;
};

export type MultiplayerRoom = {
  roomId: string;
  hostId: string;
  localPlayerId: string;
  maxPlayers: number;
  phase: "lobby" | "running";
  seed: number;
  startedAt: number | null;
  players: MultiplayerPlayer[];
};

function websocketUrl() {
  const base = apiBaseUrl || window.location.origin;
  const url = new URL(base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  return url.toString();
}

export function useMultiplayer(username: string | undefined) {
  const socketRef = useRef<WebSocket | null>(null);
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!username) return;
    const socket = new WebSocket(websocketUrl());
    socketRef.current = socket;
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setError("Multiplayer link unavailable. Try again.");
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "room:update") {
        setError("");
        setRoom(message.room);
      } else if (message.type === "room:error") {
        setError(message.message);
      } else if (message.type === "player:update") {
        setRoom((current) =>
          current
            ? {
                ...current,
                players: current.players.map((player) =>
                  player.id === message.player.id ? message.player : player,
                ),
              }
            : current,
        );
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
      setRoom(null);
    };
  }, [username]);

  const send = useCallback((message: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createRoom = useCallback(() => send({ type: "room:create", username }), [send, username]);
  const joinRoom = useCallback(
    (roomId: string) => send({ type: "room:join", roomId, username }),
    [send, username],
  );
  const setReady = useCallback((ready: boolean) => send({ type: "room:ready", ready }), [send]);
  const sendPosition = useCallback(
    (x: number, y: number) => send({ type: "player:position", x, y }),
    [send],
  );
  const leaveRoom = useCallback(() => {
    socketRef.current?.close();
    setRoom(null);
  }, []);

  return { room, error, connected, createRoom, joinRoom, setReady, sendPosition, leaveRoom };
}
