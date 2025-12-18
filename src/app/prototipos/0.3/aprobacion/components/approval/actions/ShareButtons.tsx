'use client';

/**
 * ShareButtons - Botones para compartir en redes
 *
 * F.12: Tres versiones
 * V1: Botones de redes prominentes
 * V2: Link "Compartir mi logro"
 * V3: Sin opcion de compartir
 */

import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Twitter, Link, Check, MessageCircle } from 'lucide-react';
import { ApprovalConfig } from '../../../types/approval';

interface ShareButtonsProps {
  version: ApprovalConfig['shareVersion'];
  applicationId: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  version,
  applicationId,
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Acabo de ser aprobado para mi laptop con BaldeCash! Mi financiamiento fue aprobado y pronto tendre mi equipo nuevo.`;
  const shareUrl = `https://baldecash.com/share/${applicationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  // V3: No share option
  if (version === 3) {
    return null;
  }

  // V1: Prominent social buttons
  if (version === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <p className="text-sm text-neutral-600 text-center">
          Comparte tu logro con tus amigos
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            isIconOnly
            variant="bordered"
            className="w-12 h-12 cursor-pointer border-blue-600 text-blue-600 hover:bg-blue-50"
            onPress={() => handleShare('facebook')}
          >
            <Facebook className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            className="w-12 h-12 cursor-pointer border-sky-500 text-sky-500 hover:bg-sky-50"
            onPress={() => handleShare('twitter')}
          >
            <Twitter className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            className="w-12 h-12 cursor-pointer border-green-600 text-green-600 hover:bg-green-50"
            onPress={() => handleShare('whatsapp')}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            className="w-12 h-12 cursor-pointer border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            onPress={handleCopyLink}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Link className="w-5 h-5" />
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  // V2: Simple share link with popover
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="text-center"
    >
      <Popover placement="top">
        <PopoverTrigger>
          <button className="text-[#4654CD] hover:text-[#3a47b8] text-sm font-medium flex items-center gap-1 mx-auto cursor-pointer">
            <Share2 className="w-4 h-4" />
            Compartir mi logro
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-3">
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="cursor-pointer"
              onPress={() => handleShare('facebook')}
            >
              <Facebook className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="cursor-pointer"
              onPress={() => handleShare('twitter')}
            >
              <Twitter className="w-4 h-4 text-sky-500" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="cursor-pointer"
              onPress={() => handleShare('whatsapp')}
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="cursor-pointer"
              onPress={handleCopyLink}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Link className="w-4 h-4" />
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

export default ShareButtons;
