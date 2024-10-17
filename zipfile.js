import fs from "fs";
import archiver from "archiver";

async function zipDirectory(sourceDir, outPath) {
  const output = fs.createWriteStream(outPath);
  const archive = archiver("zip", { zlib: { level: 9 } }); // Compression level: 0 (fastest) - 9 (highest)

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
