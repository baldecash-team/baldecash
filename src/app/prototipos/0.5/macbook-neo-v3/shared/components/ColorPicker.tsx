'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ColorOption {
  name: string;
  hex: string;
  imageSrc: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
}

export function ColorPicker({ colors }: ColorPickerProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative aspect-square w-full max-w-[600px]">
        {colors.map((color, i) => (
          <div
            key={color.name}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image
              src={color.imageSrc}
              alt={color.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          {colors.map((color, i) => (
            <button
              key={color.name}
              onClick={() => setActive(i)}
              className="cursor-pointer rounded-full transition-transform duration-200"
              style={{
                width: 32,
                height: 32,
                backgroundColor: color.hex,
                border: i === active ? '2px solid #1d1d1f' : '2px solid transparent',
                outline: i === active ? '2px solid #fff' : 'none',
                outlineOffset: -4,
                transform: i === active ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label={color.name}
            />
          ))}
        </div>
        <span className="text-[14px] font-medium" style={{ color: '#6e6e73' }}>
          {colors[active].name}
        </span>
      </div>
    </div>
  );
}
