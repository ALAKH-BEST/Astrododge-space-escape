import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateAuthoritativeScore, issueRun, MAX_AUTHORITATIVE_SCORE, verifyRun } from "./run-authority";

process.env.SESSION_SECRET = "run-authority-test-secret";

test("scores are calculated from the signed server run, not client input", () => {
  const run = issueRun(42, "solo");
  const claims = verifyRun(run.runId, run.runToken, 42, run.startedAt + 10_000);
  assert.equal(claims.runId, run.runId);
  assert.equal(calculateAuthoritativeScore(claims.startedAt, claims.startedAt + 10_000), 120);
  assert.equal(calculateAuthoritativeScore(claims.startedAt, claims.startedAt + 60 * 60 * 1_000), MAX_AUTHORITATIVE_SCORE);
});

test("tampered or cross-user run tokens are rejected", () => {
  const run = issueRun(42, "solo");
  const [payload, signature] = run.runToken.split(".");
  assert(payload && signature);
  const replacement = signature.endsWith("a") ? "b" : "a";
  assert.throws(() => verifyRun(run.runId, `${payload}.${signature.slice(0, -1)}${replacement}`, 42));
  assert.throws(() => verifyRun(run.runId, run.runToken, 99));
});
