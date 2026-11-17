import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  define: { __BASE_PATH__: JSON.stringify("/") },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { outDir: "out", emptyOutDir: true },
});
