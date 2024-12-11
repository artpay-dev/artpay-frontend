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
        target: "https://staging2.artpay.art",
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: (path) => {
          return path;
        }
      }
    }
    /*https: {
      key: fs.readFileSync("./local_certs/artpay.art-key.pem"),
      cert: fs.readFileSync("./local_certs/artpay.art.pem")
    }*/
  }
});
