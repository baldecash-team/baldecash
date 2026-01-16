'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Chip, Button, Select, SelectItem, Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { ArrowLeft, MessageSquareText, Users, Layers, ImageIcon, AlertTriangle, Filter, ExternalLink, X, ChevronLeft, ChevronRight, Check, Circle } from 'lucide-react';
import { CubeGridSpinner, Toast, useToast } from '@/app/prototipos/_shared';

interface Attachment {
  id: number;
  attachment: string;
  attachment_url: string;
}

interface FeedbackItem {
  id: number;
  user: string;
  comments: string;
  url: string;
  section: string;
  fixed: boolean;
  created_at: string;
  attachments: Attachment[];
}

interface ApiResponse {
  success: boolean;
  data: FeedbackItem[];
}

const API_URL = 'https://ws.baldecash.com/api/feedback';
const BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3IiwianRpIjoiMmMyZWE0ZDc3OTQwZWY2ZTdmMzJlOGRkMjUwNjRhYTdhNjIyNDRmMzUzMDBkOTcyMGFjY2FhMWQxZmU4OTE2MzUxOGEwMDkzMGViZTc2NGQiLCJpYXQiOjE3NDIzMzc0OTEuMjExMzUsIm5iZiI6MTc0MjMzNzQ5MS4yMTEzNTMsImV4cCI6MTc3Mzg3MzQ5MS4xOTQ0NTUsInN1YiI6IjEiLCJzY29wZXMiOlsiKiJdfQ.GmljQKk_hSEzVFlRfZMYRpt1jtBc_Fl27Vt2UEeMT5lwN4ms1w84f-dJOObRDUyzh4--DONHc7O1WZ36SjttIqmPotbSw9UWRlrA0cDrhGzmwt6nQGAAqCth1g8pkgu5tXb737wbDq8hTHtu5FU05nLrs2bYqxtbjgp500VoQB23_xEi-5FybCX0pM3i38F6VeyPoduIiY7-FRiUq6tw153uSIcCjNpZGwkffBqw6hxQ0rgGe8G_ytFbMxha_Z0zuDL5oqXtEE2U2w4mIG2_cKygysbyPOd3Qkq_LLD_lRpOWHPASrxLdVQGpLkayCBXzHb4B-Qr0Z7zQz9LqZADqojck5J8R4ZitmPpGwHbQvh6t6IbsJuXRq9mFE37VPpqxvmHyJzo_4uM5Rm0K-jKvZ4WggUddAjDn8untElx1ncMjCmFs_kOcpnoUStv3aOQGk75635_WImjTStt05BQ_EmDoRZizUqZ2zVhlrxjmgnv1SxEiPL4jDK9jaLJWUnS2MPQX4yzhd6xwhFk0LI677xpMOiag-kFU5nC3naIc9bZBKj_Ekt1UyMejPL4KqMQsBk6g40eD6ju8qVEjNEZxYCLtgD6Qr8_dheXfXiDTQQltgrG-qSzio888E_ygdq2cawS73zf5edQiau_p_wpodbCl1O6r5BzZhRuaFF0zAA';

const SECTION_LABELS: Record<string, string> = {
  // Hero & Landing
  'hero': 'Hero',
  'landing': 'Landing',

  // Catálogo
  'catalogo': 'Catálogo',
  'estados-vacios': 'Estados Vacíos',
  'detalle': 'Detalle Producto',
  'comparador': 'Comparador',
  'quiz': 'Quiz',
  'upsell': 'Upsell',

  // Convenio
  'convenio': 'Convenio',

  // Wizard Solicitud
  'wizard-solicitud-intro': 'Wizard Solicitud Intro',
  'wizard-solicitud-datos-personales': 'Wizard Solicitud Datos Personales',
  'wizard-solicitud-datos-academicos': 'Wizard Solicitud Datos Académicos',
  'wizard-solicitud-datos-economicos': 'Wizard Solicitud Datos Económicos',
  'wizard-solicitud-resumen': 'Wizard Solicitud Resumen',
  'wizard-solicitud-seguros': 'Wizard Solicitud Seguros',
  'wizard-solicitud-resultados': 'Wizard Solicitud Resultados',

  // Resultados
  'aprobacion': 'Aprobación',
  'rechazo': 'Rechazo',
  'recibido': 'Recibido',

  // Legal
  'legal': 'Legal',
  'libro-reclamaciones': 'Libro de Reclamaciones',

  // Otros
  'proximamente': 'Próximamente',
};

