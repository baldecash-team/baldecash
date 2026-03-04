# Plan de Implementación: Configuración del Flujo de Solicitud

**Fecha:** 2026-03-04
**Versión:** 1.0
**Estado:** Pendiente de aprobación

---

## 1. Resumen Ejecutivo

### Objetivo
Permitir configurar por landing el flujo de la página `/solicitar`:
- **Habilitar/deshabilitar** secciones (accesorios, wizard steps, seguros)
- **Reordenar** secciones según necesidad del negocio
- **UI en admin** para gestionar la configuración

### Alcance
| Proyecto | Cambios |
|----------|---------|
| webservice2 | API endpoints + tests + seeders |
| admin2 | UI de configuración + tests |
| webpage3.0 | Renderizado dinámico + tests |

### Flujo Actual (Hardcoded)
```
/solicitar (intro + accessories) → wizard steps → /seguros → /confirmacion
```

### Flujo Propuesto (Configurable)
```
/solicitar → [secciones según config] → /confirmacion
```

---

## 2. Arquitectura

### 2.1 Modelo de Datos

Se usará el campo `config` JSON existente en la tabla `landing` (línea 227 de `landing.py`):

```json
{
  "solicitar_flow": {
    "sections": [
      {"type": "accessories", "enabled": true, "order": 1},
      {"type": "wizard_steps", "enabled": true, "order": 2},
      {"type": "insurance", "enabled": true, "order": 3}
    ]
  },
  // ... otras configuraciones existentes
}
```

**Ventajas:**
- No requiere migración de base de datos
- Flexible para añadir más tipos de secciones
- Compatible con configuraciones existentes en `config`

### 2.2 Tipos de Secciones

| type | Descripción | Componente actual |
|------|-------------|-------------------|
| `accessories` | Upsell de accesorios | `AccessoryIntro` + `AccessoryCard` |
| `wizard_steps` | Pasos del formulario dinámico | `WizardConfigContext` + `/[step]` |
| `insurance` | Selección de seguros | `/seguros/segurosClient.tsx` |

### 2.3 Configuración por Defecto

Si una landing no tiene `solicitar_flow` configurado, se usa:

```json
{
  "sections": [
    {"type": "accessories", "enabled": true, "order": 1},
    {"type": "wizard_steps", "enabled": true, "order": 2},
    {"type": "insurance", "enabled": true, "order": 3}
  ]
}
```

---

## 3. webservice2 - Backend

### 3.1 Endpoints Nuevos

#### GET /api/v1/public/landing/{slug}/solicitar-config

**Descripción:** Obtiene la configuración del flujo de solicitud para una landing.

**Response 200:**
```json
{
  "sections": [
    {"type": "accessories", "enabled": true, "order": 1},
    {"type": "wizard_steps", "enabled": true, "order": 2},
    {"type": "insurance", "enabled": true, "order": 3}
  ]
}
```

**Lógica:**
1. Buscar landing por slug (validar status ACTIVE o preview_key)
2. Leer `config.solicitar_flow` del modelo
3. Si no existe, retornar config por defecto
4. Ordenar secciones por `order`

#### PUT /api/v1/landings/{id}/solicitar-config

**Descripción:** Actualiza la configuración del flujo de solicitud (Admin).

**Request Body:**
```json
{
  "sections": [
    {"type": "insurance", "enabled": true, "order": 1},
    {"type": "wizard_steps", "enabled": true, "order": 2},
    {"type": "accessories", "enabled": false, "order": 3}
  ]
}
```

**Response 200:**
```json
{
  "message": "Configuración actualizada",
  "sections": [...]
}
```

**Validaciones:**
- Debe incluir los 3 tipos de secciones
- `order` debe ser único (1, 2, 3)
- `enabled` es boolean

### 3.2 Archivos a Modificar/Crear

```
webservice2/
├── app/api/routers/
│   ├── public/
│   │   └── landing.py                          # MODIFICAR: agregar endpoint público
│   └── landings/
│       └── solicitar_config.py                 # CREAR: endpoint admin
│
├── app/schemas/
│   └── landing.py                              # MODIFICAR: agregar schemas
│
├── tests/api/routers/
│   ├── public/
│   │   └── test_landing_solicitar_config.py    # CREAR: tests públicos
│   └── test_landing_solicitar_config.py        # CREAR: tests admin
│
└── scripts/seeders/landing/
    └── landings.py                             # MODIFICAR: agregar config a seeds
```

### 3.3 Código del Endpoint Público

