import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// Prepare package.json for dist
// Remove dist/ prefix since it's now root
pkg.main = pkg.main?.replace("dist/", "./");
pkg.module = pkg.module?.replace("dist/", "./");
pkg.types = pkg.types?.replace("dist/", "./");

// Remove development specific fields
delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.files; // dist is the root now

// Write to dist
fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify(pkg, null, 2));

// Copy other metadata
for (const file of ["README.md", "LICENSE"]) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, file));
  }
}

console.log("✅ Prepared dist/ package successfully.");
