'use client';

import { useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { ScrollStory, ScrollSpeedVersion } from '../../../types/macbook-neo';

// ─────────────────────────────────────────────────────────────────────────────
// The scroll story section always renders exactly 4 story beats.
// Because React forbids calling hooks inside loops or conditions we declare
// all useTransform calls unconditionally for indices 0-3 at the top level of
// this hook, then assemble them into arrays that callers can index into.
//
// Animation phases per story (all values are normalized scroll progress [0,1]):
//   Fade-in  : scrollStart        → scrollStart + 0.06   opacity 0→1 / y 30→0
//   Visible  : (middle portion)                           opacity 1   / y 0
//   Fade-out : scrollEnd - 0.06   → scrollEnd             opacity 1→0 / y 0→-20
//
// Image opacity uses a tighter window (±0.04) for a snappier visual cut.
// ─────────────────────────────────────────────────────────────────────────────

export const STORY_COUNT = 4 as const;

export interface UseScrollStoryReturn {
  /** Ref to attach to the outer sticky wrapper div */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Normalized [0,1] scroll progress of the sticky container */
  scrollYProgress: MotionValue<number>;
  /** CSS height string for the outer container (e.g. "400vh") */
  containerHeight: string;
  /**
   * Per-story text opacity motion values indexed by story position [0..3].
   * Fade in at story start, hold through middle, fade out at story end.
   */
  textOpacities: MotionValue<number>[];
  /**
   * Per-story text vertical offset motion values indexed by story position [0..3].
   * Slides up on enter (30px→0), slides up further on exit (0→-20px).
   */
  textYs: MotionValue<number>[];
  /**
   * Per-story image opacity motion values indexed by story position [0..3].
   * Uses a tighter fade window (±0.04) vs text (±0.06).
   */
  imageOpacities: MotionValue<number>[];
}

interface UseScrollStoryOptions {
  stories: ScrollStory[];
  scrollSpeed: ScrollSpeedVersion;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns a fallback story range for indices that exceed the provided array. */
function storyAt(stories: ScrollStory[], index: number): ScrollStory {
  return (
    stories[index] ?? {
      id: `__placeholder_${index}`,
      headline: '',
      body: '',
      scrollStart: 0,
      scrollEnd: 0,
    }
  );
}

// ─── hook ───────────────────────────────────────────────────────────────────

export const useScrollStory = ({
  stories,
  scrollSpeed,
}: UseScrollStoryOptions): UseScrollStoryReturn => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerHeight = scrollSpeed === 1 ? '500vh' : '650vh';

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── Story 0 ──────────────────────────────────────────────────────────────
  const s0 = storyAt(stories, 0);
  const s0TextOpacity = useTransform(
    scrollYProgress,
    [s0.scrollStart, s0.scrollStart + 0.06, s0.scrollEnd - 0.06, s0.scrollEnd],
    [0, 1, 1, 0]
  );
  const s0TextY = useTransform(
    scrollYProgress,
    [s0.scrollStart, s0.scrollStart + 0.06, s0.scrollEnd - 0.06, s0.scrollEnd],
    [30, 0, 0, -20]
  );
  const s0ImageOpacity = useTransform(
    scrollYProgress,
    [s0.scrollStart, s0.scrollStart + 0.04, s0.scrollEnd - 0.04, s0.scrollEnd],
    [0, 1, 1, 0]
  );

  // ── Story 1 ──────────────────────────────────────────────────────────────
  const s1 = storyAt(stories, 1);
  const s1TextOpacity = useTransform(
    scrollYProgress,
    [s1.scrollStart, s1.scrollStart + 0.06, s1.scrollEnd - 0.06, s1.scrollEnd],
    [0, 1, 1, 0]
  );
  const s1TextY = useTransform(
    scrollYProgress,
    [s1.scrollStart, s1.scrollStart + 0.06, s1.scrollEnd - 0.06, s1.scrollEnd],
    [30, 0, 0, -20]
  );
  const s1ImageOpacity = useTransform(
    scrollYProgress,
    [s1.scrollStart, s1.scrollStart + 0.04, s1.scrollEnd - 0.04, s1.scrollEnd],
    [0, 1, 1, 0]
  );

  // ── Story 2 ──────────────────────────────────────────────────────────────
  const s2 = storyAt(stories, 2);
  const s2TextOpacity = useTransform(
    scrollYProgress,
    [s2.scrollStart, s2.scrollStart + 0.06, s2.scrollEnd - 0.06, s2.scrollEnd],
    [0, 1, 1, 0]
  );
  const s2TextY = useTransform(
    scrollYProgress,
    [s2.scrollStart, s2.scrollStart + 0.06, s2.scrollEnd - 0.06, s2.scrollEnd],
    [30, 0, 0, -20]
  );
  const s2ImageOpacity = useTransform(
    scrollYProgress,
    [s2.scrollStart, s2.scrollStart + 0.04, s2.scrollEnd - 0.04, s2.scrollEnd],
    [0, 1, 1, 0]
  );

  // ── Story 3 ──────────────────────────────────────────────────────────────
  const s3 = storyAt(stories, 3);
  const s3TextOpacity = useTransform(
    scrollYProgress,
    [s3.scrollStart, s3.scrollStart + 0.06, s3.scrollEnd - 0.06, s3.scrollEnd],
    [0, 1, 1, 0]
  );
  const s3TextY = useTransform(
    scrollYProgress,
    [s3.scrollStart, s3.scrollStart + 0.06, s3.scrollEnd - 0.06, s3.scrollEnd],
    [30, 0, 0, -20]
  );
  const s3ImageOpacity = useTransform(
    scrollYProgress,
    [s3.scrollStart, s3.scrollStart + 0.04, s3.scrollEnd - 0.04, s3.scrollEnd],
    [0, 1, 1, 0]
  );

  // ── Assemble into indexed arrays ─────────────────────────────────────────
  const textOpacities: MotionValue<number>[] = [
    s0TextOpacity,
    s1TextOpacity,
    s2TextOpacity,
    s3TextOpacity,
  ];

  const textYs: MotionValue<number>[] = [s0TextY, s1TextY, s2TextY, s3TextY];

  const imageOpacities: MotionValue<number>[] = [
    s0ImageOpacity,
    s1ImageOpacity,
    s2ImageOpacity,
    s3ImageOpacity,
  ];

  return {
    containerRef,
    scrollYProgress,
    containerHeight,
    textOpacities,
    textYs,
    imageOpacities,
  };
};

/*
Usage example in a child component:

  const { containerRef, containerHeight, textOpacities, textYs, imageOpacities } =
    useScrollStory({ stories, scrollSpeed });

  // Outer wrapper — provides the scroll distance
  <div ref={containerRef} style={{ height: containerHeight }}>

    // Sticky viewport — stays in view while user scrolls through containerHeight
    <div className="sticky top-0 h-screen overflow-hidden">

      {stories.map((story, i) => (
        // Each story layer is absolutely positioned and driven by its MotionValues
        <motion.div
          key={story.id}
          style={{ opacity: imageOpacities[i] }}
          className="absolute inset-0"
        >
          {story.imageSrc && (
            <Image src={story.imageSrc} alt={story.imageAlt ?? ''} fill />
          )}

          <motion.div style={{ opacity: textOpacities[i], y: textYs[i] }}>
            <h2>{story.headline}</h2>
            <p>{story.body}</p>
          </motion.div>
        </motion.div>
      ))}

    </div>
  </div>
*/
