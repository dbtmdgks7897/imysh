export type ProjectStatus = "deployed" | "in-progress" | "planned";

export interface Project {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  status: ProjectStatus;
  period: string;
  thumbnail?: string; // /images/projects/[slug]/thumbnail.jpg
}

export const PROJECTS: Project[] = [
  {
    slug: "kigaru",
    title: "kigaru",
    summary: "AI 기반 운세·관상 서비스 플랫폼",
    stack: ["Next.js", "FastAPI", "React", "Tailwind CSS", "Gemini Flash"],
    status: "in-progress",
    period: "2026.03~",
  },
];
