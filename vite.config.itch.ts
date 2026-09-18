import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * itch.io serves the uploaded folder below a page URL, so every generated
 * asset reference must be relative to index.html rather than the domain root.
 * This config is intentionally separate from the server build.
 */
export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, "client"),
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "itch-build"),
    emptyOutDir: true,
  },
});