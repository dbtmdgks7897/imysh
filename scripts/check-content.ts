// Usage: npm run check:content [content-dir]
// Without an argument it checks ./content. Pass a copied directory to try a broken variant.
import path from "path";
import { collectContentErrors } from "../lib/content/validate";

const root = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
const errors = collectContentErrors(root);

if (errors.length > 0) {
  console.error(`content check failed (${errors.length}):\n\n${errors.join("\n\n")}`);
  process.exit(1);
}
console.log("content check passed");
