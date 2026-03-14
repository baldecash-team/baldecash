# Google Maps Places Autocomplete - Planning v1.0

**Fecha:** 2026-03-13
**Estado:** Pendiente de aprobación
**Objetivo:** Integrar autocompletado de direcciones con Google Maps Places en webpage3.0

---

## 1. Resumen Ejecutivo

Implementar un campo de dirección con autocompletado usando Google Maps Places API, siguiendo el patrón ya establecido en `pidetuprestamo`. La solución será dinámica, configurada desde el backend (Form Builder), y escalable para soportar múltiples países a futuro.

**API Key existente:**
```
AIzaSyAjA-wyR39OjzVU_pOhnhzrWZZOKPrvZnE
```

---

## 2. Análisis de Estado Actual

### 2.1 Backend (webservice2)

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| `FormFieldType.ADDRESS` | ✅ Ya existe | `app/db/models/form_builder.py:41` |
| `FormFieldCategory.ADDRESS` | ✅ Ya existe | `app/db/models/form_builder.py:73` |
| `Person.address_*` campos | ✅ Ya existen | `app/db/models/application.py:219-228` |
| `GeoUnit.latitude/longitude` | ✅ Ya existen | `app/db/models/localization.py:175-176` |

**Campos de dirección en Person:**
```python
address_street = Column(String(300), nullable=True)
address_number = Column(String(20), nullable=True)
address_interior = Column(String(20), nullable=True)
address_reference = Column(String(300), nullable=True)
address_district = Column(String(100), nullable=True)
address_province = Column(String(100), nullable=True)
address_department = Column(String(100), nullable=True)
address_ubigeo = Column(String(10), nullable=True)
address_postal_code = Column(String(10), nullable=True)
```

### 2.2 Frontend (webpage3.0)

| Componente | Estado |
|------------|--------|
| Tipo `address` en `WizardField` | ❌ No existe |
| `AddressAutocompleteField.tsx` | ❌ No existe |
| `useGooglePlacesAutocomplete.ts` | ❌ No existe |
| `googleMapsService.ts` | ❌ No existe |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ❌ No existe |

---

## 3. Arquitectura Propuesta

### 3.1 Estructura de Archivos

```
webpage3.0/
├── .env.local
│   └── + NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
│
├── src/app/prototipos/0.6/
│   ├── services/
│   │   ├── wizardApi.ts                     # + type 'address_autocomplete'
│   │   └── googleMapsService.ts             # NEW: Carga dinámica de Google Maps
│   │
│   ├── [landing]/solicitar/
│   │   ├── hooks/
│   │   │   ├── useCheckPerson.ts            # Existente
│   │   │   └── useGooglePlacesAutocomplete.ts  # NEW
│   │   │
│   │   └── components/solicitar/fields/
│   │       ├── DynamicField.tsx             # + case 'address_autocomplete'
│   │       └── AddressAutocompleteField.tsx # NEW
│   │
│   └── types/
│       └── googleMaps.d.ts                  # NEW: Type definitions
```

### 3.2 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE USUARIO                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Usuario escribe "Av. Javier Prado..."                          │
│              │                                                      │
│              ▼                                                      │
│  2. useGooglePlacesAutocomplete → Google Places API                │
│              │                                                      │
│              ▼                                                      │
│  3. Google devuelve sugerencias                                    │
│              │                                                      │
│              ▼                                                      │
│  4. Usuario selecciona dirección                                   │
│              │                                                      │
│              ▼                                                      │
│  5. Google Place Details API → Extrae:                             │
│     ├── formatted_address (dirección completa)                     │
│     ├── geometry.location (lat, lng)                               │
│     └── address_components:                                        │
│         ├── route (calle)                                          │
│         ├── street_number (número)                                 │
│         ├── administrative_area_level_1 (department)               │
│         ├── administrative_area_level_2 (province)                 │
│         └── locality/sublocality (district)                        │
│              │                                                      │
│              ▼                                                      │
│  6. Auto-rellena campos relacionados:                              │
│     ├── address_street                                             │
│     ├── address_department                                         │
│     ├── address_province                                           │
│     └── address_district                                           │
│              │                                                      │
│              ▼                                                      │
│  7. WizardContext almacena todos los valores                       │
│              │                                                      │
│              ▼                                                      │
│  8. Submit → Backend recibe form_data con direcciones              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Especificaciones Técnicas

