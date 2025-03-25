import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
//import fs from "fs";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react(), tailwindcss()],

  /*transformIndexHtml: (html) => html.replace("%VITE_STRIPE_KEY%", process.env.VITE_STRIPE_KEY),*/
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/wp-json": {
        target: process.env.VITE_SERVER_URL,
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: (path) => {
          return path;
        },
      },
    },
    /*https: {
      key: fs.readFileSync("./local_certs/artpay.art-key.pem"),
      cert: fs.readFileSync("./local_certs/artpay.art.pem")
    }*/
  },
});
