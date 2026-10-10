import path from "path";
import type { Locale } from "@/lib/locales";
import { CONTENT_ROOT } from "./paths";
import { parseWith, readYamlFile } from "./read";
import { nowSchema, nowTextSchema, pathSchema, pathTextSchema, type Now, type NowText, type PathData, type PathText } from "./schema";

export function loadNow(root: string = CONTENT_ROOT): Now {
  const file = path.join(root, "now.yaml");
  return parseWith(nowSchema, readYamlFile(file), file);
}

export function loadNowText(locale: Locale, root: string = CONTENT_ROOT): NowText {
  const file = path.join(root, `now.${locale}.yaml`);
  return parseWith(nowTextSchema, readYamlFile(file), file);
}

export function loadPath(root: string = CONTENT_ROOT): PathData {
  const file = path.join(root, "path.yaml");
  return parseWith(pathSchema, readYamlFile(file), file);
}

export function loadPathText(locale: Locale, root: string = CONTENT_ROOT): PathText {
  const file = path.join(root, `path.${locale}.yaml`);
  return parseWith(pathTextSchema, readYamlFile(file), file);
}