const ISSUE_CATEGORIES = {
  ui: { label: 'Visual', className: 'bg-amber-100 text-amber-700' },
  functionality: { label: 'Funcionalidad', className: 'bg-red-100 text-red-700' },
  ux: { label: 'Usabilidad', className: 'bg-blue-100 text-blue-700' },
  system: { label: 'Otros', className: 'bg-neutral-100 text-neutral-600' },
};

function classifyIssue(comment: string): keyof typeof ISSUE_CATEGORIES {
  const lower = comment.toLowerCase();

  // Funcionalidad: cosas que no funcionan o están rotas
  const functionalityKeywords = [
    'no funciona', 'no funcionan', 'roto', 'no te manda', 'no deja',
    'error', 'falla', 'bug', 'crash', 'no carga', 'no abre', 'no cierra',
    'no guarda', 'no envía', 'no responde'
  ];
  if (functionalityKeywords.some(kw => lower.includes(kw))) {
    return 'functionality';
  }

  // UI/Visual: apariencia, estilos, diseño visual
  const uiKeywords = [
    'centrado', 'sombra', 'overflow', 'responsive', 'alineado', 'alineación',
    'salen del', 'sobrepone', 'fondo', 'opacidad', 'tamaño', 'color',
    'estilo', 'margen', 'padding', 'borde', 'espaciado', 'fuente',
    'imagen', 'icono', 'animación', 'drawer', 'modal', 'altura', 'ancho',
    'visible', 'oculto', 'transparente', 'estandarizar', 'consistente',
    'desalineado', 'encuadre', 'visual', 'tag', 'badge', 'card',
    // Nuevos keywords detectados del análisis de feedback real
    'botón', 'botones', 'mobile', 'desktop', 'tapa', 'tapan', 'posición',
    'fijo', 'fija', 'formato', 'tooltip', 'tooltips', 'px', 'porcentaje',
    'letra', 'texto', 'resaltar', 'sticky', 'navbar', 'footer', 'header'
  ];
  if (uiKeywords.some(kw => lower.includes(kw))) {
    return 'ui';
  }

  // UX/Usabilidad: experiencia, flujos, interacción
  const uxKeywords = [
    'utilidad', 'diferencia', 'dinámicas', 'interactivo', 'confuso',
    'difícil', 'navegación', 'flujo', 'experiencia', 'intuitivo',
    'feedback', 'click', 'doble click', 'scroll', 'usabilidad',
    // Nuevos keywords detectados del análisis de feedback real
    'disabled', 'deshabilitado', 'validación', 'problema', 'claro',
    'debería', 'reemplazar', 'cambiar', 'agregar', 'quitar', 'mostrar',
    'ocultar', 'seleccionar', 'selección', 'opción', 'opciones'
  ];
  if (uxKeywords.some(kw => lower.includes(kw))) {
    return 'ux';
  }

  return 'system';
}

export default function FeedbackReportPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FeedbackReportContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <CubeGridSpinner />
    </div>
  );
}

