import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" makes the build work from any sub-folder (GitHub Pages, school servers, file hosting).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2020",
    // Stable vendor chunks: browsers cache them across deployments, so updates to our code download very little.
    rollupOptions: { output: { manualChunks: { react: ["react", "react-dom"], motion: ["framer-motion"], i18n: ["i18next", "react-i18next"], icons: ["lucide-react"] } } },
  },
});
