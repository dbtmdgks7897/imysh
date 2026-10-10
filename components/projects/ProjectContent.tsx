import type { JSX } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";

// Plain markdown + GFM (tables, strikethrough, autolinks). No MDX: `{` in content is just text.
// Raw HTML in markdown is dropped by remark-rehype's default; content does not use any.
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

const PROSE = "max-w-[40em]";

const components: Components = {
  h2: (props: JSX.IntrinsicElements["h2"]) => <h3 className="mt-10 mb-3 text-xl font-bold" {...props} />,
  h3: (props: JSX.IntrinsicElements["h3"]) => <h3 className="mt-8 mb-3 text-lg font-bold" {...props} />,
  h4: (props: JSX.IntrinsicElements["h4"]) => <h4 className="mt-6 mb-2 font-bold" {...props} />,
  p: (props: JSX.IntrinsicElements["p"]) => <p className={`mb-4 leading-[1.9] ${PROSE}`} {...props} />,
  a: (props: JSX.IntrinsicElements["a"]) => (
    <a className="text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text" {...props} />
  ),
  pre: (props: JSX.IntrinsicElements["pre"]) => (
    <pre className="mb-4 overflow-x-auto rounded-[14px] bg-surface-sub p-4 font-mono text-sm" {...props} />
  ),
  code: (props: JSX.IntrinsicElements["code"]) => {
    const isInline = !props.className?.startsWith("language-");
    return (
      <code
        className={`font-mono text-[0.9em] text-text${isInline ? " rounded bg-surface-sub px-1.5 py-0.5" : ""}`}
        {...props}
      />
    );
  },
  table: (props: JSX.IntrinsicElements["table"]) => (
    <div className="mb-4 overflow-x-auto rounded-[14px] bg-surface">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: JSX.IntrinsicElements["th"]) => (
    <th className="border-b border-border bg-surface-sub px-4 py-2 text-left font-bold" {...props} />
  ),
  td: (props: JSX.IntrinsicElements["td"]) => <td className="border-b border-border px-4 py-2 text-text-soft" {...props} />,
  img: (props: JSX.IntrinsicElements["img"]) => (
    // The alt text is the caption; hide the duplicate from screen readers via an empty alt.
    <span className="my-6 block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mx-auto block max-w-full rounded-[14px] shadow-card" loading="lazy" {...props} alt="" />
      {props.alt && <span className="mt-2 block text-center text-sm text-text-muted">{props.alt}</span>}
    </span>
  ),
  ul: (props: JSX.IntrinsicElements["ul"]) => (
    <ul className={`mb-4 list-outside list-disc space-y-1.5 pl-5 leading-[1.8] ${PROSE}`} {...props} />
  ),
  ol: (props: JSX.IntrinsicElements["ol"]) => (
    <ol className={`mb-4 list-outside list-decimal space-y-1.5 pl-5 leading-[1.8] ${PROSE}`} {...props} />
  ),
  blockquote: (props: JSX.IntrinsicElements["blockquote"]) => (
    <blockquote className={`my-4 border-l-4 border-accent pl-4 text-text-soft ${PROSE}`} {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export default function ProjectContent({ source }: { source: string }) {
  const tree = processor.runSync(processor.parse(source));
  return <div>{toJsxRuntime(tree, { Fragment, jsx, jsxs, components })}</div>;
}
