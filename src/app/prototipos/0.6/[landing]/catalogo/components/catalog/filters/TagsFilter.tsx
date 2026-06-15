'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { FilterOption, ProductTagType } from '../../../types/catalog';

interface TagsFilterProps {
  tagOptions: FilterOption[] | null;
  selectedTags: ProductTagType[];
  onTagsChange: (tags: ProductTagType[]) => void;
  showCounts?: boolean;
}

const tagColors: Record<string, { bg: string; text: string; border: string }> = {
  nuevo: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  premium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  destacado: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  economico: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  mas_vendido: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  recomendado: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300' },
  cuota_baja: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300' },
  oferta: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

// Default colors for unknown tags
const defaultTagColors = { bg: 'bg-[var(--surface-bg,#fafafa)]', text: 'text-[var(--text,#374151)]', border: 'border-[var(--border-strong,#d1d5db)]' };

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export const TagsFilter: React.FC<TagsFilterProps> = ({
  tagOptions,
  selectedTags,
  onTagsChange,
  showCounts = true,
}) => {
  const toggleTag = (tag: ProductTagType) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // Don't render if no tag options available
  if (Array.isArray(tagOptions) && tagOptions.length === 0) return null;

  return (
    <FilterSection title="Destacados" defaultExpanded={true}>
      <div className="flex flex-wrap gap-2">
        {tagOptions === null ? (
          <>
            {[0, 1, 2, 3].map(i => (
              <div key={`skel-tag-${i}`} className="h-7 rounded-md bg-[var(--surface-2,#f3f4f6)] animate-pulse" style={{ width: `${60 + i * 15}px` }} />
            ))}
          </>
        ) : (
          [...tagOptions].sort((a, b) => (b.logo ? 1 : 0) - (a.logo ? 1 : 0)).map((opt) => {
            const isSelected = selectedTags.includes(opt.value as ProductTagType);
            const hardcoded = tagColors[opt.value];

            // For tags with a dynamic color from API (e.g. nvidia), use it inline
            if (!hardcoded && opt.color) {
              const { r, g, b } = hexToRgb(opt.color);
              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  className="cursor-pointer transition-all"
                  classNames={{
                    base: 'px-3 py-1 h-auto',
                    content: 'text-xs font-medium flex items-center gap-1',
                  }}
                  style={isSelected ? {
                    backgroundColor: opt.color,
                    color: '#fff',
                    borderColor: opt.color,
                  } : {
                    backgroundColor: `rgba(${r},${g},${b},0.08)`,
                    color: opt.color,
                    borderColor: `rgba(${r},${g},${b},0.4)`,
                  }}
                  onClick={() => toggleTag(opt.value as ProductTagType)}
                >
                  {opt.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <><img src={opt.logo.replace('-white.svg', '-green.svg')} alt={opt.label} style={{ height: 10, width: 'auto', objectFit: 'contain', display: 'inline-block' }} />{showCounts && ` (${opt.count})`}</>
                  ) : (
                    <>{opt.label}{showCounts && ` (${opt.count})`}</>
                  )}
                </Chip>
              );
            }

            const colors = hardcoded || defaultTagColors;
            return (
              <Chip
                key={opt.value}
                size="sm"
                radius="sm"
                variant={isSelected ? 'solid' : 'bordered'}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : `${colors.bg} ${colors.text} ${colors.border} hover:border-[var(--color-primary)]`
                }`}
                classNames={{
                  base: 'px-3 py-1 h-auto',
                  content: 'text-xs font-medium',
                }}
                onClick={() => toggleTag(opt.value as ProductTagType)}
              >
                {opt.label}{showCounts && ` (${opt.count})`}
              </Chip>
            );
          })
        )}
      </div>
    </FilterSection>
  );
};
