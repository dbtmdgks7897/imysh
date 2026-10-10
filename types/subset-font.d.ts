// Minimal typing for subset-font (no published types).
declare module "subset-font" {
  export default function subsetFont(
    source: Buffer,
    text: string,
    options?: { targetFormat?: "sfnt" | "woff" | "woff2"; preserveNameIds?: number[] },
  ): Promise<Buffer>;
}
