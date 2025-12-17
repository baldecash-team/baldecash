# Documentación BaldeCash - Sistema Versionado

## Estructura

```
.claude/docs/
├── README.md                        # Este archivo
├── PLAN_ITERACION_SECCIONES.md     # Plan general de iteraciones
└── {VERSION}/                       # Carpeta por versión
    └── section-specs/
        ├── README.md
        ├── PROMPT_01_HERO_LANDING.md
        ├── PROMPT_02_CATALOGO_LAYOUT_FILTROS.md
        └── ...
```

## Versiones Disponibles

| Versión | Estado | Descripción |
|---------|--------|-------------|
| 0.3 | Activa | Hero 2.0, Catálogo, Wizard |

## Uso con /iterar

El comando `/iterar` usa la versión para localizar los docs:

```bash
/iterar 01 0.3    # Lee .claude/docs/0.3/section-specs/PROMPT_01_*.md
/iterar 02 0.4    # Lee .claude/docs/0.4/section-specs/PROMPT_02_*.md
```

## Crear Nueva Versión

Para crear una nueva versión (ej: 0.4):

1. Copiar carpeta existente:
   ```bash
   cp -r .claude/docs/0.3 .claude/docs/0.4
   ```

2. Modificar los PROMPTs según los cambios requeridos

3. Crear config.json en `public/prototipos/0.4/config.json`

4. Los componentes se generarán en `src/app/prototipos/0.4/`
