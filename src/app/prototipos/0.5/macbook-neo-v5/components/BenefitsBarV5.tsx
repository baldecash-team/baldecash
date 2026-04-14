'use client';

import { Truck, Shield, CreditCard, IdCard } from 'lucide-react';
import { benefits } from '../data/v5Data';
import { BC } from '../lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Truck,
  Shield,
  CreditCard,
  IdCard,
};

export default function BenefitsBarV5() {
  return (
    <section id="benefits" className="bg-[#111] py-5">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon];
            return (
              <div key={benefit.id} className="flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" style={{ color: BC.secondary }} />}
                <span className="text-sm text-[#f5f5f7] whitespace-nowrap">{benefit.texto}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
