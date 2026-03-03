"use client";

import { NextUIProvider } from "@nextui-org/react";
import { FocusGroupGate } from "@/components/FocusGroupGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <FocusGroupGate>{children}</FocusGroupGate>
    </NextUIProvider>
  );
}