```python
# app/api/routers/public/landing.py (agregar al final)

DEFAULT_SOLICITAR_FLOW = {
    "sections": [
        {"type": "accessories", "enabled": True, "order": 1},
        {"type": "wizard_steps", "enabled": True, "order": 2},
        {"type": "insurance", "enabled": True, "order": 3},
    ]
}

@router.get("/{slug}/solicitar-config")
def get_solicitar_config(
    slug: str,
    db: Session = Depends(get_db),
    preview_key: Optional[str] = Query(None)
):
    """
    Get solicitar flow configuration for a landing.

    Returns the order and enabled state of each section:
    - accessories: Upsell products
    - wizard_steps: Form steps from wizard config
    - insurance: Insurance selection

    If not configured, returns default order (accessories → wizard → insurance).
    """
    # Validate landing access
    landing = db.query(Landing).filter(
        Landing.slug == slug,
        Landing.is_active == True
    ).first()

    if not landing:
        raise HTTPException(status_code=404, detail="Landing not found")

    # Check preview access for non-active landings
    has_preview_access = _validate_preview_access(landing, preview_key)
    if landing.status != LandingStatus.ACTIVE and not has_preview_access:
        raise HTTPException(status_code=404, detail="Landing not found")

    # Get config or return default
    config = landing.config or {}
    solicitar_flow = config.get("solicitar_flow", DEFAULT_SOLICITAR_FLOW)

    # Ensure sections are sorted by order
    sections = sorted(
        solicitar_flow.get("sections", DEFAULT_SOLICITAR_FLOW["sections"]),
        key=lambda s: s.get("order", 0)
    )

    return {"sections": sections}
```

### 3.4 Código del Endpoint Admin

```python
# app/api/routers/landings/solicitar_config.py (nuevo archivo)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import List, Literal
from app.api.deps import get_db, get_current_user
from app.db.models import Landing

router = APIRouter()

VALID_SECTION_TYPES = {"accessories", "wizard_steps", "insurance"}

class SolicitarSection(BaseModel):
    type: Literal["accessories", "wizard_steps", "insurance"]
    enabled: bool
    order: int

class SolicitarConfigUpdate(BaseModel):
    sections: List[SolicitarSection]

    @validator("sections")
    def validate_sections(cls, sections):
        # Must have exactly 3 sections
        if len(sections) != 3:
            raise ValueError("Must include exactly 3 sections")

        # All types must be present
        types = {s.type for s in sections}
        if types != VALID_SECTION_TYPES:
            raise ValueError(f"Must include all types: {VALID_SECTION_TYPES}")

        # Orders must be unique (1, 2, 3)
        orders = {s.order for s in sections}
        if orders != {1, 2, 3}:
            raise ValueError("Orders must be 1, 2, 3")

        return sections

@router.put("/{landing_id}/solicitar-config")
def update_solicitar_config(
    landing_id: int,
    data: SolicitarConfigUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update solicitar flow configuration for a landing.

    Allows reordering and enabling/disabling sections.
    """
    landing = db.query(Landing).filter(
        Landing.id == landing_id,
        Landing.is_active == True
    ).first()

    if not landing:
        raise HTTPException(status_code=404, detail="Landing not found")

    # Update config
    config = landing.config or {}
    config["solicitar_flow"] = {
        "sections": [s.dict() for s in sorted(data.sections, key=lambda x: x.order)]
    }
    landing.config = config

    db.commit()
    db.refresh(landing)

    return {
        "message": "Configuración actualizada",
        "sections": config["solicitar_flow"]["sections"]
    }

@router.get("/{landing_id}/solicitar-config")
def get_solicitar_config_admin(
    landing_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get solicitar config for admin panel."""
    landing = db.query(Landing).filter(
        Landing.id == landing_id,
        Landing.is_active == True
    ).first()

    if not landing:
        raise HTTPException(status_code=404, detail="Landing not found")

    config = landing.config or {}
    solicitar_flow = config.get("solicitar_flow", {
        "sections": [
            {"type": "accessories", "enabled": True, "order": 1},
            {"type": "wizard_steps", "enabled": True, "order": 2},
            {"type": "insurance", "enabled": True, "order": 3},
        ]
    })

    return solicitar_flow
```

### 3.5 Tests

#### Test Público

