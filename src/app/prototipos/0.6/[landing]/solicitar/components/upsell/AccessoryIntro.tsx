'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface AccessoryIntroProps {
  icon?: string;
  title?: string;
  description?: string;
}

export const AccessoryIntro: React.FC<AccessoryIntroProps> = ({
  icon = 'Users',
  title = 'Los estudiantes también llevan...',
  description = '7 de cada 10 estudiantes agregan al menos un accesorio a su compra.',
}) => {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ?? LucideIcons.Users;

  return (
    <div className="mb-6 bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl p-4">
      <div className={`flex gap-4 ${description ? 'items-start' : 'items-center'}`}>
        <div className="w-12 h-12 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-full flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 mb-1">
            {title}
          </h2>
          <p className="text-sm text-neutral-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessoryIntro;
