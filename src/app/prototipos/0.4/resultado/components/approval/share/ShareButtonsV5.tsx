'use client';

/**
 * ShareButtonsV5 - Floating action button
 * Botón flotante en esquina con menú radial
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Facebook, Twitter, X } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl?: string;
  shareText?: string;
}

export const ShareButtonsV5: React.FC<ShareButtonsProps> = ({
  shareUrl = 'https://baldecash.com',
  shareText = '¡Me aprobaron mi crédito en BaldeCash!'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const buttons = [
    { id: 'whatsapp', Icon: MessageCircle, color: 'bg-green-500', angle: -45 },
    { id: 'facebook', Icon: Facebook, color: 'bg-blue-600', angle: 0 },
    { id: 'twitter', Icon: Twitter, color: 'bg-sky-500', angle: 45 },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Opciones radiales */}
      <AnimatePresence>
        {isOpen && (
          <>
            {buttons.map(({ id, Icon, color }, index) => (
              <motion.button
                key={id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: -70 * Math.cos((index - 1) * Math.PI / 4),
                  y: -70 * Math.sin((index - 1) * Math.PI / 4) - 70,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleShare(id)}
                className={`absolute bottom-0 right-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${color}`}
              >
                <Icon className="w-5 h-5" />
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Botón principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#4654CD] text-white rounded-full flex items-center justify-center shadow-xl"
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default ShareButtonsV5;
