import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
//import * as fs_extra from "fs-extra";
import archiver from "archiver";


import usePHP from "vite-plugin-php";

async function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
  console.log("zipDirectory", sourceDir, outPath);
  const output = fs.createWriteStream(outPath);
  const archive = archiver("zip", { zlib: { level: 9 } }); // Compression level: 0 (fastest) - 9 (highest)
  console.log("output", output, archive);

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("end", () => console.log("Data has been drained"));

    archive.on("warning", (err) => {
      console.warn("Archive warning", err);
      if (err && err?.code === "ENOENT") {
        console.warn(err);
      } else if (err) {
        reject(err);
      }
    });

    archive.on("error", (err) => {
      console.error("Archive error", err);
      if (err) {
        console.error("Archive error:", err);
        reject(err);
      }
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const bundleHooks: PluginOption = {
  closeBundle: () => {
    return new Promise((resolve, reject) => {
      const themeDir = path.resolve(__dirname, "wp/theme");
      const themeFile = path.resolve(__dirname, "wp/artpay_theme.zip");

      fs.rename(path.resolve(__dirname, "wp/theme/static/index.php"), path.resolve(__dirname, "wp/theme/index.php"), () => {
        zipDirectory(themeDir, themeFile).then(() => {
          resolve();
        }).catch(() => {
          reject();
        });
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
