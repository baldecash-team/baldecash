'use client';

/**
 * Ícono redondo junto al título de una sección (prototipo de Brenda: el
 * birrete de "Tus estudios", la tarjeta de "Mensualidad de tus estudios").
 *
 * El nombre sale de la BD (`groups[].icon`, columna `form_field_group.icon`,
 * lista blanca de ws2). Un nombre que la web no conoce no pinta nada: la
 * sección se ve como siempre, sin círculo vacío.
 *
 * Tono: el de la marca de la landing (#E9ECFB / #4352D1 en el prototipo); la
 * billetera va en verde como la mensualidad del prototipo (#E3F5F1 / #0E8C78).
 */

import React from 'react';
import { Briefcase, Calendar, GraduationCap, House, MapPin, Phone, User, Wallet, type LucideIcon } from 'lucide-react';

export const ICONOS_DE_SECCION: Record<string, LucideIcon> = {
  'graduation-cap': GraduationCap,
  house: House,
  wallet: Wallet,
  user: User,
  calendar: Calendar,
  'map-pin': MapPin,
  phone: Phone,
  briefcase: Briefcase,
};

const VERDES = new Set(['wallet']);

export function IconoDeSeccionV2({ nombre }: { nombre?: string | null }) {
  const Icono = nombre ? ICONOS_DE_SECCION[nombre] : undefined;
  if (!Icono) return null;
  const verde = VERDES.has(nombre as string);
  return (
    <span
      aria-hidden="true"
      data-icono-seccion={nombre}
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full lg:h-9 lg:w-9 ${
        verde ? 'bg-[var(--d2-ok-suave)] text-[var(--d2-ok)]' : 'bg-[rgba(var(--color-primary-rgb),0.12)] text-[var(--color-primary)]'
      }`}
    >
      <Icono className="h-[19px] w-[19px]" strokeWidth={2} />
    </span>
  );
}

export default IconoDeSeccionV2;