```python
# tests/api/routers/public/test_landing_solicitar_config.py

"""
Tests for GET /api/v1/public/landing/{slug}/solicitar-config
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetSolicitarConfig:
    """Tests for public solicitar config endpoint."""

    def test_returns_404_for_nonexistent_landing(self, client: TestClient):
        """Should return 404 for non-existent landing."""
        response = client.get("/api/v1/public/landing/nonexistent/solicitar-config")
        assert response.status_code == 404

    def test_returns_404_for_draft_landing(self, client: TestClient, db: Session):
        """Should return 404 for draft landing without preview key."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        landing = Landing(
            code="DRAFT-SC-001",
            name="Draft Landing",
            slug="draft-solicitar-config",
            status=LandingStatus.DRAFT,
        )
        db.add(landing)
        db.commit()

        response = client.get("/api/v1/public/landing/draft-solicitar-config/solicitar-config")
        assert response.status_code == 404

    def test_returns_default_config_when_not_configured(
        self, client: TestClient, db: Session
    ):
        """Should return default config when solicitar_flow is not set."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        landing = Landing(
            code="NO-CONFIG-001",
            name="No Config Landing",
            slug="no-solicitar-config",
            status=LandingStatus.ACTIVE,
            config=None,  # No config
        )
        db.add(landing)
        db.commit()

        response = client.get("/api/v1/public/landing/no-solicitar-config/solicitar-config")
        assert response.status_code == 200

        data = response.json()
        assert "sections" in data
        assert len(data["sections"]) == 3

        # Default order
        assert data["sections"][0]["type"] == "accessories"
        assert data["sections"][0]["order"] == 1
        assert data["sections"][1]["type"] == "wizard_steps"
        assert data["sections"][2]["type"] == "insurance"

    def test_returns_custom_config(self, client: TestClient, db: Session):
        """Should return custom config when configured."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        custom_config = {
            "solicitar_flow": {
                "sections": [
                    {"type": "insurance", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 2},
                    {"type": "accessories", "enabled": False, "order": 3},
                ]
            }
        }

        landing = Landing(
            code="CUSTOM-CONFIG-001",
            name="Custom Config Landing",
            slug="custom-solicitar-config",
            status=LandingStatus.ACTIVE,
            config=custom_config,
        )
        db.add(landing)
        db.commit()

        response = client.get("/api/v1/public/landing/custom-solicitar-config/solicitar-config")
        assert response.status_code == 200

        data = response.json()
        assert data["sections"][0]["type"] == "insurance"
        assert data["sections"][0]["order"] == 1
        assert data["sections"][2]["type"] == "accessories"
        assert data["sections"][2]["enabled"] == False

    def test_sections_are_sorted_by_order(self, client: TestClient, db: Session):
        """Should return sections sorted by order."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        # Config with unordered sections
        unordered_config = {
            "solicitar_flow": {
                "sections": [
                    {"type": "insurance", "enabled": True, "order": 3},
                    {"type": "accessories", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 2},
                ]
            }
        }

        landing = Landing(
            code="UNORDERED-001",
            name="Unordered Config",
            slug="unordered-solicitar-config",
            status=LandingStatus.ACTIVE,
            config=unordered_config,
        )
        db.add(landing)
        db.commit()

        response = client.get("/api/v1/public/landing/unordered-solicitar-config/solicitar-config")
        assert response.status_code == 200

        data = response.json()
        orders = [s["order"] for s in data["sections"]]
        assert orders == [1, 2, 3]

    def test_preview_access_for_draft_landing(self, client: TestClient, db: Session):
        """Should allow access to draft landing with valid preview_key."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        landing = Landing(
            code="PREVIEW-SC-001",
            name="Preview Landing",
            slug="preview-solicitar-config",
            status=LandingStatus.DRAFT,
            preview_hash="secret-preview-key-123",
        )
        db.add(landing)
        db.commit()

        # Without preview key - 404
        response = client.get("/api/v1/public/landing/preview-solicitar-config/solicitar-config")
        assert response.status_code == 404

        # With valid preview key - 200
        response = client.get(
            "/api/v1/public/landing/preview-solicitar-config/solicitar-config",
            params={"preview_key": "secret-preview-key-123"}
        )
        assert response.status_code == 200
```

#### Test Admin

