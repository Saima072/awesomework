import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The API runs separately on :3001 in development
    proxy: { "/api": "http://localhost:3001" },
  },
});
