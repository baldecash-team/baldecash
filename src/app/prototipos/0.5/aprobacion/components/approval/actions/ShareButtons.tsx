'use client';

/**
 * ShareButtons - Botones para compartir en redes
 * Versión fija para v0.5: Botones prominentes
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Link, Check, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  applicationId: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  applicationId,
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `¡Acabo de ser aprobado para mi laptop con BaldeCash! Mi financiamiento fue aprobado y pronto tendré mi equipo nuevo.`;
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
};

export default ShareButtons;
