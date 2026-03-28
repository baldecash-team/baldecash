"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Algo salió mal</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Estamos trabajando para solucionarlo.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#4654CD",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
