'use client';

/** Mensaje centrado para estados de carga/error de la página de oferta. */
export function CenteredMessage({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-3" style={{ color: 'var(--color-primary)' }}>
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      {body ? <p className="mt-2 max-w-sm text-sm text-gray-500">{body}</p> : null}
    </div>
  );
}
