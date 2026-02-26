'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { FilterOption, ProductTagType } from '../../../types/catalog';

interface TagsFilterProps {
  tagOptions: FilterOption[];
  selectedTags: ProductTagType[];
  onTagsChange: (tags: ProductTagType[]) => void;
  showCounts?: boolean;
}

const tagColors: Record<string, { bg: string; text: string; border: string }> = {
  oferta: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
  mas_vendido: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  recomendado: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300' },
  cuota_baja: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300' },
  // Additional labels from API
  nuevo: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  destacado: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  promocion: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  exclusivo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  limitado: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
  popular: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
};

// Default colors for unknown tags
const defaultTagColors = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' };

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

  return (
    <FilterSection title="Destacados" defaultExpanded={true}>
      <div className="flex flex-wrap gap-2">
        {tagOptions.map((opt) => {
          const isSelected = selectedTags.includes(opt.value as ProductTagType);
          const colors = tagColors[opt.value] || defaultTagColors;

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
        })}
      </div>
    </FilterSection>
  );
};