```python
# tests/api/routers/test_landing_solicitar_config.py

"""
Tests for admin solicitar config endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestUpdateSolicitarConfig:
    """Tests for PUT /api/v1/landings/{id}/solicitar-config"""

    def test_requires_authentication(self, client: TestClient):
        """Should require authentication."""
        response = client.put(
            "/api/v1/landings/1/solicitar-config",
            json={"sections": []}
        )
        assert response.status_code == 401

    def test_returns_404_for_nonexistent_landing(
        self, authenticated_client: TestClient
    ):
        """Should return 404 for non-existent landing."""
        response = authenticated_client.put(
            "/api/v1/landings/99999/solicitar-config",
            json={
                "sections": [
                    {"type": "accessories", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 2},
                    {"type": "insurance", "enabled": True, "order": 3},
                ]
            }
        )
        assert response.status_code == 404

    def test_validates_section_count(
        self, authenticated_client: TestClient, sample_landing
    ):
        """Should validate that exactly 3 sections are provided."""
        response = authenticated_client.put(
            f"/api/v1/landings/{sample_landing.id}/solicitar-config",
            json={
                "sections": [
                    {"type": "accessories", "enabled": True, "order": 1},
                ]
            }
        )
        assert response.status_code == 422

    def test_validates_all_types_present(
        self, authenticated_client: TestClient, sample_landing
    ):
        """Should validate that all section types are present."""
        response = authenticated_client.put(
            f"/api/v1/landings/{sample_landing.id}/solicitar-config",
            json={
                "sections": [
                    {"type": "accessories", "enabled": True, "order": 1},
                    {"type": "accessories", "enabled": True, "order": 2},
                    {"type": "accessories", "enabled": True, "order": 3},
                ]
            }
        )
        assert response.status_code == 422

    def test_validates_unique_orders(
        self, authenticated_client: TestClient, sample_landing
    ):
        """Should validate that orders are unique (1, 2, 3)."""
        response = authenticated_client.put(
            f"/api/v1/landings/{sample_landing.id}/solicitar-config",
            json={
                "sections": [
                    {"type": "accessories", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 1},
                    {"type": "insurance", "enabled": True, "order": 1},
                ]
            }
        )
        assert response.status_code == 422

    def test_updates_config_successfully(
        self, authenticated_client: TestClient, db: Session, sample_landing
    ):
        """Should update solicitar config successfully."""
        response = authenticated_client.put(
            f"/api/v1/landings/{sample_landing.id}/solicitar-config",
            json={
                "sections": [
                    {"type": "insurance", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 2},
                    {"type": "accessories", "enabled": False, "order": 3},
                ]
            }
        )
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Configuración actualizada"
        assert data["sections"][0]["type"] == "insurance"
        assert data["sections"][2]["enabled"] == False

        # Verify in database
        db.refresh(sample_landing)
        assert sample_landing.config["solicitar_flow"]["sections"][0]["type"] == "insurance"

    def test_preserves_other_config_fields(
        self, authenticated_client: TestClient, db: Session
    ):
        """Should preserve other fields in config JSON."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        landing = Landing(
            code="PRESERVE-CONFIG",
            name="Preserve Config",
            slug="preserve-config",
            status=LandingStatus.ACTIVE,
            config={"other_setting": "value", "another": 123},
        )
        db.add(landing)
        db.commit()

        response = authenticated_client.put(
            f"/api/v1/landings/{landing.id}/solicitar-config",
            json={
                "sections": [
                    {"type": "accessories", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 2},
                    {"type": "insurance", "enabled": True, "order": 3},
                ]
            }
        )
        assert response.status_code == 200

        db.refresh(landing)
        assert landing.config["other_setting"] == "value"
        assert landing.config["another"] == 123
        assert "solicitar_flow" in landing.config


class TestGetSolicitarConfigAdmin:
    """Tests for GET /api/v1/landings/{id}/solicitar-config"""

    def test_requires_authentication(self, client: TestClient):
        """Should require authentication."""
        response = client.get("/api/v1/landings/1/solicitar-config")
        assert response.status_code == 401

    def test_returns_config(
        self, authenticated_client: TestClient, db: Session
    ):
        """Should return solicitar config for admin."""
        from app.db.models import Landing
        from app.db.models.landing import LandingStatus

        landing = Landing(
            code="ADMIN-GET",
            name="Admin Get",
            slug="admin-get",
            status=LandingStatus.ACTIVE,
            config={
                "solicitar_flow": {
                    "sections": [
                        {"type": "insurance", "enabled": True, "order": 1},
                        {"type": "accessories", "enabled": False, "order": 2},
                        {"type": "wizard_steps", "enabled": True, "order": 3},
                    ]
                }
            },
        )
        db.add(landing)
        db.commit()

        response = authenticated_client.get(f"/api/v1/landings/{landing.id}/solicitar-config")
        assert response.status_code == 200

        data = response.json()
        assert data["sections"][0]["type"] == "insurance"


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def sample_landing(db: Session):
    """Create a sample active landing."""
    from app.db.models import Landing
    from app.db.models.landing import LandingStatus

    landing = Landing(
        code="SAMPLE-SC",
        name="Sample Landing",
        slug="sample-solicitar",
        status=LandingStatus.ACTIVE,
    )
    db.add(landing)
    db.commit()
    db.refresh(landing)
    return landing
```

### 3.6 Seeders

