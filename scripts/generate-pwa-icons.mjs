import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

async function generateIcons() {
  const sourceIcon = path.join(publicDir, "icon.png");
  const fallbackSource = path.join(publicDir, "logo.png");
  const inputImage = fs.existsSync(sourceIcon) ? sourceIcon : fallbackSource;

  console.log(`Generating PWA icons from: ${inputImage}`);

  // 1. Standard 192x192
  await sharp(inputImage)
    .resize(192, 192, { fit: "contain", background: { r: 250, g: 248, b: 245, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "icon-192x192.png"));
  console.log("Created icon-192x192.png");

  // 2. Standard 512x512
  await sharp(inputImage)
    .resize(512, 512, { fit: "contain", background: { r: 250, g: 248, b: 245, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "icon-512x512.png"));
  console.log("Created icon-512x512.png");

  // 3. Maskable 512x512 with safe zone padding (inner icon is 80% = ~410px)
  const innerSize = 410;
  const innerBuffer = await sharp(inputImage)
    .resize(innerSize, innerSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 },
    },
  })
    .composite([
      {
        input: innerBuffer,
        top: Math.round((512 - innerSize) / 2),
        left: Math.round((512 - innerSize) / 2),
      },
    ])
    .png()
    .toFile(path.join(publicDir, "maskable-icon-512x512.png"));
  console.log("Created maskable-icon-512x512.png");

  // 4. Apple Touch Icon 180x180
  await sharp(inputImage)
    .resize(180, 180, { fit: "contain", background: { r: 250, g: 248, b: 245, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("Created apple-touch-icon.png");

  console.log("All PWA icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
