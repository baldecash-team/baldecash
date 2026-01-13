# Propuesta de Distribución de Base de Datos - BaldeCash

**Versión:** 1.0 | **Fecha:** Diciembre 2025 | **Total Tablas:** 99

---

## 1. Contexto

Con **99 tablas** en el sistema, es importante considerar estrategias de distribución para:
- Optimizar el rendimiento
- Escalar horizontalmente
- Separar cargas de trabajo (OLTP vs OLAP)
- Facilitar el mantenimiento

---

## 2. Propuestas de Distribución

### Propuesta A: Separación por Dominio de Negocio (Microservicios)

Dividir la base de datos en **5 esquemas/bases de datos** según dominio:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA DE MICROSERVICIOS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│  │   CATALOG_DB       │  │   CUSTOMER_DB      │  │   ANALYTICS_DB     │    │
│  │   (22 tablas)      │  │   (25 tablas)      │  │   (20 tablas)      │    │
│  ├────────────────────┤  ├────────────────────┤  ├────────────────────┤    │
│  │ • category         │  │ • person           │  │ • session          │    │
│  │ • brand            │  │ • person_*_history │  │ • page_view        │    │
│  │ • product          │  │ • application      │  │ • event_*          │    │
│  │ • spec_*           │  │ • application_*    │  │ • traffic_source   │    │
│  │ • tag, product_tag │  │ • document_*       │  │ • daily_snapshot   │    │
│  │ • product_image    │  │ • equifax_*        │  │ • session_product  │    │
│  │ • product_pricing  │  │ • loan             │  │                    │    │
│  │ • accessory*       │  │ • loan_*           │  │                    │    │
│  │ • insurance        │  │                    │  │                    │    │
│  │ • combo*           │  │                    │  │                    │    │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘    │
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐                            │
│  │   CONFIG_DB        │  │   MARKETING_DB     │                            │
│  │   (24 tablas)      │  │   (22 tablas)      │                            │
│  ├────────────────────┤  ├────────────────────┤                            │
│  │ • institution      │  │ • lead             │                            │
│  │ • institution_*    │  │ • lead_*           │                            │
│  │ • career           │  │ • preapproved_*    │                            │
│  │ • agreement        │  │ • marketing_camp*  │                            │
│  │ • landing_*        │  │ • campaign_*       │                            │
│  │ • form_*           │  │ • referral*        │                            │
│  │ • filter_*         │  │                    │                            │
│  │ • user_account     │  │                    │                            │
│  └────────────────────┘  └────────────────────┘                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Ventajas:
- Equipos pueden trabajar independientemente
- Escalado granular por servicio
- Fallos aislados
- Deployments independientes

#### Desventajas:
- Complejidad de joins entre servicios
- Necesidad de API Gateway
- Consistencia eventual
- Mayor overhead operacional

#### Caso de uso:
Empresas con múltiples equipos de desarrollo y alta necesidad de escalabilidad.

---

### Propuesta B: Separación OLTP/OLAP (Read/Write Split)

Dividir en **2 bases de datos** según patrón de acceso:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA OLTP / OLAP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────┐    ┌─────────────────────────────┐ │
│  │         OLTP_DB (PRIMARY)           │    │     OLAP_DB (ANALYTICS)     │ │
│  │         ~65 tablas                  │    │     ~34 tablas              │ │
│  │         MySQL/PostgreSQL            │    │     ClickHouse/BigQuery     │ │
│  ├─────────────────────────────────────┤    ├─────────────────────────────┤ │
│  │                                     │    │                             │ │
│  │  WRITES + READS TRANSACCIONALES     │    │  READS ANALÍTICOS           │ │
│  │                                     │    │                             │ │
│  │  • Products, Catalog                │    │  • session (particionada)   │ │
│  │  • Landing Config                   │    │  • page_view                │ │
│  │  • Forms                            │    │  • event_* (todas)          │ │
│  │  • Applications                     │    │  • daily_snapshot           │ │
│  │  • Persons                          │    │  • Agregaciones pre-calc    │ │
│  │  • Leads (activos)                  │    │  • lead_history             │ │
│  │  • Marketing campaigns              │    │  • Métricas de conversión   │ │
│  │                                     │    │                             │ │
│  └─────────────────────────────────────┘    └─────────────────────────────┘ │
│                    │                                      ▲                  │
│                    │        CDC / ETL Pipeline            │                  │
│                    └──────────────────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Ventajas:
- Optimización específica por carga
- Analytics no afecta operaciones
- OLAP optimizado para agregaciones
- Queries pesadas aisladas

