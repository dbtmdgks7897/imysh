import { ProjectStatus } from "@/lib/projects";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  deployed: {
    label: "배포 완료",
    className: "bg-sage text-white",
  },
  "in-progress": {
    label: "개발 중",
    className: "border border-taupe text-taupe",
  },
  planned: {
    label: "예정",
    className: "border border-mid-gray text-mid-gray",
  },
};

interface StatusBadgeProps {
  status: ProjectStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${className}`}>
      {label}
    </span>
  );
}
