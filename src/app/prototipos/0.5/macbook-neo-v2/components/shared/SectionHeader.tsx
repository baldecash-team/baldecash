'use client';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  dark = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`text-center max-w-3xl mx-auto ${className}`}>
      {eyebrow && (
        <p
          className={`text-[clamp(0.85rem,2vw,1rem)] font-semibold tracking-wide uppercase mb-2 ${
            dark ? 'text-[#86868b]' : 'text-[#6e6e73]'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-[clamp(2rem,6vw,3.5rem)] font-bold tracking-[-0.045em] leading-[1.05] ${
          dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-[clamp(0.95rem,2vw,1.15rem)] leading-relaxed mt-4 ${
            dark ? 'text-[#86868b]' : 'text-[#6e6e73]'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
