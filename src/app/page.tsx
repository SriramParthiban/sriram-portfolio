'use client';

import dynamic from 'next/dynamic';

const SmokeTestScene = dynamic(() => import('@/components/SmokeTestScene'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-dvh w-full">
      <SmokeTestScene />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm tracking-widest text-white/40 uppercase">
        stack smoke test — replace with the real world
      </div>
    </main>
  );
}
