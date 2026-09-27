const fs = require("fs");
const path = require("path");

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const rootDir = path.resolve(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error("Error: .next/standalone folder not found. Run 'npm run build' first.");
  process.exit(1);
}

console.log("Packaging Hostinger standalone deployment...");

// 1. Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join(rootDir, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
console.log("- Copying static assets (.next/static)...");
copyDirRecursive(staticSrc, staticDest);

// 2. Copy public directory
const publicSrc = path.join(rootDir, "public");
const publicDest = path.join(standaloneDir, "public");
console.log("- Copying public folder...");
copyDirRecursive(publicSrc, publicDest);

// 3. Copy prisma directory (schema + migrations/seeds)
const prismaSrc = path.join(rootDir, "prisma");
const prismaDest = path.join(standaloneDir, "prisma");
console.log("- Copying prisma database...");
copyDirRecursive(prismaSrc, prismaDest);

// 4. Ensure .env exists in standalone
const envSrc = path.join(rootDir, ".env");
const envDest = path.join(standaloneDir, ".env");
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("- Copied .env file");
}

// 5. Create ready-to-upload ZIP archive (Windows only)
const zipPath = path.join(rootDir, "hostinger-deploy.zip");
if (process.platform === "win32") {
  try {
    const { execSync } = require("child_process");
    console.log("- Creating hostinger-deploy.zip archive...");
    execSync(
      `powershell -Command "Compress-Archive -Path '${standaloneDir}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: "inherit" }
    );
    console.log("✓ Created hostinger-deploy.zip successfully!");
  } catch (err) {
    console.warn("Notice: Could not automatically create ZIP archive (PowerShell required). Folder is still available at .next/standalone");
  }
}

console.log("\n Deployment folder ready!");
console.log("Location: " + standaloneDir);
console.log("ZIP Archive: " + zipPath);

