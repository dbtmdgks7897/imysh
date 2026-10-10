import { useTranslations } from "next-intl";
import type { ProjectStatus } from "@/lib/content/schema";

const KEY: Record<ProjectStatus, "deployed" | "inProgress" | "finished" | "closed" | "planned"> = {
  deployed: "deployed",
  "in-progress": "inProgress",
  finished: "finished",
  closed: "closed",
  planned: "planned",
};

// Text stays in the `text` color; the tint only marks the pill (4.5:1 holds).
export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const t = useTranslations("status");
  return (
    <span className="inline-block rounded-full bg-accent-tint px-2.5 py-0.5 text-sm text-text">
      {t(KEY[status])}
    </span>
  );
}
