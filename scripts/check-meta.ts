// Usage: npm run check:meta   (after npm run build)
// Parses every page in out/ and checks the share metadata: title, description, canonical,
// absolute hreflang, og:title/description/url/image, twitter:card, and that the og:image file exists.
import fs from "fs";
import path from "path";
import { SITE_URL } from "../lib/site";

const OUT = path.join(process.cwd(), "out");
const SKIP = new Set(["404.html", "_not-found.html"]);

function pages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name.startsWith("_next") || e.name === "og" || e.name === "images" ? [] : pages(full);
    return e.name.endsWith(".html") && !SKIP.has(e.name) ? [full] : [];
  });
}

const attr = (html: string, re: RegExp) => re.exec(html)?.[1];
const meta = (html: string, key: string) =>
  attr(html, new RegExp(`<meta (?:property|name)="${key.replace(/[:]/g, "\\:")}" content="([^"]*)"`));

const errors: string[] = [];
const files = pages(OUT);
for (const file of files) {
  const rel = path.relative(OUT, file);
  const html = fs.readFileSync(file, "utf8");
  const need = (ok: unknown, what: string) => ok || errors.push(`${rel}: ${what}`);
  need(attr(html, /<title>([^<]+)<\/title>/), "missing <title>");
  need(meta(html, "description"), "missing meta description");
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  need(canonical?.startsWith(SITE_URL), `canonical not absolute: ${canonical}`);
  for (const l of ["ja", "ko", "x-default"]) {
    const href = attr(html, new RegExp(`<link rel="alternate" hrefLang="${l}" href="([^"]+)"`));
    need(href?.startsWith(SITE_URL), `hreflang ${l} missing or relative`);
  }
  for (const k of ["og:title", "og:description", "og:url", "og:image", "og:site_name", "og:locale"]) {
    need(meta(html, k), `missing ${k}`);
  }
  need(meta(html, "og:url") === canonical, "og:url differs from canonical");
  need(meta(html, "twitter:card") === "summary_large_image", "twitter:card is not summary_large_image");
  const image = meta(html, "og:image");
  if (image?.startsWith(SITE_URL)) {
    const local = path.join(OUT, image.slice(SITE_URL.length));
    need(fs.existsSync(local), `og:image file not in out/: ${image}`);
  } else {
    need(false, `og:image not absolute: ${image}`);
  }
}

if (errors.length) {
  console.error(`meta check failed (${errors.length}):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`meta check passed (${files.length} pages)`);
