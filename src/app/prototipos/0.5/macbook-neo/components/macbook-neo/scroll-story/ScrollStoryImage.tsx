'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface ScrollStoryImageProps {
  imagePath: string;
  alt: string;
  opacity: MotionValue<number>;
}

export const ScrollStoryImage: React.FC<ScrollStoryImageProps> = ({
  imagePath,
  alt,
  opacity,
}) => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pt-16 pb-40 md:pb-48"
      style={{ opacity }}
    >
      <img
        src={imagePath}
        alt={alt}
        className="w-[88%] md:w-[75%] lg:w-[65%] max-w-5xl h-auto object-contain drop-shadow-2xl"
        loading="eager"
      />
    </motion.div>
  );
};
