'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { continuityTabs } from '../data/v4Data';

export default function ContinuitySection() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveTab(prev => (prev + 1) % continuityTabs.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  return (
    <section id="continuity" className="bg-white text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="md:text-center">
          <p className="text-[#86868b] text-sm font-semibold mb-2">Mac + iPhone</p>
          <h2 className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4">Better together.</h2>
          <p className="text-[17px] md:text-[21px] text-[#6e6e73] max-w-[680px] md:mx-auto leading-[1.47] mb-12">
          Mac and iPhone are incredible on their own. Together, they&apos;re unbeatable. Copy and paste across devices, use iPhone as a hotspot, and so much more.
          </p>
        </div>

        {/* Pill tab navigation */}
        <div className="flex flex-wrap gap-2 mb-8" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {continuityTabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === activeTab ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Image display */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#f5f5f7]">
          {continuityTabs.map((tab, i) => (
            <Image
              key={tab.id}
              src={tab.image}
              alt={tab.label}
              fill
              className={`object-cover transition-opacity duration-500 ${i === activeTab ? 'opacity-100' : 'opacity-0'}`}
              sizes="100vw"
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