```python
# scripts/seeders/landing/landings.py - Modificar LANDINGS_DATA

LANDINGS_DATA = [
    {
        "code": "LAND_HOME",
        "name": "Home",
        "slug": "home",
        # ... existing fields ...
        "config": {
            "solicitar_flow": {
                "sections": [
                    {"type": "accessories", "enabled": True, "order": 1},
                    {"type": "wizard_steps", "enabled": True, "order": 2},
                    {"type": "insurance", "enabled": True, "order": 3}
                ]
            }
        }
    },
    {
        "code": "LAND_LAPTOPS_EST",
        "name": "Laptops Estudiantes",
        "slug": "laptops-estudiantes",
        # ... existing fields ...
        "config": {
            "solicitar_flow": {
                "sections": [
                    {"type": "wizard_steps", "enabled": True, "order": 1},
                    {"type": "accessories", "enabled": True, "order": 2},
                    {"type": "insurance", "enabled": False, "order": 3}
                ]
            }
        }
    },
    # ... other landings with default config ...
]

# En el método seed(), agregar:
defaults={
    # ... existing fields ...
    "config": landing_data.get("config")
}
```

---

## 4. admin2 - Panel de Administración

### 4.1 Archivos a Modificar/Crear

```
admin2/
├── src/
│   ├── services/
│   │   └── landings.service.ts              # MODIFICAR: agregar métodos
│   │
│   ├── components/landings/
│   │   └── SolicitarFlowEditor.tsx          # CREAR: componente UI
│   │
│   ├── types/
│   │   └── landing.ts                       # MODIFICAR: agregar tipos
│   │
│   └── __tests__/services/
│       └── landings.service.test.ts         # MODIFICAR: agregar tests
```

### 4.2 Tipos

```typescript
// src/types/landing.ts (agregar)

export type SolicitarSectionType = 'accessories' | 'wizard_steps' | 'insurance';

export interface SolicitarSection {
  type: SolicitarSectionType;
  enabled: boolean;
  order: number;
}

export interface SolicitarFlowConfig {
  sections: SolicitarSection[];
}

export const SOLICITAR_SECTION_LABELS: Record<SolicitarSectionType, string> = {
  accessories: 'Accesorios',
  wizard_steps: 'Formulario',
  insurance: 'Seguros',
};

export const SOLICITAR_SECTION_DESCRIPTIONS: Record<SolicitarSectionType, string> = {
  accessories: 'Productos adicionales como fundas, mouses, etc.',
  wizard_steps: 'Pasos del formulario de solicitud',
  insurance: 'Planes de seguro disponibles',
};
```

### 4.3 Servicio

```typescript
// src/services/landings.service.ts (agregar métodos)

import type { SolicitarFlowConfig, SolicitarSection } from '@/types/landing';

// ... existing code ...

/**
 * Get solicitar flow configuration for a landing.
 */
async getSolicitarConfig(landingId: number): Promise<SolicitarFlowConfig> {
  const response = await apiClient.get<SolicitarFlowConfig>(
    `/landings/${landingId}/solicitar-config`
  );
  return response;
},

/**
 * Update solicitar flow configuration for a landing.
 */
async updateSolicitarConfig(
  landingId: number,
  config: SolicitarFlowConfig
): Promise<{ message: string; sections: SolicitarSection[] }> {
  const response = await apiClient.put<{ message: string; sections: SolicitarSection[] }>(
    `/landings/${landingId}/solicitar-config`,
    config
  );
  return response;
},
```

### 4.4 Componente UI

