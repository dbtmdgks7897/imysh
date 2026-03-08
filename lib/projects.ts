export type ProjectStatus = "deployed" | "in-progress" | "planned";

export interface Project {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  status: ProjectStatus;
  period: string;
  thumbnail?: string; // /images/projects/[slug]/thumbnail.jpg
  liveUrl?: string;
  githubUrl?: string;
  order?: number;
}

export const PROJECTS: Project[] = [
  {
    slug: "kigaru",
    title: "kigaru",
    summary: "AI 기반 운세·관상 서비스 플랫폼",
    stack: ["Next.js", "FastAPI", "React", "Tailwind CSS", "Gemini Flash"],
    status: "in-progress",
    period: "2026.03~",
    githubUrl: "https://github.com/dbtmdgks7897",
    order: 1,
  },
  {
    slug: "everyai",
    title: "EveryAI",
    summary: "생성 AI 작품 거래 사이트",
    stack: ["Java", "Spring Boot", "JPA", "Spring Security", "Next.js"],
    status: "deployed",
    period: "2023.10 ~ 2023.12",
    order: 2,
  },
  {
    slug: "placeholder-1",
    title: "Project B",
    summary: "준비중",
    stack: [],
    status: "planned",
    period: "2026~",
    order: 3,
  },
  {
    slug: "placeholder-2",
    title: "Project C",
    summary: "준비중",
    stack: [],
    status: "planned",
    period: "2026~",
    order: 4,
  },
];
