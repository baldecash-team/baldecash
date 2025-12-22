'use client';

/**
 * ReferralCTAV2 - Sutil
 * Link pequeño no intrusivo
 */

import React from 'react';
import { Link } from '@nextui-org/react';
import { Users } from 'lucide-react';

interface ReferralCTAProps {
  referralCode?: string;
  rewardAmount?: number;
  onReferClick?: () => void;
}

export const ReferralCTAV2: React.FC<ReferralCTAProps> = ({
  onReferClick
}) => {
  return (
    <div className="w-full text-center py-4">
      <Link
        href="#"
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#4654CD] transition-colors cursor-pointer text-sm"
        onPress={() => onReferClick?.()}
      >
        <Users className="w-4 h-4" />
        <span>¿Conoces a alguien que necesite una laptop?</span>
      </Link>
    </div>
  );
};

export default ReferralCTAV2;
