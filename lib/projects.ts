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
    summary: "생성 AI로 만든 작품과 서비스를 거래할 수 있는 플랫폼. 6주 실무 프로젝트.",
    stack: ["Java 17", "Spring Boot 3.1", "JPA", "Spring Security", "Next.js", "JWT", "BootPay"],
    status: "deployed",
    period: "2023.10 – 2023.12",
    thumbnail: "https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/logo.jpg",
    order: 2,
  },
];
