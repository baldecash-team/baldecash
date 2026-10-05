/**
 * Pickup Offices API (sedes de recojo).
 *
 * Lee las sedes de recojo y sus ventanas de atención desde el backend público
 * (`GET /public/pickup-offices`). Si el backend no responde (endpoint aún no
 * desplegado, error de red), cae a un mock con la oficina de Miraflores para
 * que el selector de "Recojo en oficina" del detalle nunca quede vacío.
 *
 * Solo lectura: persistir la cita elegida queda fuera de alcance por ahora.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export type PickupDayCode = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface PickupOfficeHour {
  day: PickupDayCode;
  /** "HH:MM" 24h */
  open_time: string;
  /** "HH:MM" 24h */
  close_time: string;
}

export interface PickupOffice {
  code: string;
  name: string;
  address: string;
  district?: string | null;
  maps_url?: string | null;
  note?: string | null;
  hours: PickupOfficeHour[];
}

/** Etiqueta corta (mockup: Lun, Mar, Mié, Jue, Vie). */
export const PICKUP_DAY_LABEL: Record<PickupDayCode, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
};

export const PICKUP_DAY_ORDER: PickupDayCode[] = [
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
];

/** Mock de respaldo: oficina de Miraflores, Lun–Vie 10–17h sin 13–14h. */
const MOCK_OFFICES: PickupOffice[] = [
  {
    code: 'miraflores',
    name: 'BaldeCash Miraflores',
    address: 'Avenida Alfredo Benavides 1238, Miraflores',
    district: 'Miraflores',
    maps_url:
      'https://maps.google.com/?q=Avenida+Alfredo+Benavides+1238,+Miraflores',
    note: 'Atención con previa cita. No disponible de 1:00 a 2:00 pm.',
    hours: (['mon', 'tue', 'wed', 'thu', 'fri'] as PickupDayCode[]).flatMap(
      (day) => [
        { day, open_time: '10:00', close_time: '13:00' },
        { day, open_time: '14:00', close_time: '17:00' },
      ],
    ),
  },
];

/** Trae las sedes activas; cae al mock ante cualquier fallo. */
export async function fetchPickupOffices(): Promise<PickupOffice[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/pickup-offices`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return MOCK_OFFICES;
    const data = (await res.json()) as PickupOffice[];
    if (!Array.isArray(data) || data.length === 0) return MOCK_OFFICES;
    return data;
  } catch {
    return MOCK_OFFICES;
  }
}

/** Días (ordenados) que tienen al menos una ventana de atención. */
export function availableDays(office: PickupOffice): PickupDayCode[] {
  const set = new Set(office.hours.map((h) => h.day));
  return PICKUP_DAY_ORDER.filter((d) => set.has(d));
}

/** Formatea "HH:MM" 24h a "h:MM am/pm" (formato del mockup). */
export function formatSlotLabel(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Genera los horarios de inicio (por hora) disponibles para un día, a partir de
 * las ventanas de atención. Excluye implícitamente el corte de almuerzo porque
 * viene como dos ventanas separadas. La última hora de inicio de cada ventana es
 * `close_time - 1h`.
 */
export function hourlySlotsForDay(
  office: PickupOffice,
  day: PickupDayCode,
): string[] {
  const slots: string[] = [];
  const windows = office.hours
    .filter((h) => h.day === day)
    .sort((a, b) => a.open_time.localeCompare(b.open_time));
  for (const w of windows) {
    const open = parseInt(w.open_time.split(':')[0], 10);
    const close = parseInt(w.close_time.split(':')[0], 10);
    for (let h = open; h < close; h += 1) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
  }
  return slots;
}
