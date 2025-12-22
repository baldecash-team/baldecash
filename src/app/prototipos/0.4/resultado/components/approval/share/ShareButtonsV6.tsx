'use client';

/**
 * ShareButtonsV6 - Inline con preview
 * Muestra preview de cómo se verá el share
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl?: string;
  shareText?: string;
  productName?: string;
}

export const ShareButtonsV6: React.FC<ShareButtonsProps> = ({
  shareUrl = 'https://baldecash.com',
  shareText = '¡Me aprobaron mi crédito en BaldeCash!',
  productName = 'Laptop HP',
}) => {
  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-neutral-700 mb-3">
        Cuéntale a tus amigos
      </p>

      {/* Preview card */}
      <div className="bg-neutral-50 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-16 h-16 bg-white rounded-lg border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 line-clamp-2">
              {shareText}
            </p>
            <p className="text-xs text-neutral-500 mt-1 truncate">
              {productName} financiada con BaldeCash
            </p>
            <div className="flex items-center gap-1 text-xs text-[#4654CD] mt-1">
              <ExternalLink className="w-3 h-3" />
              <span>baldecash.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share button */}
      <Button
        className="w-full bg-green-500 text-white"
        size="lg"
        startContent={<MessageCircle className="w-5 h-5" />}
        onPress={handleWhatsApp}
      >
        Compartir por WhatsApp
      </Button>
    </div>
  );
};

export default ShareButtonsV6;