function FeedbackReportContent() {
  const router = useRouter();

  const [data, setData] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<Set<string>>(new Set());
  const [filterUser, setFilterUser] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<Set<string>>(new Set());
  const [filterFixed, setFilterFixed] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(true);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; images: Attachment[]; currentIndex: number }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast();

  // Preloading: dar tiempo a la página para cargar recursos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Accept': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Error al cargar datos');
        const json: ApiResponse = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error('API retornó success: false');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const sections: Record<string, number> = {};
    const users: Record<string, number> = {};
    const categories: Record<string, number> = { ui: 0, functionality: 0, ux: 0, system: 0 };
    let withAttachments = 0;
    let fixedCount = 0;

    data.forEach((item) => {
      sections[item.section] = (sections[item.section] || 0) + 1;
      users[item.user] = (users[item.user] || 0) + 1;
      categories[classifyIssue(item.comments)]++;
      if (item.attachments.length > 0) withAttachments++;
      if (item.fixed) fixedCount++;
    });

    return { sections, users, categories, withAttachments, fixedCount, total: data.length };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterSection.size > 0 && !filterSection.has(item.section)) return false;
      if (filterUser.size > 0 && !filterUser.has(item.user)) return false;
      if (filterCategory.size > 0 && !filterCategory.has(classifyIssue(item.comments))) return false;
      if (filterFixed.size > 0) {
        const itemStatus = item.fixed ? 'fixed' : 'pending';
        if (!filterFixed.has(itemStatus)) return false;
      }
      return true;
    });
  }, [data, filterSection, filterUser, filterCategory, filterFixed]);

  const uniqueSections = useMemo(() => Object.keys(stats.sections), [stats.sections]);
  const uniqueUsers = useMemo(() => Object.keys(stats.users), [stats.users]);

  const openImageModal = (images: Attachment[], startIndex = 0) => {
    setImageModal({ isOpen: true, images, currentIndex: startIndex });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, images: [], currentIndex: 0 });
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex: direction === 'next'
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const clearFilters = () => {
    setFilterSection(new Set());
    setFilterUser(new Set());
    setFilterCategory(new Set());
    setFilterFixed(new Set());
  };

  const hasActiveFilters = filterSection.size > 0 || filterUser.size > 0 || filterCategory.size > 0 || filterFixed.size > 0;

  // Helper para toggle de valores en Set
  const toggleSetValue = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setter(newSet);
  };

  const toggleFixed = async (id: number, currentFixed: boolean) => {
    try {
      const res = await fetch(`https://ws.baldecash.com/api/feedback/${id}/fixed`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fixed: !currentFixed }),
      });
      if (res.ok) {
        setData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, fixed: !currentFixed } : item
          )
        );
        // Mostrar toast de confirmación
        if (!currentFixed) {
          showToast('Feedback marcado como revisado', 'success');
        } else {
          showToast('Feedback marcado como pendiente', 'warning');
        }
      } else {
        showToast('Error al actualizar el estado', 'error');
      }
    } catch (err) {
      console.error('Error updating fixed status:', err);
      showToast('Error de conexión', 'error');
    }
  };

  // Show preloader while resources load
  if (isPreloading || loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Error al cargar</h2>
            <p className="text-neutral-500">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .donut-segment {
          transition: stroke-width 0.2s ease, opacity 0.2s ease;
          cursor: pointer;
        }
        .donut-segment:hover {
          stroke-width: 16 !important;
        }
      `}</style>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8 print:mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-10 object-contain"
              />
              <div className="h-8 w-px bg-neutral-200" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Reporte de Feedback</h1>
                <p className="text-neutral-500 text-sm">Prototipos v0.5 - {new Date().toLocaleDateString('es-PE')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <MessageSquareText className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                  <p className="text-xs text-neutral-500">Total Feedback</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{uniqueUsers.length}</p>
                  <p className="text-xs text-neutral-500">Testers</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{uniqueSections.length}</p>
                  <p className="text-xs text-neutral-500">Secciones</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{Math.round((stats.withAttachments / stats.total) * 100)}%</p>
                  <p className="text-xs text-neutral-500">Con Screenshot</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Progress Card */}
        <section className="mb-8">
          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-neutral-600">Revisados:</span>
                    <span className="text-lg font-bold text-emerald-600">{stats.fixedCount}</span>
                  </div>
                  <div className="h-6 w-px bg-neutral-200" />
                  <div className="flex items-center gap-2">
                    <Circle className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm text-neutral-600">Pendientes:</span>
                    <span className="text-lg font-bold text-neutral-700">{stats.total - stats.fixedCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.fixedCount / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {stats.total > 0 ? Math.round((stats.fixedCount / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Charts Row */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          {/* By Section - Donut Chart */}
          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Por Sección</h3>
              <div className="flex flex-col items-center">
                {/* Donut Chart */}
                <div className="relative w-40 h-40 mb-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      const sectionColors = ['#4654CD', '#03DBD0', '#8B5CF6', '#F59E0B', '#EC4899'];
                      const entries = Object.entries(stats.sections).sort((a, b) => b[1] - a[1]);
                      let offset = 0;
                      const circumference = 2 * Math.PI * 35;
                      return entries.map(([section, count], idx) => {
                        const percentage = count / stats.total;
                        const strokeDash = percentage * circumference;
                        const currentOffset = offset;
                        offset += percentage * circumference;
                        const isActive = filterSection.has(section);
                        return (
                          <circle
                            key={section}
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke={sectionColors[idx % sectionColors.length]}
                            strokeWidth={isActive ? "14" : "10"}
                            strokeDasharray={`${strokeDash} ${circumference}`}
                            strokeDashoffset={-currentOffset}
                            className="donut-segment"
                            style={{ opacity: filterSection.size > 0 && !isActive ? 0.3 : 1 }}
                            onClick={() => toggleSetValue(filterSection, section, setFilterSection)}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                      <p className="text-xs text-neutral-500">Total</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="w-full space-y-2">
                  {Object.entries(stats.sections)
                    .sort((a, b) => b[1] - a[1])
                    .map(([section, count], idx) => {
                      const sectionColors = ['#4654CD', '#03DBD0', '#8B5CF6', '#F59E0B', '#EC4899'];
                      const isActive = filterSection.has(section);
                      return (
                        <button
                          key={section}
                          onClick={() => toggleSetValue(filterSection, section, setFilterSection)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-[#4654CD]/10 ring-1 ring-[#4654CD]/30' : 'hover:bg-neutral-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sectionColors[idx % sectionColors.length] }} />
                            <span className="text-sm text-neutral-700">{SECTION_LABELS[section] || section}</span>
                          </div>
                          <span className="text-sm font-medium text-neutral-900">{count}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* By Category - Donut Chart */}
          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Por Tipo de Issue</h3>
              <div className="flex flex-col items-center">
                {/* Donut Chart */}
                <div className="relative w-40 h-40 mb-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      const categoryColors: Record<string, string> = {
                        ui: '#F59E0B',
                        functionality: '#EF4444',
                        ux: '#4654CD',
                        system: '#9CA3AF',
                      };
                      const entries = Object.entries(stats.categories)
                        .filter(([, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1]);
                      let offset = 0;
                      const circumference = 2 * Math.PI * 35;
                      return entries.map(([category, count]) => {
                        const percentage = count / stats.total;
                        const strokeDash = percentage * circumference;
                        const currentOffset = offset;
                        offset += percentage * circumference;
                        const isActive = filterCategory.has(category);
                        return (
                          <circle
                            key={category}
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke={categoryColors[category]}
                            strokeWidth={isActive ? "14" : "10"}
                            strokeDasharray={`${strokeDash} ${circumference}`}
                            strokeDashoffset={-currentOffset}
                            className="donut-segment"
                            style={{ opacity: filterCategory.size > 0 && !isActive ? 0.3 : 1 }}
                            onClick={() => toggleSetValue(filterCategory, category, setFilterCategory)}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                      <p className="text-xs text-neutral-500">Total</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="w-full space-y-2">
                  {Object.entries(stats.categories)
                    .filter(([, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const categoryColors: Record<string, string> = {
                        ui: '#F59E0B',
                        functionality: '#EF4444',
                        ux: '#4654CD',
                        system: '#9CA3AF',
                      };
                      const cat = ISSUE_CATEGORIES[category as keyof typeof ISSUE_CATEGORIES];
                      const isActive = filterCategory.has(category);
                      return (
                        <button
                          key={category}
                          onClick={() => toggleSetValue(filterCategory, category, setFilterCategory)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-[#4654CD]/10 ring-1 ring-[#4654CD]/30' : 'hover:bg-neutral-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[category] }} />
                            <span className="text-sm text-neutral-700">{cat.label}</span>
                          </div>
                          <span className="text-sm font-medium text-neutral-900">{count}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* By User */}
        <section className="mb-8">
          <Card className="bg-white border border-neutral-200">
            <CardBody className="p-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Participación por Tester</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(stats.users)
                  .sort((a, b) => b[1] - a[1])
                  .map(([user, count]) => (
                    <div key={user} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#4654CD] flex items-center justify-center text-white font-semibold text-sm">
                        {user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{user}</p>
                        <p className="text-xs text-neutral-500">{count} feedback{count > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#4654CD]">{Math.round((count / stats.total) * 100)}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Filters */}
        <section className="mb-6 no-print">
            <Card className="bg-white border border-neutral-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700">Filtros</span>
                  {hasActiveFilters && (
                    <>
                      <Chip size="sm" variant="flat" color="primary" className="ml-2">
                        {filteredData.length} de {stats.total}
                      </Chip>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={clearFilters}
                        className="text-neutral-500 cursor-pointer"
                      >
                        Limpiar
                      </Button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {/* Sección */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-500">Sección</label>
                    <Select
                      aria-label="Filtrar por sección"
                      size="sm"
                      selectionMode="multiple"
                      selectedKeys={filterSection}
                      onSelectionChange={(keys) => setFilterSection(new Set(Array.from(keys) as string[]))}
                      renderValue={(items) => (
                        <span className="text-sm text-neutral-700">
                          {items.length === 0 ? 'Todas' : items.length === 1 ? items[0].textValue : `${items.length} seleccionados`}
                        </span>
                      )}
                      classNames={{
                        base: 'w-full',
                        trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                        value: 'text-sm text-neutral-700',
                        popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                        listbox: 'p-1 bg-white',
                        listboxWrapper: 'max-h-[300px] bg-white',
                        innerWrapper: 'pr-8',
                        selectorIcon: 'right-3 pointer-events-none',
                      }}
                      popoverProps={{
                        classNames: {
                          base: 'bg-white',
                          content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                        },
                      }}
                    >
                      {uniqueSections.map((s) => (
                        <SelectItem key={s} textValue={SECTION_LABELS[s] || s} classNames={{ base: 'px-3 py-2 rounded-md text-sm cursor-pointer transition-colors text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white' }}>{SECTION_LABELS[s] || s}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  {/* Tipo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-500">Tipo</label>
                    <Select
                      aria-label="Filtrar por tipo"
                      size="sm"
                      selectionMode="multiple"
                      selectedKeys={filterCategory}
                      onSelectionChange={(keys) => setFilterCategory(new Set(Array.from(keys) as string[]))}
                      renderValue={(items) => (
                        <span className="text-sm text-neutral-700">
                          {items.length === 0 ? 'Todos' : items.length === 1 ? items[0].textValue : `${items.length} seleccionados`}
                        </span>
                      )}
                      classNames={{
                        base: 'w-full',
                        trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                        value: 'text-sm text-neutral-700',
                        popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                        listbox: 'p-1 bg-white',
                        listboxWrapper: 'max-h-[300px] bg-white',
                        innerWrapper: 'pr-8',
                        selectorIcon: 'right-3 pointer-events-none',
                      }}
                      popoverProps={{
                        classNames: {
                          base: 'bg-white',
                          content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                        },
                      }}
                    >
                      {Object.entries(ISSUE_CATEGORIES).map(([key, val]) => (
                        <SelectItem key={key} textValue={val.label} classNames={{ base: 'px-3 py-2 rounded-md text-sm cursor-pointer transition-colors text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white' }}>{val.label}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  {/* Usuario */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-500">Usuario</label>
                    <Select
                      aria-label="Filtrar por usuario"
                      size="sm"
                      selectionMode="multiple"
                      selectedKeys={filterUser}
                      onSelectionChange={(keys) => setFilterUser(new Set(Array.from(keys) as string[]))}
                      renderValue={(items) => (
                        <span className="text-sm text-neutral-700">
                          {items.length === 0 ? 'Todos' : items.length === 1 ? items[0].textValue : `${items.length} seleccionados`}
                        </span>
                      )}
                      classNames={{
                        base: 'w-full',
                        trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                        value: 'text-sm text-neutral-700',
                        popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                        listbox: 'p-1 bg-white',
                        listboxWrapper: 'max-h-[300px] bg-white',
                        innerWrapper: 'pr-8',
                        selectorIcon: 'right-3 pointer-events-none',
                      }}
                      popoverProps={{
                        classNames: {
                          base: 'bg-white',
                          content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                        },
                      }}
                    >
                      {uniqueUsers.map((u) => (
                        <SelectItem key={u} textValue={u} classNames={{ base: 'px-3 py-2 rounded-md text-sm cursor-pointer transition-colors text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white' }}>{u}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  {/* Estado */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-500">Estado</label>
                    <Select
                      aria-label="Filtrar por estado"
                      size="sm"
                      selectionMode="multiple"
                      selectedKeys={filterFixed}
                      onSelectionChange={(keys) => setFilterFixed(new Set(Array.from(keys) as string[]))}
                      renderValue={(items) => (
                        <span className="text-sm text-neutral-700">
                          {items.length === 0 ? 'Todos' : items.length === 1 ? items[0].textValue : `${items.length} seleccionados`}
                        </span>
                      )}
                      classNames={{
                        base: 'w-full',
                        trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
                        value: 'text-sm text-neutral-700',
                        popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
                        listbox: 'p-1 bg-white',
                        listboxWrapper: 'max-h-[300px] bg-white',
                        innerWrapper: 'pr-8',
                        selectorIcon: 'right-3 pointer-events-none',
                      }}
                      popoverProps={{
                        classNames: {
                          base: 'bg-white',
                          content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
                        },
                      }}
                    >
                      <SelectItem key="pending" textValue="Pendiente" classNames={{ base: 'px-3 py-2 rounded-md text-sm cursor-pointer transition-colors text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white' }}>Pendiente</SelectItem>
                      <SelectItem key="fixed" textValue="Revisado" classNames={{ base: 'px-3 py-2 rounded-md text-sm cursor-pointer transition-colors text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white' }}>Revisado</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>
        </section>

        {/* Detailed List */}
        <section className="print-break">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Detalle de Feedback ({filteredData.length})</h2>
          <div className="space-y-3">
            {filteredData.map((item) => {
              const category = classifyIssue(item.comments);
              const cat = ISSUE_CATEGORIES[category];
              return (
                <Card key={item.id} className={item.fixed ? "bg-emerald-50/50 border border-emerald-200" : "bg-white border border-neutral-200"}>
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Chip
                            size="sm"
                            variant="flat"
                            className={`cursor-pointer ${cat.className}`}
                            onClick={() => toggleSetValue(filterCategory, category, setFilterCategory)}
                          >
                            {cat.label}
                          </Chip>
                          <Chip
                            size="sm"
                            variant="bordered"
                            className="cursor-pointer"
                            onClick={() => toggleSetValue(filterSection, item.section, setFilterSection)}
                          >
                            {SECTION_LABELS[item.section] || item.section}
                          </Chip>
                          <span className="text-xs text-neutral-400">#{item.id}</span>
                        </div>
                        <p className="text-sm text-neutral-800 mb-2">{item.comments}</p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span>{item.user}</span>
                          <span>{new Date(item.created_at).toLocaleString('es-PE')}</span>
                        </div>
                        {/* Thumbnails de imágenes */}
                        {item.attachments.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {item.attachments.map((attachment, idx) => (
                              <button
                                key={attachment.id}
                                onClick={() => openImageModal(item.attachments, idx)}
                                className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 hover:border-[#4654CD] transition-colors cursor-pointer group"
                              >
                                <img
                                  src={attachment.attachment_url}
                                  alt={`Screenshot ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* Toggle Fixed Button */}
                        <Button
                          size="sm"
                          variant={item.fixed ? "flat" : "bordered"}
                          color={item.fixed ? "success" : "default"}
                          startContent={item.fixed ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          onPress={() => toggleFixed(item.id, item.fixed)}
                          className="cursor-pointer no-print"
                        >
                          {item.fixed ? "Revisado" : "Pendiente"}
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          as="a"
                          href={item.url}
                          target="_blank"
                          className="cursor-pointer no-print"
                        >
                          <ExternalLink className="w-4 h-4 text-neutral-400" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* Floating Back Button */}
      <div className="fixed bottom-6 right-6 z-[100] no-print">
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.5')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Toast de confirmación */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isToastVisible}
          onClose={hideToast}
        />
      )}

      {/* Image Modal */}
      <Modal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        size="5xl"
        classNames={{
          backdrop: 'bg-black/80',
          base: 'bg-transparent shadow-none',
          body: 'p-0',
        }}
      >
        <ModalContent>
          <ModalBody>
            <div className="relative flex items-center justify-center min-h-[60vh]">
              {/* Close button */}
              <Button
                isIconOnly
                variant="flat"
                className="absolute top-2 right-2 z-10 bg-black/50 text-white cursor-pointer"
                onPress={closeImageModal}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Navigation - Previous */}
              {imageModal.images.length > 1 && (
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute left-2 z-10 bg-black/50 text-white cursor-pointer"
                  onPress={() => navigateImage('prev')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}

              {/* Image */}
              {imageModal.images[imageModal.currentIndex] && (
                <img
                  src={imageModal.images[imageModal.currentIndex].attachment_url}
                  alt={`Screenshot ${imageModal.currentIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                />
              )}

              {/* Navigation - Next */}
              {imageModal.images.length > 1 && (
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute right-2 z-10 bg-black/50 text-white cursor-pointer"
                  onPress={() => navigateImage('next')}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}

              {/* Counter */}
              {imageModal.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                  {imageModal.currentIndex + 1} / {imageModal.images.length}
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
