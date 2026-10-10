import type { PathData } from "./schema";

export interface FlatPathNode {
  id: string;
  depth: 0 | 1;
  projects: string[];
  current: boolean;
}

// Path nodes and sub-nodes in reading order.
export function flattenPath(path: PathData): FlatPathNode[] {
  return path.nodes.flatMap((n) => [
    { id: n.id, depth: 0 as const, projects: n.projects, current: n.current },
    ...n.children.map((c) => ({ id: c.id, depth: 1 as const, projects: c.projects, current: false })),
  ]);
}

// The first path node that lists this project, if any.
export function findNodeIndexForProject(flat: FlatPathNode[], slug: string): number {
  return flat.findIndex((n) => n.projects.includes(slug));
}

// Prev/next order: projects in path order first, then the rest by depth and `order`.
export function projectSequence(
  path: PathData,
  slugPaths: string[][],
  orderOf: (slugPath: string[]) => number,
): string[] {
  const onPath = flattenPath(path).flatMap((n) => n.projects);
  const seen = new Set<string>();
  const sequence: string[] = [];
  for (const slug of onPath) {
    if (!seen.has(slug)) {
      seen.add(slug);
      sequence.push(slug);
    }
  }
  const rest = slugPaths
    .filter((s) => !seen.has(s.join("/")))
    .sort((a, b) => a.length - b.length || orderOf(a) - orderOf(b));
  return [...sequence, ...rest.map((s) => s.join("/"))];
}
