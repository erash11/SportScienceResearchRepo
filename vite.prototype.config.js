import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "prototypes/ask-library",
  publicDir: "../../public",
  base: "./",
  build: {
    outDir: "../../dist-prototype",
    emptyOutDir: true,
  },
});
