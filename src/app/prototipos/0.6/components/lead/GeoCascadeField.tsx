'use client';

/**
 * GeoCascadeField — cascada Departamento → Provincia → Distrito (self-contained).
 * Usa /public/options/geo-units/{departments|provinces|districts}?parent_id=...
 * Reporta hacia arriba solo el distrito (id + label) vía onChange; department y
 * province son UI para filtrar. Reemplaza el autocomplete de distrito en el lead form.
 */
import React, { useEffect, useState } from 'react';
import { SelectInput } from '../../[landing]/solicitar/components/solicitar/fields/SelectInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

interface Opt { value: string; label: string }

async function fetchGeo(level: string, parentId?: string): Promise<Opt[]> {
  const url = parentId
    ? `${API_BASE_URL}/public/options/geo-units/${level}?parent_id=${parentId}`
    : `${API_BASE_URL}/public/options/geo-units/${level}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    return (data.options || []).map((o: { value: string | number; label: string }) => ({
      value: String(o.value), label: o.label,
    }));
  } catch {
    return [];
  }
}

interface GeoCascadeFieldProps {
  /** Distrito seleccionado (id) — controlado por el padre */
  value?: string;
  districtLabel?: string;
  onChange: (districtId: string, districtLabel?: string) => void;
  error?: string;
  small?: boolean;
  compact?: boolean;
  hideErrorText?: boolean;
  districtLabelText?: string;
}

export const GeoCascadeField: React.FC<GeoCascadeFieldProps> = ({
  value, districtLabel, onChange, error, small, compact, hideErrorText,
  districtLabelText = 'Distrito',
}) => {
  const [departments, setDepartments] = useState<Opt[]>([]);
  const [provinces, setProvinces] = useState<Opt[]>([]);
  const [districts, setDistricts] = useState<Opt[]>([]);
  const [dept, setDept] = useState('');
  const [prov, setProv] = useState('');
  const [distLabel, setDistLabel] = useState(districtLabel ?? '');

  useEffect(() => { fetchGeo('departments').then(setDepartments); }, []);

  useEffect(() => {
    if (!dept) { setProvinces([]); return; }
    fetchGeo('provinces', dept).then(setProvinces);
  }, [dept]);

  useEffect(() => {
    if (!prov) { setDistricts([]); return; }
    fetchGeo('districts', prov).then(setDistricts);
  }, [prov]);

  const sel = { searchable: true, small, compact, hideErrorText } as const;

  return (
    <>
      <SelectInput
        id="geo-department"
        label="Departamento"
        value={dept}
        options={departments}
        placeholder="Selecciona"
        onChange={(v) => { setDept(v); setProv(''); setDistLabel(''); onChange(''); }}
        {...sel}
      />
      <SelectInput
        id="geo-province"
        label="Provincia"
        value={prov}
        options={provinces}
        placeholder={dept ? 'Selecciona' : 'Primero elige departamento'}
        disabled={!dept}
        onChange={(v) => { setProv(v); setDistLabel(''); onChange(''); }}
        {...sel}
      />
      <SelectInput
        id="geo-district"
        label={districtLabelText}
        value={value || ''}
        savedLabel={distLabel || undefined}
        options={districts}
        placeholder={prov ? 'Selecciona' : 'Primero elige provincia'}
        disabled={!prov}
        error={error}
        onChange={(v, label) => { setDistLabel(label ?? ''); onChange(v, label); }}
        {...sel}
      />
    </>
  );
};

export default GeoCascadeField;
