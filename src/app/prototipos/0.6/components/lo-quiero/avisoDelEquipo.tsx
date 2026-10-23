'use client';

/**
 * Aviso del equipo dentro del modal "Lo quiero" de Diseño 2 (BAL-4958).
 *
 * En Diseño 1, un reacondicionado o un equipo con entrega programada abren un
 * modal de confirmación aparte antes de seguir (`RefurbishedWarningModal`,
 * `DeferredDeliveryModal`). El prototipo de Brenda no tiene esos modales: el
 * aviso va DENTRO del modal "Lo quiero", arriba del cuerpo (`prod.aviso` en
 * `bcProdVals`). Ninguno de los dos modales viejos pide una casilla ni guarda
 * nada: solo informan y piden "Continuar", así que el aviso no quita lógica.
 */

import React from 'react';
import { isRefurbishedCondition } from '@/app/prototipos/0.6/utils/condition';
import type { DeferredDelivery } from '@/app/prototipos/0.6/utils/deferredDelivery';

export type AvisoDelEquipo =
  | { tipo: 'reacondicionado'; grado?: string | null }
  | { tipo: 'entrega'; desde: string };

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "2026-11-20" → "20 de noviembre" (como el prototipo). Vacío si no es una fecha. */
export function fechaDeEntrega(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  if (!m) return '';
  const mes = MESES[Number(m[2]) - 1];
  return mes ? `${Number(m[3])} de ${mes}` : '';
}

/**
 * Los avisos del equipo, con sus datos reales: reacondicionado (con su grado,
 * si lo tiene) y/o entrega programada (la fecha desde la que llega). Diseño 1
 * los encadena en dos modales; acá van los dos dentro del modal, en ese orden.
 */
export function avisosDelEquipo(equipo: {
  condition?: string | null;
  conditionCode?: string | null;
  grade?: string | null;
  deferredDelivery?: DeferredDelivery | null;
}): AvisoDelEquipo[] {
  const avisos: AvisoDelEquipo[] = [];
  if (isRefurbishedCondition(equipo.conditionCode || equipo.condition)) {
    avisos.push({ tipo: 'reacondicionado', grado: equipo.grade?.trim() || null });
  }
  const desde = equipo.deferredDelivery?.isDeferred ? fechaDeEntrega(equipo.deferredDelivery.estimatedFrom) : '';
  if (desde) avisos.push({ tipo: 'entrega', desde });
  return avisos;
}

/** Título y texto del aviso (prototipo). */
export function textosDelAviso(aviso: AvisoDelEquipo): { titulo: string; texto: string } {
  if (aviso.tipo === 'reacondicionado') {
    return {
      titulo: aviso.grado ? `Equipo reacondicionado · Grado ${aviso.grado}` : 'Equipo reacondicionado',
      texto: 'Revisado, probado y reparado por técnicos certificados. Puede tener señales mínimas de uso.',
    };
  }
  return { titulo: 'Entrega programada', texto: `Este equipo llega a partir del ${aviso.desde}.` };
}

/**
 * La caja del aviso, con los colores exactos del prototipo (`avisoBox`,
 * `avisoIcon`, `avisoTitleStyle`) y el borde estándar del kit (1,5 px / 10 px).
 */
export function CajaAvisoDelEquipo({ aviso }: { aviso: AvisoDelEquipo }) {
  const reac = aviso.tipo === 'reacondicionado';
  const { titulo, texto } = textosDelAviso(aviso);
  return (
    <div
      role="note"
      data-aviso-equipo={aviso.tipo}
      className={`flex items-center gap-2.5 rounded-[10px] border-[1.5px] px-3 py-2.5 ${
        reac ? 'border-[#F5C46B] bg-[#FFF7E6]' : 'border-[#C7CEF5] bg-[#EEF1FD]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] ${
          reac ? 'bg-[#FFE7B3] text-[#8A4B00]' : 'bg-[#DCE1FA] text-[#2F3CB0]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {reac ? (
            <>
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
              <path d="M9 12l2 2 4-4" />
            </>
          ) : (
            <>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </>
          )}
        </svg>
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className={`text-[13.5px] font-bold ${reac ? 'text-[#6B3A00]' : 'text-[#232E8F]'}`}>{titulo}</span>
        <span className="text-[12.5px] leading-[1.4] text-[#3A4052]">{texto}</span>
      </span>
    </div>
  );
}