### 4.1 Configuración Google Maps

```typescript
// Configuración del autocomplete (igual que pidetuprestamo)
const autocompleteOptions = {
  fields: ["formatted_address", "geometry", "address_components", "name"],
  types: ["address"],
  language: "es",
  componentRestrictions: { country: "pe" }  // Solo Perú por ahora
};
```

### 4.2 Nuevo Tipo de Campo

```typescript
// wizardApi.ts - Agregar al union type
type: 'text' | 'email' | 'phone' | 'document_number' | 'date' | 'radio' |
      'select' | 'autocomplete' | 'file' | 'textarea' | 'currency' |
      'number' | 'checkbox' | 'address_autocomplete';  // NEW
```

### 4.3 Propiedades Adicionales del Campo

```typescript
interface WizardField {
  // ... existing properties ...

  // NEW: Address autocomplete specific
  address_config?: {
    country_restriction?: string;      // "pe" | "co" | "mx" etc.
    auto_fill_fields?: {               // Campos a auto-rellenar
      department?: string;             // code del campo department
      province?: string;               // code del campo province
      district?: string;               // code del campo district
      latitude?: string;               // code del campo lat (hidden)
      longitude?: string;              // code del campo lng (hidden)
    };
    show_use_location?: boolean;       // Mostrar "Usar mi ubicación"
    require_selection?: boolean;       // Debe seleccionar de sugerencias
  };
}
```

### 4.4 Estructura del Componente

```typescript
// AddressAutocompleteField.tsx

interface AddressAutocompleteFieldProps {
  field: WizardField;
  showError?: boolean;
}

interface ParsedAddress {
  formattedAddress: string;
  street: string | null;
  number: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
  postalCode: string | null;
  latitude: number;
  longitude: number;
}

export const AddressAutocompleteField: React.FC<AddressAutocompleteFieldProps> = ({
  field,
  showError
}) => {
  // 1. Load Google Maps script
  // 2. Initialize Autocomplete
  // 3. Handle place selection
  // 4. Parse address components
  // 5. Auto-fill related fields
  // 6. Handle GPS location (optional)
};
```

### 4.5 Hook Principal

```typescript
// useGooglePlacesAutocomplete.ts

interface UseGooglePlacesOptions {
  inputRef: RefObject<HTMLInputElement>;
  countryRestriction?: string;
  onPlaceSelected: (place: ParsedAddress) => void;
  onError?: (error: string) => void;
}

interface UseGooglePlacesResult {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  clearSelection: () => void;
  getCurrentLocation: () => Promise<ParsedAddress | null>;
}

export function useGooglePlacesAutocomplete(
  options: UseGooglePlacesOptions
): UseGooglePlacesResult {
  // Implementation
}
```

### 4.6 Servicio de Carga de Google Maps

```typescript
// googleMapsService.ts

let googleMapsLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    }&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return typeof google !== 'undefined' && !!google?.maps?.places;
}
```

---

## 5. Cambios Requeridos

### 5.1 Frontend (webpage3.0)

| # | Archivo | Acción | Descripción |
|---|---------|--------|-------------|
| 1 | `.env.local` | Modificar | Agregar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| 2 | `services/googleMapsService.ts` | Crear | Singleton para cargar Google Maps |
| 3 | `types/googleMaps.d.ts` | Crear | Type definitions para google.maps |
| 4 | `services/wizardApi.ts` | Modificar | Agregar tipo `address_autocomplete` y propiedades |
| 5 | `hooks/useGooglePlacesAutocomplete.ts` | Crear | Hook para manejar autocomplete |
| 6 | `fields/AddressAutocompleteField.tsx` | Crear | Componente del campo |
| 7 | `fields/DynamicField.tsx` | Modificar | Agregar case para `address_autocomplete` |

