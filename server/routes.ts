import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { ProgressionError, storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isShipId } from "@shared/ships";
import {
  calculateAuthoritativeScore,
  issueRun,
  RunAuthorityError,
  verifyRun,
} from "./run-authority";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  app.get(api.scores.list.path, async (req, res) => {
    const topScores = await storage.getTopScores();
    res.json(topScores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send();
      }

      const input = api.scores.create.input.parse(req.body);
      const claims = verifyRun(input.runId, input.runToken, req.user!.id);
      const result = await storage.createScore({
        userId: req.user!.id,
        runId: claims.runId,
        score: calculateAuthoritativeScore(claims.startedAt),
      });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof RunAuthorityError || error instanceof z.ZodError) {
        return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid score submission" });
      }
      throw error;
    }
  });

  app.post(api.runs.start.path, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send();
      const { mode } = api.runs.start.input.parse(req.body);
      res.status(201).json(issueRun(req.user!.id, mode));
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof RunAuthorityError) {
        return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid run" });
      }
      next(error);
    }
  });

  app.get(api.progression.get.path, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send();
      res.json(await storage.getProgression(req.user!.id));
    } catch (error) {
      next(error);
    }
  });

  app.post(api.progression.purchase.path, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send();
      const { shipId } = api.progression.purchase.input.parse(req.body);
      res.json(await storage.purchaseShip(req.user!.id, shipId));
    } catch (error) {
      if (error instanceof ProgressionError || error instanceof z.ZodError) {
        return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid ship" });
      }
      next(error);
    }
  });

  app.post(api.progression.equip.path, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send();
      const { shipId } = api.progression.equip.input.parse(req.body);
      if (!isShipId(shipId)) return res.status(400).json({ message: "Unknown ship" });
      res.json(await storage.equipShip(req.user!.id, shipId));
    } catch (error) {
      if (error instanceof ProgressionError || error instanceof z.ZodError) {
        return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid ship" });
      }
      next(error);
    }
  });

  return httpServer;
}
