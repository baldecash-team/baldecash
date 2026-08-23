'use client';

import { proceso } from './data/seminuevosData';
import { IconLupa, IconEtiqueta, IconDocumento, IconVideo } from './icons/SeminuevosIcons';

const ICONS = { lupa: IconLupa, etiqueta: IconEtiqueta, documento: IconDocumento } as const;

export function SeminuevosProceso({ catalogUrl }: { catalogUrl: string }) {
  const titleBase = proceso.title.replace(proceso.titleAccent, '').trim();
  const { lead, strong, tail } = proceso.bannerAprobacion;

  return (
    <section
      id="proceso"
      className="px-[22px] py-12"
      style={{ background: '#fff', scrollMarginTop: 'var(--header-total-height, 6.5rem)' }}
    >
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-extrabold text-center" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>
          {titleBase} <span style={{ color: 'var(--azul)' }}>{proceso.titleAccent}</span>
        </h2>

        <div className="mt-7 flex flex-col gap-3">
          {proceso.pasos.map((paso) => {
            // Un `icon` desconocido deja el paso sin ícono, en vez de tumbar la
            // sección entera con "Element type is invalid".
            const Icon = ICONS[paso.icon as keyof typeof ICONS] ?? null;
            return (
              <div
                key={paso.titulo}
                className="flex items-center gap-3.5 bg-white rounded-[16px] p-4"
                style={{ boxShadow: 'var(--sombra)', border: '1px solid #f0f1f4' }}
              >
                <div
                  className="shrink-0 w-12 h-12 rounded-[13px] grid place-items-center"
                  style={{ background: 'var(--lavanda)', color: 'var(--azul)' }}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-[16px]">{paso.titulo}</p>
                  <p className="text-[13.5px] mt-0.5" style={{ color: '#5b5c6b' }}>
                    {paso.subtitulo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-5 flex items-start gap-3.5 rounded-[16px] p-4"
          style={{ background: 'linear-gradient(160deg,#e6f9f8,#eef0fc)', border: '1px solid #cdeef0' }}
        >
          <div
            className="shrink-0 w-11 h-11 rounded-[12px] grid place-items-center bg-white"
            style={{ color: 'var(--azul)' }}
          >
            <IconVideo className="w-5 h-5" />
          </div>
          <p className="text-[14px]" style={{ color: '#3a3c52', lineHeight: 1.55 }}>
            {lead}<strong className="font-bold">{strong}</strong>{tail}
          </p>
        </div>

        <div className="mt-7 text-center">
          <a
            href={catalogUrl}
            className="inline-flex items-center justify-center min-h-11 rounded-[30px] px-7 py-3 text-white font-semibold text-[15px] cursor-pointer transition-[filter,box-shadow] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg,#5a63e0,#03DBD0)',
              boxShadow: '0 10px 24px rgba(90,99,224,.35)',
            }}
          >
            {proceso.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
