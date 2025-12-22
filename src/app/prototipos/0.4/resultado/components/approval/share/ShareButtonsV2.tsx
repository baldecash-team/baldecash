'use client';

/**
 * ShareButtonsV2 - Solo iconos circulares
 * Diseño minimalista con iconos circulares
 */

import React from 'react';
import { MessageCircle, Facebook, Twitter, Link2, Instagram } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl?: string;
  shareText?: string;
}

export const ShareButtonsV2: React.FC<ShareButtonsProps> = ({
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
      instagram: `https://www.instagram.com/`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const buttons = [
    { id: 'whatsapp', Icon: MessageCircle, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'facebook', Icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'twitter', Icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
    { id: 'instagram', Icon: Instagram, color: 'bg-pink-500 hover:bg-pink-600' },
    { id: 'copy', Icon: Link2, color: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700' },
  ];

  return (
    <div className="w-full text-center">
      <p className="text-sm text-neutral-500 mb-4">Compartir</p>

      <div className="flex justify-center gap-3">
        {buttons.map(({ id, Icon, color }) => (
          <button
            key={id}
            onClick={() => handleShare(id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${color}`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShareButtonsV2;
