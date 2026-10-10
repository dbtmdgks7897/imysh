import fs from "fs";
import path from "path";
import { parse } from "yaml";
import { z } from "zod";

export class ContentError extends Error {
  name = "ContentError";
}

// Paths in error messages are repo-relative so they are clickable in CI logs.
export function rel(file: string): string {
  return path.relative(process.cwd(), file) || file;
}

export function readYamlFile(file: string): unknown {
  if (!fs.existsSync(file)) throw new ContentError(`missing file: ${rel(file)}`);
  return parse(fs.readFileSync(file, "utf8"));
}

export function parseWith<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentError(`${rel(file)}\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
