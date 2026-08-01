"use client";

import { marqueeWords } from "@/lib/content";

export default function Marquee() {
  // Duplicated once so the -50% keyframe loops seamlessly.
  const words = [...marqueeWords, ...marqueeWords];

  return (
    <div className="border-line overflow-hidden border-y py-5">
      <div className="marquee-track">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex shrink-0 items-center gap-8 px-8"
          >
            <span className="display text-bone-dim text-2xl md:text-4xl">
              {word}
            </span>
            <span className="bg-ember h-1.5 w-1.5 rounded-full" />
          </span>
        ))}
      </div>
    </div>
  );
}
