import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    proxy: {
      "/wp-json": {
        target: "https://artpay.art",
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: (path) => {
          return path;
        }
      }
    }
  }
});