### 5.2 Backend (webservice2) - Opcional

| # | Archivo | Acción | Descripción |
|---|---------|--------|-------------|
| 1 | `form_builder.py` | Ya existe | `FormFieldType.ADDRESS` |
| 2 | Seeder | Modificar | Agregar campos de ejemplo con tipo address |
| 3 | `form_service.py` | Modificar | Mapear `ADDRESS` → `address_autocomplete` en response |

---

## 6. Consideraciones

### 6.1 Costos Google Maps

| API | Costo (USD) | Free Tier |
|-----|-------------|-----------|
| Places Autocomplete | $2.83/1000 requests | $200/mes crédito |
| Place Details | $17.00/1000 requests | Incluido en crédito |
| Geocoding | $5.00/1000 requests | Incluido en crédito |

**Estimación mensual:** Con 5000 solicitudes/mes ≈ $14-20 USD

### 6.2 Seguridad

- API Key restringida por dominio (configurar en Google Console)
- No exponer key en logs
- Rate limiting opcional desde backend

### 6.3 Fallback

Si Google Maps falla:
1. Mostrar input de texto libre
2. Habilitar selects manuales (dept/prov/dist)
3. Registrar error en tracking

### 6.4 UX Mobile

- Dropdown de sugerencias debe ser scrollable
- Touch-friendly (min 44px altura)
- "Usar mi ubicación" para GPS
- Feedback visual de carga

---

## 7. Plan de Implementación

### Fase 1: Infraestructura Base
- [ ] Agregar API key a `.env.local`
- [ ] Crear `googleMapsService.ts`
- [ ] Crear `types/googleMaps.d.ts`

### Fase 2: Hook y Componente
- [ ] Crear `useGooglePlacesAutocomplete.ts`
- [ ] Crear `AddressAutocompleteField.tsx`
- [ ] Tests manuales de autocomplete

### Fase 3: Integración Form Builder
- [ ] Modificar `wizardApi.ts` (tipo + propiedades)
- [ ] Modificar `DynamicField.tsx` (case)
- [ ] Configurar campo en admin (seeder)

### Fase 4: Auto-fill y GPS
- [ ] Implementar auto-fill de campos relacionados
- [ ] Implementar "Usar mi ubicación"
- [ ] Tests de flujo completo

### Fase 5: QA y Deploy
- [ ] Tests en móvil
- [ ] Verificar costos
- [ ] Deploy a staging

---

## 8. Compatibilidad

### 8.1 Con Sistema Existente

| Componente | Compatibilidad |
|------------|----------------|
| WizardContext | ✅ Usa `updateField` existente |
| Form submission | ✅ form_data incluye address |
| Validaciones | ✅ Usa sistema existente |
| Cascading selects | ✅ Puede coexistir |
| Prefill (check-person) | ✅ Auto-fill address fields |

### 8.2 Con pidetuprestamo

La implementación sigue el mismo patrón:
- Misma API key
- Misma configuración de autocomplete
- Mismos campos de dirección

---

## 9. Preguntas Pendientes

1. **¿El backend debe validar la dirección?** (verificar que sea real vía Geocoding)
2. **¿Guardar lat/lng en Person o en Application?**
3. **¿Permitir edición manual después de seleccionar?**
4. **¿Configurar restricción de país desde admin o hardcoded Perú?**

---

## 10. Aprobación

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Developer | - | - | Pendiente |
| Reviewer | - | - | Pendiente |

---

**Siguiente paso:** Aprobación del plan antes de proceder con implementación.
