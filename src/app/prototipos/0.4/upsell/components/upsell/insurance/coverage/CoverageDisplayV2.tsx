// CoverageDisplayV2 - Tabs: Tabs "Cubre" / "No cubre" separados
'use client';

import React, { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import { Check, X, ShieldCheck, ShieldX } from 'lucide-react';
import { CoverageItem } from '../../../../types/upsell';

interface CoverageDisplayProps {
  coverage: CoverageItem[];
  exclusions: string[];
  className?: string;
}

export const CoverageDisplayV2: React.FC<CoverageDisplayProps> = ({
  coverage,
  exclusions,
  className = '',
}) => {
  const [selected, setSelected] = useState('covers');

  return (
    <div className={className}>
      <Tabs
        selectedKey={selected}
        onSelectionChange={(key) => setSelected(key as string)}
        classNames={{
          tabList: 'gap-2 w-full',
          tab: 'flex-1',
          cursor: 'bg-[#4654CD]',
        }}
      >
        <Tab
          key="covers"
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Cubre</span>
            </div>
          }
        >
          <div className="pt-4 space-y-3">
            {coverage.map((item) => (
              <div key={item.name} className="flex items-start gap-3 p-3 bg-[#03DBD0]/5 rounded-lg">
                <Check className="w-5 h-5 text-[#03DBD0] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Tab>
        <Tab
          key="excludes"
          title={
            <div className="flex items-center gap-2">
              <ShieldX className="w-4 h-4" />
              <span>No cubre</span>
            </div>
          }
        >
          <div className="pt-4 space-y-2">
            {exclusions.map((exclusion) => (
              <div key={exclusion} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <X className="w-5 h-5 text-neutral-400 shrink-0" />
                <span className="text-neutral-600">{exclusion}</span>
              </div>
            ))}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};
