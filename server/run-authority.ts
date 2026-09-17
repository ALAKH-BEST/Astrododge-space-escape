import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const SERVER_SCORE_RATE = 12;
export const MAX_RUN_SECONDS = 15 * 60;
export const MAX_AUTHORITATIVE_SCORE = SERVER_SCORE_RATE * MAX_RUN_SECONDS;

export type RunMode = "solo" | "multiplayer";

type RunClaims = {
  version: 1;
  runId: string;
  userId: number;
  mode: RunMode;
  startedAt: number;
};

export class RunAuthorityError extends Error {}

function getSigningSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new RunAuthorityError("Server run signing is not configured");
  }
  return secret;
}

function sign(encodedClaims: string) {
  return createHmac("sha256", getSigningSecret()).update(encodedClaims).digest("base64url");
}

export function issueRun(userId: number, mode: RunMode) {
  const claims: RunClaims = {
    version: 1,
    runId: randomUUID(),
    userId,
    mode,
    startedAt: Date.now(),
  };
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return {
    runId: claims.runId,
    runToken: `${encodedClaims}.${sign(encodedClaims)}`,
    startedAt: claims.startedAt,
  };
}

export function verifyRun(runId: string, runToken: string, userId: number, now = Date.now()) {
  const [encodedClaims, providedSignature] = runToken.split(".");
  if (!encodedClaims || !providedSignature) {
    throw new RunAuthorityError("Invalid run token");
  }

  const expectedSignature = sign(encodedClaims);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new RunAuthorityError("Invalid run token");
  }

  let claims: RunClaims;
  try {
    claims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8")) as RunClaims;
  } catch {
    throw new RunAuthorityError("Invalid run token");
  }

  if (
    claims.version !== 1 ||
    claims.runId !== runId ||
    claims.userId !== userId ||
    (claims.mode !== "solo" && claims.mode !== "multiplayer") ||
    !Number.isInteger(claims.startedAt) ||
    claims.startedAt > now + 30_000
  ) {
    throw new RunAuthorityError("Invalid run token");
  }

  return claims;
}

export function calculateAuthoritativeScore(startedAt: number, endedAt = Date.now()) {
  const elapsedSeconds = Math.max(0, Math.min(MAX_RUN_SECONDS, (endedAt - startedAt) / 1000));
  return Math.min(MAX_AUTHORITATIVE_SCORE, Math.floor(elapsedSeconds * SERVER_SCORE_RATE));
}
