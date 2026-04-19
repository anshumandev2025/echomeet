import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   https: {
  //     key: fs.readFileSync("../cert.key"),
  //     cert: fs.readFileSync("../cert.crt"),
  //   },
  //   host: "0.0.0.0",
  //   port: 5173,
  // },
});
