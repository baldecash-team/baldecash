'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface ScrollStoryTextProps {
  headline: string;
  headlineColor: string;
  description: string;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}

export const ScrollStoryText: React.FC<ScrollStoryTextProps> = ({
  headline,
  headlineColor,
  description,
  opacity,
  y,
}) => {
  return (
    <motion.div
      className="absolute bottom-[8%] md:bottom-[10%] left-0 right-0 z-10 text-center px-6"
      style={{ opacity, y }}
    >
      <h3
        className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 font-['Baloo_2'] leading-tight"
        style={{ color: headlineColor }}
      >
        {headline}
      </h3>
      <p className="text-base md:text-lg text-neutral-500 leading-relaxed max-w-lg mx-auto">
        {description}
      </p>
    </motion.div>
  );
};