```tsx
// src/components/landings/SolicitarFlowEditor.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Switch, Button, Card, CardBody } from '@nextui-org/react';
import { GripVertical, Package, FileText, Shield, Loader2 } from 'lucide-react';
import { landingsService } from '@/services/landings.service';
import type { SolicitarSection, SolicitarSectionType } from '@/types/landing';
import { SOLICITAR_SECTION_LABELS, SOLICITAR_SECTION_DESCRIPTIONS } from '@/types/landing';
import { toast } from 'sonner';

interface Props {
  landingId: number;
}

const SECTION_ICONS: Record<SolicitarSectionType, React.ReactNode> = {
  accessories: <Package className="w-5 h-5" />,
  wizard_steps: <FileText className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />,
};

interface SortableItemProps {
  section: SolicitarSection;
  onToggle: (type: SolicitarSectionType) => void;
}

function SortableItem({ section, onToggle }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.type,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 bg-white border rounded-xl
        ${section.enabled ? 'border-neutral-200' : 'border-neutral-100 opacity-60'}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="text-neutral-600">
        {SECTION_ICONS[section.type]}
      </div>

      <div className="flex-1">
        <p className="font-medium text-neutral-800">
          {SOLICITAR_SECTION_LABELS[section.type]}
        </p>
        <p className="text-sm text-neutral-500">
          {SOLICITAR_SECTION_DESCRIPTIONS[section.type]}
        </p>
      </div>

      <Switch
        isSelected={section.enabled}
        onValueChange={() => onToggle(section.type)}
        size="sm"
      />
    </div>
  );
}

export function SolicitarFlowEditor({ landingId }: Props) {
  const [sections, setSections] = useState<SolicitarSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [landingId]);

  async function loadConfig() {
    setIsLoading(true);
    try {
      const config = await landingsService.getSolicitarConfig(landingId);
      setSections(config.sections);
    } catch (error) {
      console.error('Error loading solicitar config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.type === active.id);
    const newIndex = sections.findIndex((s) => s.type === over.id);

    const newSections = [...sections];
    const [removed] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, removed);

    // Update order values
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setSections(reordered);
    setHasChanges(true);
  }

  function handleToggle(type: SolicitarSectionType) {
    setSections((prev) =>
      prev.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s))
    );
    setHasChanges(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await landingsService.updateSolicitarConfig(landingId, { sections });
      toast.success('Configuración guardada');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving solicitar config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Flujo de Solicitud</h3>
            <p className="text-sm text-neutral-500">
              Arrastra para reordenar, activa o desactiva secciones
            </p>
          </div>
          {hasChanges && (
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isSaving}
            >
              Guardar cambios
            </Button>
          )}
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sections.map((s) => s.type)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableItem
                  key={section.type}
                  section={section}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="pt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">
            Las secciones deshabilitadas no se mostrarán en el flujo de solicitud.
            El formulario siempre incluirá los pasos configurados en el wizard.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
```

### 4.5 Tests del Servicio

```typescript
// src/__tests__/services/landings.service.test.ts (agregar)

// ============================================================================
// Solicitar Flow Config Tests
// ============================================================================

describe('landingsService.getSolicitarConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch solicitar config', async () => {
    mockGet.mockResolvedValueOnce({
      sections: [
        { type: 'accessories', enabled: true, order: 1 },
        { type: 'wizard_steps', enabled: true, order: 2 },
        { type: 'insurance', enabled: true, order: 3 },
      ],
    });

    const result = await landingsService.getSolicitarConfig(1);

    expect(mockGet).toHaveBeenCalledWith('/landings/1/solicitar-config');
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0].type).toBe('accessories');
  });

  it('should handle custom order', async () => {
    mockGet.mockResolvedValueOnce({
      sections: [
        { type: 'insurance', enabled: true, order: 1 },
        { type: 'wizard_steps', enabled: true, order: 2 },
        { type: 'accessories', enabled: false, order: 3 },
      ],
    });

    const result = await landingsService.getSolicitarConfig(1);

    expect(result.sections[0].type).toBe('insurance');
    expect(result.sections[2].enabled).toBe(false);
  });
});

describe('landingsService.updateSolicitarConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update solicitar config', async () => {
    mockPut.mockResolvedValueOnce({
      message: 'Configuración actualizada',
      sections: [
        { type: 'insurance', enabled: true, order: 1 },
        { type: 'wizard_steps', enabled: true, order: 2 },
        { type: 'accessories', enabled: false, order: 3 },
      ],
    });

    const result = await landingsService.updateSolicitarConfig(1, {
      sections: [
        { type: 'insurance', enabled: true, order: 1 },
        { type: 'wizard_steps', enabled: true, order: 2 },
        { type: 'accessories', enabled: false, order: 3 },
      ],
    });

    expect(mockPut).toHaveBeenCalledWith('/landings/1/solicitar-config', {
      sections: expect.arrayContaining([
        expect.objectContaining({ type: 'insurance', order: 1 }),
      ]),
    });
    expect(result.message).toBe('Configuración actualizada');
  });

  it('should send sections in correct order', async () => {
    mockPut.mockResolvedValueOnce({ message: 'Updated', sections: [] });

    await landingsService.updateSolicitarConfig(1, {
      sections: [
        { type: 'wizard_steps', enabled: true, order: 1 },
        { type: 'accessories', enabled: true, order: 2 },
        { type: 'insurance', enabled: true, order: 3 },
      ],
    });

    const callArg = mockPut.mock.calls[0][1];
    expect(callArg.sections[0].order).toBe(1);
    expect(callArg.sections[1].order).toBe(2);
    expect(callArg.sections[2].order).toBe(3);
  });
});
```

---

## 5. webpage3.0 - Frontend

### 5.1 Archivos a Modificar/Crear

