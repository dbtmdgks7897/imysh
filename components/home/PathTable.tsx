import type { CSSProperties } from "react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { PathChild, PathData, PathNode, PathText } from "@/lib/content/schema";
import { projectHref } from "@/lib/content/projects";

interface PathTableProps {
  locale: Locale;
  path: PathData;
  text: PathText;
  projectTitles: Record<string, string>;
  projectThumbnails: Record<string, string | undefined>;
}

// Static class strings so Tailwind can see them. The table layout starts at xl (1280px): the
// 320px photo column fits two photos side by side (~157px each) and still leaves the thought
// column ~275px. Below xl every row stacks into a single column (photos side by side, max 448px).
const GRID_PHOTO = "xl:grid-cols-[110px_320px_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]";
const GRID_PLAIN = "xl:grid-cols-[110px_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]";

// A thought as sentence spans, so the hub thread can reveal it one sentence at a time.
// The spans are inline: the static layout is unchanged.
function Sentences({ text }: { text: string }) {
  const parts = text.match(/[^。.!?！？]+[。.!?！？]?/g) ?? [text];
  return (
    <>
      {parts.map((s, i) => (
        <span key={i} className="path-ln" style={{ "--d": `${0.2 + i * 0.18}s` } as CSSProperties}>
          {s}
        </span>
      ))}
    </>
  );
}

// "そのとき" cell: the thought (bold) and its note, with a small label.
function Thought({ label, thought, note, big }: { label: string; thought: string; note?: string; big?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      <p className={`path-thought font-bold ${big ? "text-xl leading-normal md:text-[22px]" : ""}`}>
        <Sentences text={thought} />
        {note && <span className="path-note mt-1 block text-[15px] font-normal">{note}</span>}
      </p>
    </div>
  );
}

// "だから次へ" cell: why I moved on.
function Next({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      <p className="path-next text-sm leading-[1.8] text-text-soft">{text}</p>
    </div>
  );
}

// "2026 前半" → big "2026" + small "前半".
function YearLabel({ label, small }: { label: string; small?: boolean }) {
  if (small) return <p className="path-year text-sm text-accent-text">{label}</p>;
  const [year, ...rest] = label.split(" ");
  return (
    <p className="path-year text-[28px] leading-tight font-bold">
      {year}
      {rest.length > 0 && <span className="block text-sm font-bold">{rest.join(" ")}</span>}
    </p>
  );
}

