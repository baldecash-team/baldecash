'use client';

/**
 * ScrollStorySection - Apple-style scroll-driven storytelling
 *
 * Desktop: A tall outer container (400vh or 500vh based on scrollSpeed) with a
 * sticky inner viewport that stays fixed. As the user scrolls through the outer
 * height, MotionValues from useScrollStory drive crossfading images and sliding
 * text overlays — replicating Apple's scroll-driven product narrative.
 *
 * Mobile: Stacked cards with whileInView entrance animations. No sticky
 * behavior — the hook is intentionally NOT called here to avoid calling
 * useTransform on mobile where the animation would never run.
 *
 * NOTE: DesktopScrollStory is a separate component (not a conditional branch
 * inside ScrollStorySection) because useScrollStory calls useTransform
 * internally. React hooks cannot be called conditionally, so the component
 * that consumes the hook must either always mount or never mount. Splitting
 * into a dedicated desktop component gives us clean conditional mounting.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollStory } from '../hooks/useScrollStory';
import { ScrollStoryImage } from './ScrollStoryImage';
import { ScrollStoryText } from './ScrollStoryText';
import { scrollStories } from '../../../data/mockMacbookNeoData';
import { ScrollSpeedVersion } from '../../../types/macbook-neo';
import { useIsMobile } from '@/app/prototipos/_shared';

interface ScrollStorySectionProps {
  scrollSpeed: ScrollSpeedVersion;
}

export const ScrollStorySection: React.FC<ScrollStorySectionProps> = ({
  scrollSpeed,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <section className="py-16 bg-neutral-50">
        {/* Section heading */}
        <div className="text-center mb-12 px-6">
          <h2
            className="text-3xl font-bold text-neutral-900 mb-3"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Hecha para tu día a día.
          </h2>
          <p className="text-base text-neutral-500">
            Descubre lo que puedes hacer con MacBook Neo.
          </p>
        </div>

        <div className="space-y-12 px-4">
          {scrollStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden"
            >
              <div className="p-4 flex items-center justify-center bg-neutral-50">
                <img
                  src={story.imagePath}
                  alt={`MacBook Neo - ${story.headline}`}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3
                  className="text-xl font-bold mb-2 font-['Baloo_2']"
                  style={{ color: story.headlineColor }}
                >
                  {story.headline}
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  {story.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  return <DesktopScrollStory scrollSpeed={scrollSpeed} />;
};

// ─── Desktop-only component ───────────────────────────────────────────────────

const DesktopScrollStory: React.FC<{ scrollSpeed: ScrollSpeedVersion }> = ({
  scrollSpeed,
}) => {
  const {
    containerRef,
    containerHeight,
    textOpacities,
    textYs,
    imageOpacities,
  } = useScrollStory({ stories: scrollStories, scrollSpeed });

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: containerHeight }}
    >
      {/* Sticky viewport — stays fixed while the outer section scrolls */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#fafafa]">
        {/* Section heading — always visible at top */}
        <div className="absolute top-8 left-0 right-0 z-20 text-center pointer-events-none">
          <h2
            className="text-lg md:text-xl font-semibold text-neutral-400 tracking-wide"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Hecha para tu día a día
          </h2>
        </div>

        {/* Image layers — all stacked at the same position, crossfade via opacity */}
        {scrollStories.map((story, i) => (
          <ScrollStoryImage
            key={story.id}
            imagePath={story.imagePath}
            alt={`MacBook Neo - ${story.headline}`}
            opacity={imageOpacities[i]}
          />
        ))}

        {/* Text layers — centered at bottom, fade in/out + translateY */}
        {scrollStories.map((story, i) => (
          <ScrollStoryText
            key={`text-${story.id}`}
            headline={story.headline}
            headlineColor={story.headlineColor}
            description={story.description}
            opacity={textOpacities[i]}
            y={textYs[i]}
          />
        ))}

        {/* Scroll indicator — subtle hint at the very bottom */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-1 rounded-full bg-neutral-300"
          />
        </div>
      </div>
    </section>
  );
};
