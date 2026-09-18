#!/usr/bin/env bash
set -euo pipefail

# Keep post-merge setup deterministic and non-interactive.
npm ci --no-audit --no-fund
npm run check
npm test
npm run build