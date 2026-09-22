import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4f46e5"/>
      <stop offset="1" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <path d="M140 320 L140 192 L188 192 L188 240 L324 240 L324 192 L372 192 L372 320 L324 320 L324 272 L188 272 L188 320 Z" fill="white"/>
</svg>`;

writeFileSync("public/icons/icon.svg", svg.trim());
writeFileSync("public/favicon.svg", svg.trim());

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
}

// Maskable icon with safe-zone padding (logo smaller, full bleed bg)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4f46e5"/>
      <stop offset="1" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <path d="M180 336 L180 232 L216 232 L216 268 L296 268 L296 232 L332 232 L332 336 L296 336 L296 300 L216 300 L216 336 Z" fill="white"/>
</svg>`;
await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(`public/icons/maskable-512.png`);

await sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/apple-touch-icon.png");

console.log("Icons generated.");
