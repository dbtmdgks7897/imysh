"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// M4에서 브라우저 언어 감지 + localStorage 로직으로 교체
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ko/");
  }, [router]);
  return null;
}
