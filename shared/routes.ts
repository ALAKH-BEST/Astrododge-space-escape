import { z } from "zod";
import { insertUserSchema, users, scores } from "./schema";

const shipIdSchema = z.enum(["vanguard", "phantom", "titan", "nova"]);

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: insertUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.void(),
      },
    },
  },
  scores: {
    list: {
      method: "GET" as const,
      path: "/api/scores",
      responses: {
        200: z.array(
          z.object({
            id: z.number(),
            score: z.number(),
            username: z.string(),
          })
        ),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/scores",
      input: z.object({
        runId: z.string().uuid(),
        runToken: z.string().min(1),
      }).strict(),
      responses: {
        201: z.object({
          score: z.custom<typeof scores.$inferSelect>(),
          gemsEarned: z.number(),
          totalGems: z.number(),
          duplicate: z.boolean(),
        }),
        401: z.void(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  runs: {
    start: {
      method: "POST" as const,
      path: "/api/runs/start",
      input: z.object({
        mode: z.enum(["solo", "multiplayer"]),
      }).strict(),
      responses: {
        201: z.object({
          runId: z.string().uuid(),
          runToken: z.string().min(1),
          startedAt: z.number().int(),
        }),
        401: z.void(),
      },
    },
  },
  progression: {
    get: {
      method: "GET" as const,
      path: "/api/progression",
      responses: {
        200: z.object({
          gems: z.number(),
          ownedShips: z.array(shipIdSchema),
          equippedShip: shipIdSchema,
        }),
        401: z.void(),
      },
    },
    purchase: {
      method: "POST" as const,
      path: "/api/progression/purchase",
      input: z.object({ shipId: shipIdSchema }),
      responses: {
        200: z.object({
          gems: z.number(),
          ownedShips: z.array(shipIdSchema),
          equippedShip: shipIdSchema,
        }),
        400: z.object({ message: z.string() }),
        401: z.void(),
      },
    },
    equip: {
      method: "POST" as const,
      path: "/api/progression/equip",
      input: z.object({ shipId: shipIdSchema }),
      responses: {
        200: z.object({
          gems: z.number(),
          ownedShips: z.array(shipIdSchema),
          equippedShip: shipIdSchema,
        }),
        400: z.object({ message: z.string() }),
        401: z.void(),
      },
    },
  },
};
