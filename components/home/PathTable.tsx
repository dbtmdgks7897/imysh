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

// Static class strings so Tailwind can see them.
const GRID_PHOTO = "md:grid-cols-[110px_200px_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]";
const GRID_PLAIN = "md:grid-cols-[110px_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]";

// "2026 前半" → big "2026" + small "前半".
function YearLabel({ label, small }: { label: string; small?: boolean }) {
  if (small) return <p className="text-sm text-accent-text">{label}</p>;
  const [year, ...rest] = label.split(" ");
  return (
    <p className="text-[28px] leading-tight font-bold">
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
  // Top-level rows share one grid so their columns line up with the header; a top row without
  // an image keeps an empty (never grey) cell on desktop. Sub-rows are indented and pick their own.
  const topGrid = path.nodes.some((n) => photosOf(n).length > 0) ? GRID_PHOTO : GRID_PLAIN;
  const grid = topGrid;
  const headerHasPhotos = topGrid === GRID_PHOTO;
  const gridOfChild = (node: PathChild) => (photosOf(node).length > 0 ? GRID_PHOTO : GRID_PLAIN);

  function Photos({ node, top }: { node: PathNode | PathChild; top?: boolean }) {
    const photos = photosOf(node);
    if (photos.length === 0) return top && headerHasPhotos ? <div aria-hidden="true" className="hidden md:block" /> : null;
    return (
      <div className={`grid gap-1.5 ${photos.length > 1 ? "grid-cols-3" : ""}`}>
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
      <div>
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
      <p className="mb-4 text-sm text-text-muted">{t("label")}</p>
      <h2 id="path-heading" className="mb-10 text-[clamp(28px,4vw,52px)] leading-tight font-bold md:mb-14">
        {text.heading}
      </h2>

      <div aria-hidden="true" className={`hidden gap-6 px-6 pb-3 text-xs text-text-muted md:grid ${grid}`}>
        <span>{t("colYear")}</span>
        {headerHasPhotos && <span>{t("colPhoto")}</span>}
        <span>{t("colDoing")}</span>
        <span>{t("colThought")}</span>
        <span>{t("colNext")}</span>
      </div>

      <ol className="flex flex-col gap-3">
        {path.nodes.map((node) => {
          const copy = text.nodes[node.id];
          return (
            <li key={node.id}>
              <div
                id={`path-${node.id}`}
                className={`grid scroll-mt-4 items-start gap-3 rounded-[20px] bg-surface p-5 md:gap-6 md:p-6 ${topGrid} ${
                  node.current ? "ring-2 ring-accent" : ""
                }`}
              >
                <YearLabel label={copy.label} />
                <Photos node={node} top />
                <Doing node={node} />
                <p className="text-xl leading-normal font-bold md:text-[22px]">
                  {copy.thought}
                  {copy.thoughtNote && <span className="mt-1 block text-[15px] font-normal">{copy.thoughtNote}</span>}
                </p>
                {node.current ? (
                  <Link
                    href={`/${locale}#now`}
                    className="flex min-h-11 items-center self-start text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text"
                  >
                    {t("backToNow")}
                  </Link>
                ) : (
                  <p className="text-sm leading-[1.8] text-text-soft">{copy.next}</p>
                )}
              </div>

              {node.children.length > 0 && (
                <ol className="mt-2 flex flex-col gap-2">
                  {node.children.map((child) => {
                    const c = text.nodes[child.id];
                    return (
                      <li
                        key={child.id}
                        id={`path-${child.id}`}
                        className={`ml-6 grid scroll-mt-4 items-center gap-2 rounded-2xl bg-surface-sub px-5 py-4 md:ml-10 md:gap-6 md:px-6 ${gridOfChild(child)}`}
                      >
                        <YearLabel label={c.label} small />
                        <Photos node={child} />
                        <Doing node={child} />
                        <p className="font-bold">{c.thought}</p>
                        <p className="text-sm leading-[1.8] text-text-soft">{c.next}</p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
