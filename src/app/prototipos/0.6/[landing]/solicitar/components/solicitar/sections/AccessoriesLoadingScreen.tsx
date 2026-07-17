"use client";

import React, { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Estás preparando algo genial para ti...",
  "Analizando tu perfil...",
  "Buscando los mejores accesorios...",
  "Ya casi...",
];

const MESSAGE_INTERVAL_MS = 2500;

export function AccessoriesLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-10 h-10 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      <p className="text-sm text-gray-600 text-center transition-opacity duration-300">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