```
webpage3.0/
├── src/app/prototipos/0.6/
│   ├── services/
│   │   ├── landingApi.ts                    # MODIFICAR: agregar función
│   │   └── landingApi.test.ts               # CREAR: tests
│   │
│   └── [landing]/solicitar/
│       ├── hooks/
│       │   └── useSolicitarFlow.ts          # CREAR: hook
│       │
│       ├── components/solicitar/
│       │   ├── SolicitarFlowRenderer.tsx    # CREAR: renderizador dinámico
│       │   ├── AccessoriesSection.tsx       # CREAR: sección extraída
│       │   └── InsuranceSection.tsx         # CREAR: sección extraída
│       │
│       └── solicitarClient.tsx              # MODIFICAR: usar renderizador
```

### 5.2 Tipos

```typescript
// src/app/prototipos/0.6/[landing]/solicitar/types/solicitarFlow.ts

export type SolicitarSectionType = 'accessories' | 'wizard_steps' | 'insurance';

export interface SolicitarSection {
  type: SolicitarSectionType;
  enabled: boolean;
  order: number;
}

export interface SolicitarFlowConfig {
  sections: SolicitarSection[];
}

export const DEFAULT_SOLICITAR_FLOW: SolicitarFlowConfig = {
  sections: [
    { type: 'accessories', enabled: true, order: 1 },
    { type: 'wizard_steps', enabled: true, order: 2 },
    { type: 'insurance', enabled: true, order: 3 },
  ],
};
```

### 5.3 API

```typescript
// src/app/prototipos/0.6/services/landingApi.ts (agregar)

import type { SolicitarFlowConfig } from '../[landing]/solicitar/types/solicitarFlow';
import { DEFAULT_SOLICITAR_FLOW } from '../[landing]/solicitar/types/solicitarFlow';

/**
 * Get solicitar flow configuration for a landing.
 * Returns default config if not configured or on error.
 */
export async function getLandingSolicitarConfig(
  landingSlug: string
): Promise<SolicitarFlowConfig> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/landing/${landingSlug}/solicitar-config`
    );

    if (!response.ok) {
      console.warn(`Solicitar config not found for ${landingSlug}, using default`);
      return DEFAULT_SOLICITAR_FLOW;
    }

    const data = await response.json();
    return data as SolicitarFlowConfig;
  } catch (error) {
    console.error('Error fetching solicitar config:', error);
    return DEFAULT_SOLICITAR_FLOW;
  }
}
```

### 5.4 Hook

```typescript
// src/app/prototipos/0.6/[landing]/solicitar/hooks/useSolicitarFlow.ts

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getLandingSolicitarConfig } from '@/app/prototipos/0.6/services/landingApi';
import type { SolicitarFlowConfig, SolicitarSection } from '../types/solicitarFlow';
import { DEFAULT_SOLICITAR_FLOW } from '../types/solicitarFlow';

interface UseSolicitarFlowResult {
  config: SolicitarFlowConfig;
  isLoading: boolean;
  error: string | null;
  enabledSections: SolicitarSection[];
  hasAccessories: boolean;
  hasInsurance: boolean;
  hasWizardSteps: boolean;
  getNextSection: (currentType: string) => SolicitarSection | null;
  getPrevSection: (currentType: string) => SolicitarSection | null;
}

