import { MDXRemote } from "next-mdx-remote/rsc";
import { JSX } from "react";

const components = {
  h2: (props: JSX.IntrinsicElements["h2"]) => (
    <h2
      className="text-xl font-bold text-charcoal mt-10 mb-4 pl-3 border-l-4 border-sage"
      {...props}
    />
  ),
  h3: (props: JSX.IntrinsicElements["h3"]) => (
    <h3
      className="text-lg font-semibold text-charcoal mt-6 mb-3"
      {...props}
    />
  ),
  p: (props: JSX.IntrinsicElements["p"]) => (
    <p className="text-dark-gray leading-7 mb-4" {...props} />
  ),
  pre: (props: JSX.IntrinsicElements["pre"]) => (
    <pre
      className="bg-light-lavender rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono"
      {...props}
    />
  ),
  code: (props: JSX.IntrinsicElements["code"]) => (
    <code className="font-mono text-sm text-charcoal" {...props} />
  ),
  table: (props: JSX.IntrinsicElements["table"]) => (
    <div className="overflow-x-auto mb-4">
      <table className="border-collapse w-full text-sm" {...props} />
    </div>
  ),
  th: (props: JSX.IntrinsicElements["th"]) => (
    <th
      className="bg-light-lavender border border-lavender px-4 py-2 text-left font-semibold text-charcoal"
      {...props}
    />
  ),
  td: (props: JSX.IntrinsicElements["td"]) => (
    <td
      className="border border-lavender px-4 py-2 text-dark-gray"
      {...props}
    />
  ),
  img: (props: JSX.IntrinsicElements["img"]) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-lg shadow-sm max-w-full my-4"
      alt={props.alt ?? ""}
      {...props}
    />
  ),
  ul: (props: JSX.IntrinsicElements["ul"]) => (
    <ul className="list-disc list-inside mb-4 text-dark-gray space-y-1" {...props} />
  ),
  ol: (props: JSX.IntrinsicElements["ol"]) => (
    <ol className="list-decimal list-inside mb-4 text-dark-gray space-y-1" {...props} />
  ),
};

interface ProjectContentProps {
  source: string;
}

export default function ProjectContent({ source }: ProjectContentProps) {
  return (
    <article>
      <MDXRemote source={source} components={components} />
    </article>
  );
}
