"use client";

import React, { useEffect, useState } from "react";

const GENERIC_FIRST_MESSAGE = "Estás preparando algo genial para ti...";

const OTHER_MESSAGES = [
  "Analizando tu perfil...",
  "Buscando los mejores accesorios...",
  "Ya casi...",
];

const MESSAGE_INTERVAL_MS = 2500;
const FADE_DURATION_MS = 300;

interface AccessoriesLoadingScreenProps {
  productName?: string;
}

export function AccessoriesLoadingScreen({ productName }: AccessoriesLoadingScreenProps) {
  const firstMessage = productName ? `Revisando tu ${productName}...` : GENERIC_FIRST_MESSAGE;
  const messages = [firstMessage, ...OTHER_MESSAGES];

  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, FADE_DURATION_MS);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-10 h-10 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      <p
        className={`text-sm text-gray-600 text-center transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {messages[messageIndex]}
      </p>
    </div>
  );
}
