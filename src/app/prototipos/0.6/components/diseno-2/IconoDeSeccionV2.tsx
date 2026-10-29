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
import {
  Banknote,
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  CircleCheck,
  Clock,
  CreditCard,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  House,
  IdCard,
  Info,
  Landmark,
  Laptop,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  School,
  ShieldCheck,
  Smartphone,
  Star,
  Tablet,
  Truck,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

// BAL-5261: de 8 a 32. Los mismos nombres estan en admin2 (`IconoDeSeccion.tsx`)
// y en la lista blanca de ws2 (`ICONOS_DE_SECCION`).
export const ICONOS_DE_SECCION: Record<string, LucideIcon> = {
  user: User,
  users: Users,
  'id-card': IdCard,
  'file-text': FileText,
  house: House,
  'map-pin': MapPin,
  phone: Phone,
  smartphone: Smartphone,
  mail: Mail,
  'message-circle': MessageCircle,
  'graduation-cap': GraduationCap,
  school: School,
  'book-open': BookOpen,
  briefcase: Briefcase,
  wallet: Wallet,
  banknote: Banknote,
  'credit-card': CreditCard,
  landmark: Landmark,
  calculator: Calculator,
  calendar: Calendar,
  clock: Clock,
  laptop: Laptop,
  tablet: Tablet,
  package: Package,
  truck: Truck,
  gift: Gift,
  'shield-check': ShieldCheck,
  lock: Lock,
  'circle-check': CircleCheck,
  info: Info,
  heart: Heart,
  star: Star,
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
