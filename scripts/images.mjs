// Usage: npm run images
// Reads images-src/images.json, writes two webp widths per image into public/images/,
// and records their sizes in lib/content/image-manifest.json so markup can set
// width/height and srcset. Outputs are committed; the build never runs sharp.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "images-src");
const OUT = path.join(ROOT, "public", "images");
const MANIFEST = path.join(ROOT, "lib", "content", "image-manifest.json");
const WIDTHS = [640, 1280];

const config = JSON.parse(fs.readFileSync(path.join(SRC, "images.json"), "utf8"));
const manifest = {};

for (const [key, { src, crop }] of Object.entries(config)) {
  if (key.startsWith("_")) continue;
  let base = sharp(path.join(SRC, src));
  const meta = await base.metadata();
  if (crop) {
    const [top, height] = crop;
    base = base.extract({ left: 0, top, width: meta.width, height: Math.min(height, meta.height - top) });
  }
  const cropped = await base.toBuffer({ resolveWithObject: true });
  const srcW = cropped.info.width;
  const srcH = cropped.info.height;

  const variants = [];
  for (const target of WIDTHS) {
    const width = Math.min(target, srcW);
    const height = Math.round((srcH * width) / srcW);
    const name = target === WIDTHS[WIDTHS.length - 1] ? `${key}.webp` : `${key}-${target}.webp`;
    const file = path.join(OUT, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await sharp(cropped.data).resize({ width }).webp({ quality: 80 }).toFile(file);
    variants.push({ url: `/images/${name}`, width, height });
  }
  const large = variants[variants.length - 1];
  manifest[large.url] = {
    width: large.width,
    height: large.height,
    srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(", "),
  };
  console.log(`${large.url}  ${large.width}x${large.height}`);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest: ${path.relative(ROOT, MANIFEST)} (${Object.keys(manifest).length} images)`);
