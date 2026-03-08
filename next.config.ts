import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Static Export에서 next/image 최적화 불가
  },
};

export default nextConfig;
