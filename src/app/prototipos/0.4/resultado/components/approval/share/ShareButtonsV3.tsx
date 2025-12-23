'use client';

/**
 * ShareButtonsV3 - Botón único que abre menú
 * Un solo botón "Compartir" que despliega opciones
 */

import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { Share2, MessageCircle, Facebook, Twitter, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl?: string;
  shareText?: string;
}

export const ShareButtonsV3: React.FC<ShareButtonsProps> = ({
  shareUrl = 'https://baldecash.com',
  shareText = '¡Me aprobaron mi crédito en BaldeCash!'
}) => {
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, color: 'text-green-500' },
    { id: 'facebook', label: 'Facebook', Icon: Facebook, color: 'text-blue-600' },
    { id: 'twitter', label: 'Twitter', Icon: Twitter, color: 'text-sky-500' },
    { id: 'copy', label: copied ? 'Copiado' : 'Copiar link', Icon: copied ? Check : Link2, color: 'text-neutral-600' },
  ];

  return (
    <Popover placement="top">
      <PopoverTrigger>
        <Button
          variant="flat"
          className="bg-[#4654CD]/10 text-[#4654CD]"
          startContent={<Share2 className="w-4 h-4" />}
        >
          Compartir
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <div className="flex flex-col gap-1 min-w-[160px]">
          {shareOptions.map(({ id, label, Icon, color }) => (
            <button
              key={id}
              onClick={() => handleShare(id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-left"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm text-neutral-700">{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButtonsV3;
