import manifest from "./image-manifest.json";

export interface ImageInfo {
  width: number;
  height: number;
  srcSet: string;
}

const MANIFEST: Record<string, ImageInfo> = manifest;

// Sizes and srcset written by `npm run images`. Undefined for an image the script did not make.
export function imageInfo(src: string): ImageInfo | undefined {
  return MANIFEST[src];
}

export function isKnownImage(src: string): boolean {
  return src in MANIFEST;
}
