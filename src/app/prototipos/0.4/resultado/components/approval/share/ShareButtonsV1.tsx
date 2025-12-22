'use client';

/**
 * ShareButtonsV1 - Botones horizontales
 * Fila de botones de compartir con iconos y texto
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Share2, MessageCircle, Facebook, Twitter, Link2 } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl?: string;
  shareText?: string;
}

export const ShareButtonsV1: React.FC<ShareButtonsProps> = ({
  shareUrl = 'https://baldecash.com',
  shareText = '¡Me aprobaron mi crédito en BaldeCash!'
}) => {
  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 text-neutral-600 mb-4">
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Comparte tu logro</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="flat"
          className="bg-green-500 text-white"
          startContent={<MessageCircle className="w-4 h-4" />}
          onPress={() => handleShare('whatsapp')}
        >
          WhatsApp
        </Button>
        <Button
          variant="flat"
          className="bg-blue-600 text-white"
          startContent={<Facebook className="w-4 h-4" />}
          onPress={() => handleShare('facebook')}
        >
          Facebook
        </Button>
        <Button
          variant="flat"
          className="bg-sky-500 text-white"
          startContent={<Twitter className="w-4 h-4" />}
          onPress={() => handleShare('twitter')}
        >
          Twitter
        </Button>
        <Button
          variant="bordered"
          startContent={<Link2 className="w-4 h-4" />}
          onPress={() => handleShare('copy')}
        >
          Copiar link
        </Button>
      </div>
    </div>
  );
};

export default ShareButtonsV1;
