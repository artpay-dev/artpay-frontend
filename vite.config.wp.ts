import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

import usePHP from "vite-plugin-php";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const bundleHooks: PluginOption = {
  closeBundle: () => {
    return new Promise((resolve) => {
      fs.rename(path.resolve(__dirname, "wp/theme/static/index.php"), path.resolve(__dirname, "wp/theme/index.php"), () => {
        console.log("------------ closeBundle ----------------");
        resolve();
      });
    });
  }
};
export default defineConfig({
  plugins: [react(),
    // eslint-disable-next-line react-hooks/rules-of-hooks

    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePHP({
      entry: ["index.php"],
      cleanup: {
        dev: true,
        build: true
      }
    }),
    bundleHooks
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "wp/theme/static",
    //assetsDir: "wp-content/themes/artpay-react/static/assets",
    emptyOutDir: true,
    minify: true
  },
  optimizeDeps: {
    include: ["*.js", "*.jsx", "*.ts", "*.tsx", "*.css"]
  },
  base: "wp-content/themes/artpay-react/static",
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