export function useSolicitarFlow(landingSlug: string): UseSolicitarFlowResult {
  const [config, setConfig] = useState<SolicitarFlowConfig>(DEFAULT_SOLICITAR_FLOW);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      setError(null);

      try {
        const flowConfig = await getLandingSolicitarConfig(landingSlug);
        setConfig(flowConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading config');
        setConfig(DEFAULT_SOLICITAR_FLOW);
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [landingSlug]);

  const enabledSections = useMemo(
    () => config.sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    [config.sections]
  );

  const hasAccessories = useMemo(
    () => enabledSections.some((s) => s.type === 'accessories'),
    [enabledSections]
  );

  const hasInsurance = useMemo(
    () => enabledSections.some((s) => s.type === 'insurance'),
    [enabledSections]
  );

  const hasWizardSteps = useMemo(
    () => enabledSections.some((s) => s.type === 'wizard_steps'),
    [enabledSections]
  );

  function getNextSection(currentType: string): SolicitarSection | null {
    const currentIndex = enabledSections.findIndex((s) => s.type === currentType);
    if (currentIndex === -1 || currentIndex >= enabledSections.length - 1) {
      return null;
    }
    return enabledSections[currentIndex + 1];
  }

  function getPrevSection(currentType: string): SolicitarSection | null {
    const currentIndex = enabledSections.findIndex((s) => s.type === currentType);
    if (currentIndex <= 0) {
      return null;
    }
    return enabledSections[currentIndex - 1];
  }

  return {
    config,
    isLoading,
    error,
    enabledSections,
    hasAccessories,
    hasInsurance,
    hasWizardSteps,
    getNextSection,
    getPrevSection,
  };
}
```

### 5.5 Tests

```typescript
// src/app/prototipos/0.6/services/landingApi.test.ts (agregar)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLandingSolicitarConfig } from './landingApi';
import { DEFAULT_SOLICITAR_FLOW } from '../[landing]/solicitar/types/solicitarFlow';

describe('getLandingSolicitarConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch and return solicitar config', async () => {
    const mockConfig = {
      sections: [
        { type: 'insurance', enabled: true, order: 1 },
        { type: 'wizard_steps', enabled: true, order: 2 },
        { type: 'accessories', enabled: false, order: 3 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConfig),
    });

    const result = await getLandingSolicitarConfig('home');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/public/landing/home/solicitar-config')
    );
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0].type).toBe('insurance');
  });

  it('should return default config on 404', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await getLandingSolicitarConfig('nonexistent');

    expect(result).toEqual(DEFAULT_SOLICITAR_FLOW);
  });

  it('should return default config on network error', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const result = await getLandingSolicitarConfig('home');

    expect(result).toEqual(DEFAULT_SOLICITAR_FLOW);
  });

  it('should handle malformed response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const result = await getLandingSolicitarConfig('home');

    expect(result).toEqual(DEFAULT_SOLICITAR_FLOW);
  });
});
```

---

## 6. Checklist de Implementación

### Fase 1: webservice2 (Backend)

- [ ] Agregar endpoint público `GET /{slug}/solicitar-config` en `public/landing.py`
- [ ] Crear archivo `routers/landings/solicitar_config.py` con endpoints admin
- [ ] Registrar router en `main.py`
- [ ] Crear tests `tests/api/routers/public/test_landing_solicitar_config.py`
- [ ] Crear tests `tests/api/routers/test_landing_solicitar_config.py`
- [ ] Modificar seeder `landings.py` para incluir `solicitar_flow` en config
- [ ] Ejecutar tests: `pytest tests/api/routers/public/test_landing_solicitar_config.py -v`
- [ ] Ejecutar tests: `pytest tests/api/routers/test_landing_solicitar_config.py -v`

### Fase 2: admin2 (Panel)

- [ ] Agregar tipos en `types/landing.ts`
- [ ] Agregar métodos en `services/landings.service.ts`
- [ ] Crear componente `SolicitarFlowEditor.tsx`
- [ ] Agregar tests en `__tests__/services/landings.service.test.ts`
- [ ] Integrar componente en página de edición de landing
- [ ] Ejecutar tests: `npm test -- landings.service.test.ts`

### Fase 3: webpage3.0 (Frontend)

- [ ] Agregar tipos en `solicitar/types/solicitarFlow.ts`
- [ ] Agregar función en `services/landingApi.ts`
- [ ] Crear hook `hooks/useSolicitarFlow.ts`
- [ ] Crear tests `services/landingApi.test.ts`
- [ ] Refactorizar `solicitarClient.tsx` para usar renderizado dinámico
- [ ] Ejecutar tests: `npm test`

### Fase 4: Validación

- [ ] Test E2E: Crear landing sin config → debe usar default
- [ ] Test E2E: Modificar config desde admin → verificar en frontend
- [ ] Test E2E: Deshabilitar sección → no debe aparecer en flujo
- [ ] Test E2E: Reordenar secciones → debe reflejarse en flujo

---

## 7. Notas de Implementación

### Consideraciones de Migración

1. **Sin migración de BD requerida**: El campo `config` JSON ya existe
2. **Backwards compatible**: Landings sin config usan valores por defecto
3. **Sin downtime**: Los cambios son aditivos

### Dependencias Externas

**admin2:**
- `@dnd-kit/core` - Ya instalado para otros componentes drag & drop
- `@dnd-kit/sortable` - Ya instalado

### Estimación de Líneas de Código

| Proyecto | Archivos | Líneas (aprox) |
|----------|----------|----------------|
| webservice2 | 4 | ~400 |
| admin2 | 3 | ~300 |
| webpage3.0 | 4 | ~250 |
| **Total** | **11** | **~950** |

---

## 8. Referencias

- `webservice2/app/db/models/landing.py:227` - Campo `config` JSON
- `webservice2/app/api/routers/public/landing.py` - Endpoints públicos existentes
- `webpage3.0/.../solicitar/solicitarClient.tsx` - Componente actual
- `admin2/src/__tests__/services/landings.service.test.ts` - Patrón de tests
