import Link from "next/link";
import { useTranslations } from "next-intl";

export interface TimelineItem {
  id: string;
  label: string;
  doing: string;
  href: string;
  current: boolean;
}

// The path nodes around this project: previous, this one, next.
export default function MiniTimeline({ items, nextLine }: { items: TimelineItem[]; nextLine?: string }) {
  const t = useTranslations("detail");
  return (
    <div className="rounded-[20px] bg-surface p-6 text-sm">
      <p className="mb-3 text-text-muted">{t("timeline")}</p>
      <ol className="flex flex-col gap-1">
        {items.map((item) =>
          item.current ? (
            <li key={item.id} aria-current="true" className="flex min-h-10 items-center gap-2.5 font-bold">
              <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-accent-text" />
              {item.label} {item.doing}
            </li>
          ) : (
            <li key={item.id}>
              <Link href={item.href} className="flex min-h-11 items-center gap-2.5 text-text-muted hover:text-accent-text">
                <span aria-hidden="true" className="ml-0.5 h-2 w-2 shrink-0 rounded-full bg-border" />
                {item.label} {item.doing}
              </Link>
            </li>
          ),
        )}
      </ol>
      {nextLine && <p className="mt-3 border-t border-border pt-3 leading-[1.8] text-text-soft">→ {nextLine}</p>}
    </div>
  );
}
