'use client';

import { RevealOnScroll } from './RevealOnScroll';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
  center?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  dark = false,
  center = false,
}: SectionHeaderProps) {
  const textAlign = center ? 'text-center' : '';
  const descMaxW = center ? 'mx-auto' : '';

  return (
    <div className={`${textAlign} mb-12`}>
      {eyebrow && (
        <RevealOnScroll>
          <p
            className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]"
            style={{ color: dark ? '#86868b' : '#6e6e73' }}
          >
            {eyebrow}
          </p>
        </RevealOnScroll>
      )}
      <RevealOnScroll delay={0.1}>
        <h2
          className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]"
          style={{ color: dark ? '#f5f5f7' : '#1d1d1f' }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </RevealOnScroll>
      {description && (
        <RevealOnScroll delay={0.2}>
          <p
            className={`mt-4 max-w-[560px] text-[clamp(0.95rem,2vw,1.15rem)] leading-[1.55] ${descMaxW}`}
            style={{ color: dark ? '#86868b' : '#6e6e73' }}
          >
            {description}
          </p>
        </RevealOnScroll>
      )}
    </div>
  );
}