#### Desventajas:
- Latencia en datos analíticos (CDC delay)
- Duplicación de datos
- Complejidad de sincronización

#### Caso de uso:
Sistemas con alto volumen de analytics y reportes que impactan el rendimiento operacional.

---

### Propuesta C: Modelo Híbrido (Recomendado)

Combinación de **3 capas**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA HÍBRIDA (RECOMENDADA)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌─────────────────────────┐                          │
│                         │      LOAD BALANCER      │                          │
│                         └───────────┬─────────────┘                          │
│                                     │                                        │
│              ┌──────────────────────┼──────────────────────┐                │
│              │                      │                      │                │
│              ▼                      ▼                      ▼                │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │   PRIMARY (WRITE)   │ │   REPLICA 1 (READ)  │ │   REPLICA 2 (READ)  │   │
│  │   MySQL 8.0         │ │   MySQL 8.0         │ │   MySQL 8.0         │   │
│  │   99 tablas         │ │   UI Tables only    │ │   Backend tables    │   │
│  │                     │ │   42 tablas         │ │   57 tablas         │   │
│  └─────────┬───────────┘ └─────────────────────┘ └─────────────────────┘   │
│            │                                                                 │
│            │  CDC (Debezium)                                                │
│            ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DATA WAREHOUSE                                  │   │
│  │                      (ClickHouse / BigQuery)                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • session_fact (particionada por día)                              │   │
│  │  • events_fact (particionada por día)                               │   │
│  │  • conversion_funnel (agregada)                                     │   │
│  │  • daily_metrics (pre-calculada)                                    │   │
│  │  • cohort_analysis                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detalles:

| Componente | Función | Tablas | Tecnología |
|------------|---------|--------|------------|
| **Primary** | Todas las escrituras | 99 | MySQL 8.0 |
| **Replica UI** | Lecturas del frontend | 42 | MySQL 8.0 (filtered replication) |
| **Replica Backend** | Lecturas internas | 57 | MySQL 8.0 (filtered replication) |
| **Data Warehouse** | Analytics histórico | Agregadas | ClickHouse |

#### Ventajas:
- Balance entre simplicidad y escalabilidad
- Reads distribuidos por tipo de carga
- Analytics no impacta operaciones
- Single source of truth (Primary)
- Failover automático

#### Implementación por fases:

**Fase 1 (Mes 1-2):**
- Primary + 1 Replica general

**Fase 2 (Mes 3-4):**
- Separar réplicas por UI/Backend

**Fase 3 (Mes 5-6):**
- Agregar Data Warehouse con CDC

---

## 3. Particionamiento de Tablas de Alto Volumen

### Tablas candidatas:

| Tabla | Estrategia | Particiones | Retención |
|-------|------------|-------------|-----------|
| `session` | RANGE por mes | 24 particiones | 24 meses |
| `page_view` | RANGE por mes | 12 particiones | 12 meses |
| `event_click` | RANGE por mes | 6 particiones | 6 meses |
| `event_scroll` | RANGE por mes | 6 particiones | 6 meses |
| `event_*` (otros) | RANGE por mes | 6 particiones | 6 meses |
| `lead` | LIST por status | 8 particiones | 36 meses |

### Ejemplo de particionamiento:

```sql
-- session particionada por mes
ALTER TABLE session PARTITION BY RANGE (TO_DAYS(started_at)) (
  PARTITION p_2025_01 VALUES LESS THAN (TO_DAYS('2025-02-01')),
  PARTITION p_2025_02 VALUES LESS THAN (TO_DAYS('2025-03-01')),
  PARTITION p_2025_03 VALUES LESS THAN (TO_DAYS('2025-04-01')),
  -- ...continuar por cada mes
  PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Procedimiento para agregar particiones automáticamente
DELIMITER //
CREATE PROCEDURE add_session_partition()
BEGIN
  DECLARE next_month DATE;
  SET next_month = DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY);

  SET @sql = CONCAT(
    'ALTER TABLE session REORGANIZE PARTITION p_future INTO (',
    'PARTITION p_', DATE_FORMAT(next_month, '%Y_%m'),
    ' VALUES LESS THAN (TO_DAYS(''', DATE_ADD(next_month, INTERVAL 1 MONTH), ''')),',
    'PARTITION p_future VALUES LESS THAN MAXVALUE)'
  );

  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- Programar ejecución mensual
CREATE EVENT add_monthly_partition
ON SCHEDULE EVERY 1 MONTH
STARTS '2025-01-01 00:00:00'
DO CALL add_session_partition();
```

---

## 4. Sharding (Escenario de Alto Crecimiento)

Si el sistema crece a millones de usuarios, considerar sharding:

