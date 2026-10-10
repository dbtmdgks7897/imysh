import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/lib/locales";
import { CONTENT_ROOT } from "./paths";
import { ContentError, parseWith, readYamlFile, rel } from "./read";
import { projectFrontmatterSchema, projectMetaSchema, type ProjectMeta } from "./schema";

export interface Project {
  slugPath: string[];
  meta: ProjectMeta;
  title: string;
  summary: string;
  body: string;
}

const projectsDir = (root: string) => path.join(root, "projects");

export function projectHref(locale: Locale, slugPath: string[]): string {
  return `/${locale}/projects/${slugPath.join("/")}`;
}

// A project is any directory under content/projects that has a meta.yaml or a .md file.
// Including md-only directories makes a forgotten meta.yaml a validation error, not a silent skip.
export function listProjectSlugPaths(root: string = CONTENT_ROOT): string[][] {
  const found: string[][] = [];
  const walk = (dir: string, prefix: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const slugPath = [...prefix, entry.name];
      const full = path.join(dir, entry.name);
      const files = fs.readdirSync(full);
      if (files.includes("meta.yaml") || files.some((f) => f.endsWith(".md"))) {
        found.push(slugPath);
      }
      walk(full, slugPath);
    }
  };
  if (fs.existsSync(projectsDir(root))) walk(projectsDir(root), []);
  return found;
}

export function loadProjectMeta(slugPath: string[], root: string = CONTENT_ROOT): ProjectMeta {
  const file = path.join(projectsDir(root), ...slugPath, "meta.yaml");
  return parseWith(projectMetaSchema, readYamlFile(file), file);
}

// Sentences only; validation calls this separately so a bad meta.yaml does not hide md errors.
export function loadProjectText(
  slugPath: string[],
  locale: Locale,
  root: string = CONTENT_ROOT,
): Pick<Project, "title" | "summary" | "body"> {
  const file = path.join(projectsDir(root), ...slugPath, `${locale}.md`);
  // No fallback to another locale: a missing translation is an error.
  if (!fs.existsSync(file)) throw new ContentError(`missing file: ${rel(file)}`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const frontmatter = parseWith(projectFrontmatterSchema, data, file);
  return { title: frontmatter.title, summary: frontmatter.summary, body: content };
}

export function loadProject(slugPath: string[], locale: Locale, root: string = CONTENT_ROOT): Project {
  return { slugPath, meta: loadProjectMeta(slugPath, root), ...loadProjectText(slugPath, locale, root) };
}

const byOrder = (a: Project, b: Project) => (a.meta.order ?? 99) - (b.meta.order ?? 99);

export function listTopLevelProjects(locale: Locale, root: string = CONTENT_ROOT): Project[] {
  return listProjectSlugPaths(root)
    .filter((s) => s.length === 1)
    .map((s) => loadProject(s, locale, root))
    .sort(byOrder);
}

export function listChildProjects(parent: string[], locale: Locale, root: string = CONTENT_ROOT): Project[] {
  return listProjectSlugPaths(root)
    .filter((s) => s.length === parent.length + 1 && parent.every((p, i) => s[i] === p))
    .map((s) => loadProject(s, locale, root))
    .sort(byOrder);
}
