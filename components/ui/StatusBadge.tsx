import { useTranslations } from "next-intl";
import { ProjectStatus } from "@/lib/projects";

const STATUS_CLASS: Record<ProjectStatus, string> = {
  deployed: "bg-sage text-white",
  "in-progress": "border border-taupe text-taupe",
  planned: "border border-mid-gray text-mid-gray",
};

interface StatusBadgeProps {
  status: ProjectStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("status");
  const labelMap: Record<ProjectStatus, string> = {
    deployed: t("deployed"),
    "in-progress": t("inProgress"),
    planned: t("planned"),
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_CLASS[status]}`}
    >
      {labelMap[status]}
    </span>
  );
}
