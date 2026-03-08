import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProjectStatus } from "@/lib/projects";

const CONTENT_DIR = path.join(process.cwd(), "content/projects");

export interface ProjectFrontmatter {
  title: string;
  summary: string;
  stack: string[];
  status: ProjectStatus;
  period: string;
  liveUrl?: string;
  githubUrl?: string;
  thumbnail?: string;
  order?: number;
}

export interface ProjectContent {
  frontmatter: ProjectFrontmatter;
  source: string;
}

export async function getProjectContent(
  slugPath: string[],
  locale: string
): Promise<ProjectContent | null> {
  const filePath = path.join(CONTENT_DIR, ...slugPath, `${locale}.md`);
  if (!fs.existsSync(filePath)) {
    // fallback: ko.md
    const fallback = path.join(CONTENT_DIR, ...slugPath, "ko.md");
    if (!fs.existsSync(fallback)) return null;
    const raw = fs.readFileSync(fallback, "utf-8");
    const { data, content } = matter(raw);
    return { frontmatter: data as ProjectFrontmatter, source: content };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as ProjectFrontmatter, source: content };
}

export function getAllProjectSlugs(): string[][] {
  const slugs: string[][] = [];

  function scan(dir: string, prefix: string[]) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const hasMarkdown = entries.some(
      (e) => e.isFile() && e.name.endsWith(".md")
    );
    if (hasMarkdown && prefix.length > 0) {
      slugs.push(prefix);
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        scan(path.join(dir, entry.name), [...prefix, entry.name]);
      }
    }
  }

  scan(CONTENT_DIR, []);
  return slugs;
}

export async function getSubProjects(
  parentSlugPath: string[],
  locale: string
): Promise<(ProjectFrontmatter & { slug: string[] })[]> {
  const parentDir = path.join(CONTENT_DIR, ...parentSlugPath);
  if (!fs.existsSync(parentDir)) return [];

  const entries = fs.readdirSync(parentDir, { withFileTypes: true });
  const results: (ProjectFrontmatter & { slug: string[] })[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const childSlug = [...parentSlugPath, entry.name];
    const content = await getProjectContent(childSlug, locale);
    if (content) {
      results.push({ ...content.frontmatter, slug: childSlug });
    }
  }

  return results.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
