import { imageInfo } from "@/lib/content/images";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

// Plain <img> with width/height and srcset from the image manifest, lazy by default.
// next/image is not used: the site is a static export with pre-generated widths.
export default function ResponsiveImage({ src, alt, sizes, className, priority }: ResponsiveImageProps) {
  const info = imageInfo(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={info?.srcSet}
      sizes={info ? sizes : undefined}
      width={info?.width}
      height={info?.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
