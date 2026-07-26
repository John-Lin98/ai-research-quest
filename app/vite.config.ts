import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  const configuredBase = env.VITE_BASE_PATH?.trim();
  const base = configuredBase
    ? configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`
    : "./";

  return {
    base,
    plugins: [react()],
    publicDir: "../public",
  };
});