export default function PathTable({ locale, path, text, projectTitles, projectThumbnails }: PathTableProps) {
  const t = useTranslations("path");
  // A row's images: its own photos (with alt text from path.<locale>.yaml), else the thumbnails
  // of the projects it links to (decorative: the project link sits next to it).
  const photosOf = (node: PathNode | PathChild): { src: string; alt: string; own: boolean }[] =>
    node.photos.length > 0
      ? node.photos.map((src, i) => ({ src, alt: text.nodes[node.id]?.photoAlts?.[i] ?? "", own: true }))
      : node.projects
          .map((slug) => projectThumbnails[slug])
          .filter((src): src is string => Boolean(src))
          .map((src) => ({ src, alt: "", own: false }));
  // Each row picks its own grid: a row without images gets no photo column, so its text is wider.
  // There is no column header; each cell carries its own small label (そのとき / だから次へ).
  const gridOf = (node: PathNode | PathChild) => (photosOf(node).length > 0 ? GRID_PHOTO : GRID_PLAIN);

  // Below xl: two photos up to 448px, one up to 320px. At xl: own photos fill the 320px column;
  // project thumbnails keep their earlier 200px size so sub-rows do not grow.
  const sizeOf = (photos: { own: boolean }[]) =>
    photos.length > 1
      ? "grid-cols-2 max-w-md xl:max-w-none"
      : photos[0]?.own
        ? "max-w-xs xl:max-w-none"
        : "max-w-[180px] md:max-w-xs xl:max-w-[200px]"; // project thumbnails: small on phones

  function Photos({ node }: { node: PathNode | PathChild }) {
    const photos = photosOf(node);
    if (photos.length === 0) return null;
    return (
      // Several photos: side by side at every width, in timeline order.
      <div className={`path-photos grid gap-1.5 ${sizeOf(photos)}`}>
        {photos.map(({ src, alt, own }) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-placeholder">
            <ResponsiveImage
              src={src}
              alt={alt}
              className={`absolute inset-0 h-full w-full object-cover ${own ? "object-center" : "object-top"}`}
              sizes="200px"
            />
          </div>
        ))}
      </div>
    );
  }

  function Doing({ node }: { node: PathNode | PathChild }) {
    const copy = text.nodes[node.id];
    return (
      <div className="path-doing">
        <p className="font-bold">{copy.doing}</p>
        {node.projects.map((slug) => (
          <Link
            key={slug}
            href={projectHref(locale, slug.split("/"))}
            className="flex min-h-11 items-center text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text"
          >
            {t("projectLink", { title: projectTitles[slug] ?? slug })}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <section id="path" aria-labelledby="path-heading" className="scroll-mt-4 border-t border-border pt-14 pb-10 md:pt-16">
      <p data-avoid className="mb-4 text-sm text-text-muted">{t("label")}</p>
      <h2 id="path-heading" data-avoid className="mb-10 text-[clamp(28px,4vw,52px)] leading-tight font-bold md:mb-14">
        {text.heading}
      </h2>

      {/* The left lane (30px / 72px) is where the hub thread runs and ties its knots. */}
      <ol className="flex flex-col gap-3 pl-[30px] md:pl-[72px]">
        {path.nodes.map((node) => {
          const copy = text.nodes[node.id];
          return (
            <li key={node.id}>
              <div
                id={`path-${node.id}`}
                data-path-row
                className={`grid scroll-mt-4 items-start gap-3 rounded-[20px] bg-surface p-5 md:p-6 xl:gap-6 ${gridOf(node)} ${
                  node.current ? "ring-2 ring-accent" : ""
                }`}
              >
                <YearLabel label={copy.label} />
                <Photos node={node} />
                <Doing node={node} />
                <Thought label={t("labelThought")} thought={copy.thought} note={copy.thoughtNote} big />
                {copy.next && <Next label={t("labelNext")} text={copy.next} />}
              </div>

              {node.children.length > 0 && (
                <>
                  <p data-avoid className="mt-6 mb-2 ml-6 text-xs text-text-muted md:ml-10">
                    {t("childrenLabel")}
                  </p>
                  <ol className="flex flex-col gap-2">
                    {node.children.map((child) => {
                      const c = text.nodes[child.id];
                      return (
                        <li
                          key={child.id}
                          id={`path-${child.id}`}
                          data-path-row
                          data-sub
                          className={`ml-6 grid scroll-mt-4 items-start gap-2 rounded-2xl bg-surface-sub px-5 py-4 md:ml-10 md:px-6 xl:gap-6 ${gridOf(child)}`}
                        >
                          <YearLabel label={c.label} small />
                          <Photos node={child} />
                          <Doing node={child} />
                          <Thought label={t("labelThought")} thought={c.thought} note={c.thoughtNote} />
                          {c.next && <Next label={t("labelNext")} text={c.next} />}
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </li>
          );
        })}
      </ol>

      {/* The end of 02 returns to 01 in 01's own words; the hub thread ends here. */}
      <div className="mt-20 pl-[30px] md:pl-[72px]">
        <div data-avoid data-thread-end className="max-w-[40em]">
          <p className="text-xl leading-normal font-bold md:text-[22px]">{text.closing}</p>
          <Link
            href={`/${locale}#now`}
            className="mt-2 flex min-h-11 items-center self-start text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text"
          >
            {t("backToNow")}
          </Link>
        </div>
      </div>
    </section>
  );
}
