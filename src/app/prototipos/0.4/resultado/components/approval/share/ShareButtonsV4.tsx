'use client';

/**
 * ShareButtonsV4 - Card con mensaje preescrito
 * Muestra el mensaje a compartir con opción de editar
 */

import React, { useState } from 'react';
import { Card, CardBody, Button, Textarea } from '@nextui-org/react';
import { MessageCircle, Copy, Check } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl?: string;
  shareText?: string;
}

export const ShareButtonsV4: React.FC<ShareButtonsProps> = ({
  shareUrl = 'https://baldecash.com',
  shareText = '¡Me aprobaron mi crédito en BaldeCash! Ahora tendré mi laptop para la universidad.'
}) => {
  const [message, setMessage] = useState(shareText);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${message} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(`${message} ${shareUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <p className="text-sm font-medium text-neutral-700 mb-3">
          Comparte tu logro
        </p>

        <Textarea
          value={message}
          onValueChange={setMessage}
          minRows={2}
          maxRows={4}
          variant="bordered"
          classNames={{
            input: 'text-sm',
          }}
        />

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-green-500 text-white"
            startContent={<MessageCircle className="w-4 h-4" />}
            onPress={handleWhatsApp}
          >
            Enviar por WhatsApp
          </Button>
          <Button
            variant="bordered"
            isIconOnly
            onPress={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ShareButtonsV4;
