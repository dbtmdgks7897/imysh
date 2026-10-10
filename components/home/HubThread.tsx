"use client";

import { useEffect, useRef } from "react";
import { startKinetic } from "@/lib/hub/kinetic";
import { startSettle, startThread } from "@/lib/hub/thread";

// The hub's interaction (concept A2): the thread, the kinetic sentence and the settle into 02.
// Renders only an empty svg on the server; everything starts after hydration, so the static hub
// (and its LCP, the sentence) is exactly what paints first. Under prefers-reduced-motion the thread
// is drawn in full and nothing moves. Mount it as the first child of the positioned hub container.
export default function HubThread() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const root = svg?.parentElement;
    const heading = document.getElementById("now-heading");
    const now = document.getElementById("now");
    const path = document.getElementById("path");
    if (!svg || !root || !heading || !now || !path) return;

    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let stops: Array<() => void> = [];
    const start = () => {
      stops.forEach((s) => s());
      stops = [];
      const reduced = media.matches;
      let waitFor: Promise<void> | undefined;
      if (!reduced) {
        const kinetic = startKinetic(heading, now);
        waitFor = kinetic.gathered;
        stops.push(kinetic.stop);
        stops.push(startSettle(path));
      }
      stops.unshift(startThread({ root, svg, heading, now, path, reduced, waitFor }));
    };
    start();
    media.addEventListener("change", start);
    return () => {
      media.removeEventListener("change", start);
      stops.forEach((s) => s());
    };
  }, []);

  return (
    <svg ref={svgRef} className="hub-thread" aria-hidden="true" focusable="false">
      <path className="th-ahead" />
      <path className="th" pathLength={1000} />
      <g className="knots" />
    </svg>
  );
}