### Estrategia: Shard por `landing_id`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHARDING POR LANDING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   SHARD 1       │  │   SHARD 2       │  │   SHARD 3       │             │
│  │   landing 1-50  │  │   landing 51-100│  │   landing 101+  │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ • session       │  │ • session       │  │ • session       │             │
│  │ • page_view     │  │ • page_view     │  │ • page_view     │             │
│  │ • event_*       │  │ • event_*       │  │ • event_*       │             │
│  │ • lead          │  │ • lead          │  │ • lead          │             │
│  │ • application   │  │ • application   │  │ • application   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    GLOBAL TABLES (No sharding)                       │   │
│  │  • product, brand, category (catálogo compartido)                   │   │
│  │  • landing, landing_config (configuración compartida)               │   │
│  │  • user_account (usuarios internos)                                 │   │
│  │  • person (datos de clientes - shard por document_number?)          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Caching Strategy

### Capas de cache:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CACHING LAYERS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        L1: Application Cache                         │   │
│  │                        (In-memory, per-instance)                     │   │
│  │  • Form definitions                 TTL: 30 min                      │   │
│  │  • Landing config                   TTL: 15 min                      │   │
│  │  • Feature flags                    TTL: 5 min                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        L2: Distributed Cache                         │   │
│  │                        (Redis Cluster)                               │   │
│  │  • Product catalog                  TTL: 5 min                       │   │
│  │  • Product pricing                  TTL: 5 min                       │   │
│  │  • Landing products                 TTL: 5 min                       │   │
│  │  • Session data                     TTL: 30 min                      │   │
│  │  • Preapproved lookup               TTL: 10 min                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        L3: CDN Cache                                 │   │
│  │                        (CloudFront/Cloudflare)                       │   │
│  │  • Product images                   TTL: 24 hours                    │   │
│  │  • Brand logos                      TTL: 7 days                      │   │
│  │  • Static assets                    TTL: 30 days                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cache keys sugeridos:

```
# Products
products:landing:{landing_id}:page:{page}
product:detail:{product_id}
product:pricing:{product_id}

# Landing
landing:config:{slug}
landing:products:{landing_id}
landing:filters:{landing_id}

# Session
session:{session_uuid}
preapproved:offer:{offer_code}
```

---

## 6. Comparación de Propuestas

| Criterio | Propuesta A | Propuesta B | Propuesta C |
|----------|-------------|-------------|-------------|
| Complejidad | Alta | Media | Media |
| Costo infraestructura | Alto | Medio | Medio |
| Escalabilidad | Muy alta | Alta | Alta |
| Time to implement | 6-12 meses | 3-6 meses | 2-4 meses |
| Equipos requeridos | 4+ | 2-3 | 2 |
| Consistencia datos | Eventual | Eventual | Fuerte (Primary) |
| Mantenimiento | Complejo | Medio | Simple |

---

## 7. Recomendación Final

### Para BaldeCash, recomiendo **Propuesta C (Híbrida)** porque:

1. **Balance costo/beneficio**: No requiere inversión masiva inicial
2. **Escalable**: Permite crecer según demanda
3. **Implementación gradual**: No requiere big-bang migration
4. **Equipo actual**: No necesita restructuración de equipos
5. **Flexibilidad**: Fácil agregar sharding si crece mucho

### Roadmap sugerido:

| Fase | Actividad | Duración |
|------|-----------|----------|
| 1 | Implementar réplica de lectura | 2 semanas |
| 2 | Particionar tablas de eventos | 2 semanas |
| 3 | Implementar Redis cache | 2 semanas |
| 4 | Separar réplicas UI/Backend | 2 semanas |
| 5 | Configurar Data Warehouse | 4 semanas |
| 6 | Migrar analytics a DW | 4 semanas |

**Total: ~4 meses para implementación completa**

---

## 8. Estimación de Costos (AWS)

| Componente | Spec | Costo mensual |
|------------|------|---------------|
| Primary (db.r6g.xlarge) | 4 vCPU, 32GB | ~$350 |
| Replica UI (db.r6g.large) | 2 vCPU, 16GB | ~$175 |
| Replica Backend (db.r6g.large) | 2 vCPU, 16GB | ~$175 |
| Redis (cache.r6g.large) | 2 vCPU, 13GB | ~$150 |
| ClickHouse (m6i.xlarge) | 4 vCPU, 16GB | ~$200 |
| **Total** | | **~$1,050/mes** |

*Nota: Costos aproximados, pueden variar según región y reservas.*

---

**Documento generado automáticamente** | **Propuesta de arquitectura para 99 tablas**
