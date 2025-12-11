"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Zap, Palette, Package, Code } from "lucide-react";

// NextUI
import { Button as NextUIButton, Card as NextUICard, CardBody as NextUICardBody, CardHeader as NextUICardHeader, Chip as NextUIChip, Input as NextUIInput, Progress as NextUIProgress, Modal as NextUIModal, ModalContent as NextUIModalContent, ModalHeader as NextUIModalHeader, ModalBody as NextUIModalBody, ModalFooter as NextUIModalFooter, useDisclosure } from "@nextui-org/react";

// Shadcn UI
import { Button as ShadcnButton } from "@/components/ui/button";
import { Card as ShadcnCard, CardContent as ShadcnCardContent, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle } from "@/components/ui/card";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Progress as ShadcnProgress } from "@/components/ui/progress";

const componentData = {
  button: {
    title: "Button / Botón",
    description: "Componente interactivo para acciones del usuario",
    libraries: {
      nextui: {
        name: "NextUI",
        reason: "Variantes predefinidas elegantes con estados hover/press fluidos",
        pros: ["Animaciones suaves incorporadas", "Múltiples tamaños y variantes", "Soporte para iconos start/end", "Ripple effect nativo"],
        cons: ["Mayor tamaño de bundle", "Requiere provider global"],
        bestFor: "Aplicaciones modernas con foco en UX premium"
      },
      daisyui: {
        name: "DaisyUI",
        reason: "Clases CSS simples basadas en Tailwind, ultra ligero",
        pros: ["Peso mínimo (solo CSS)", "Configuración por clases", "Temas predefinidos", "Compatible con cualquier framework"],
        cons: ["Sin animaciones complejas", "Menos opciones de personalización", "Requiere clases manuales"],
        bestFor: "Proyectos que priorizan rendimiento y simplicidad"
      },
      shadcn: {
        name: "Shadcn UI",
        reason: "Control total del código, componentes copiables y modificables",
        pros: ["Código en tu proyecto", "Cero dependencias runtime", "Totalmente personalizable", "Basado en Radix UI"],
        cons: ["Setup inicial más complejo", "Actualizaciones manuales", "Más código en el proyecto"],
        bestFor: "Equipos que necesitan control absoluto del diseño"
      }
    }
  },
  card: {
    title: "Card / Tarjeta",
    description: "Contenedor para agrupar información relacionada",
    libraries: {
      nextui: {
        name: "NextUI",
        reason: "Efectos visuales modernos (blur, shadow) y estados interactivos",
        pros: ["isPressable para tarjetas clicables", "Blur effects integrados", "Sombras dinámicas", "CardBody, CardHeader preconfigurados"],
        cons: ["HTML adicional generado", "Estilos más específicos"],
        bestFor: "Dashboards y galerías interactivas"
      },
      daisyui: {
        name: "DaisyUI",
        reason: "Estructura semántica con clases Tailwind puras",
        pros: ["HTML limpio", "Fácil de estilizar", "Responsive por defecto", "Soporte de temas"],
        cons: ["Efectos visuales limitados", "No tiene subcomponentes oficiales"],
        bestFor: "Layouts tradicionales y blogs"
      },
      shadcn: {
        name: "Shadcn UI",
        reason: "Composición flexible con subcomponentes semánticos",
        pros: ["CardHeader, CardContent, CardFooter", "Altamente composable", "Estilos base modificables", "Accesibilidad garantizada"],
        cons: ["Más código para casos simples", "Setup de múltiples archivos"],
        bestFor: "Sistemas de diseño empresariales"
      }
    }
  },
  badge: {
    title: "Badge / Chip / Etiqueta",
    description: "Indicador visual para estados, categorías o notificaciones",
    libraries: {
      nextui: {
        name: "NextUI (Chip)",
        reason: "Versátil con soporte para avatares, íconos y cerrado",
        pros: ["onClose handler integrado", "Avatar integrado", "Variantes de color dinámicas", "Animaciones de entrada/salida"],
        cons: ["Más pesado que alternativas", "Naming 'Chip' vs 'Badge'"],
        bestFor: "Filtros, tags interactivos, selección múltiple"
      },
      daisyui: {
        name: "DaisyUI (Badge)",
        reason: "Minimalista y eficiente para indicadores estáticos",
        pros: ["Extremadamente ligero", "Clases simples (badge-primary, etc.)", "Sin JavaScript", "Ideal para SSR"],
        cons: ["No interactivo por defecto", "Opciones de diseño limitadas"],
        bestFor: "Contadores, estados, notificaciones simples"
      },
      shadcn: {
        name: "Shadcn UI (Badge)",
        reason: "Componente base personalizable con variantes",
        pros: ["Código fuente editable", "Variantes predefinidas", "TypeScript nativo", "Fácil crear variantes custom"],
        cons: ["Funcionalidad básica out-of-the-box", "Interactividad requiere código adicional"],
        bestFor: "Sistemas con necesidades específicas de branding"
      }
    }
  },
  input: {
    title: "Input / Campo de texto",
    description: "Campo de entrada para datos del usuario",
    libraries: {
      nextui: {
        name: "NextUI",
        reason: "Validación visual integrada y estados de error elegantes",
        pros: ["isInvalid, errorMessage props", "Etiquetas flotantes", "Iconos start/end", "Clearable integrado"],
        cons: ["Estilos opinados difíciles de sobrescribir", "Más markup HTML"],
        bestFor: "Formularios complejos con validación en tiempo real"
      },
      daisyui: {
        name: "DaisyUI",
        reason: "Input nativo HTML con estilos Tailwind consistentes",
        pros: ["Input HTML estándar", "Sin wrapper innecesario", "Compatible con form libraries", "Peso cero JS"],
        cons: ["Validación manual", "Sin helpers visuales avanzados"],
        bestFor: "Formularios tradicionales y SSR forms"
      },
      shadcn: {
        name: "Shadcn UI",
        reason: "Base sólida para construir inputs especializados",
        pros: ["Código modificable", "Composición con Label/Form", "React Hook Form ready", "Accesibilidad (aria-*)"],
        cons: ["Features avanzadas requieren implementación", "Más setup inicial"],
        bestFor: "Formularios empresariales con requisitos únicos"
      }
    }
  },
  progress: {
    title: "Progress / Barra de progreso",
    description: "Indicador visual de progreso o carga",
    libraries: {
      nextui: {
        name: "NextUI",
        reason: "Animaciones fluidas y variantes de color dinámicas",
        pros: ["Animación de progreso suave", "Modos: determinate/indeterminate", "showValueLabel para porcentajes", "Colores temáticos"],
        cons: ["Requiere state management para updates", "Bundle size incrementado"],
        bestFor: "Dashboards con métricas en tiempo real"
      },
      daisyui: {
        name: "DaisyUI",
        reason: "HTML progress nativo con estilos mejorados",
        pros: ["Elemento <progress> estándar", "CSS puro", "Accesibilidad nativa", "Sin JavaScript"],
        cons: ["Animaciones limitadas", "Customización de colores más manual"],
        bestFor: "Indicadores de carga estáticos"
      },
      shadcn: {
        name: "Shadcn UI",
        reason: "Componente customizable basado en Radix Progress",
        pros: ["API de Radix UI", "Totalmente estilizable", "TypeScript types", "Animaciones CSS customizables"],
        cons: ["Configuración de animaciones manual", "Sin variantes predefinidas"],
        bestFor: "Experiencias de carga personalizadas"
      }
    }
  }
};

export default function ComponentComparisonPage() {
  const [selectedComponent, setSelectedComponent] = useState<keyof typeof componentData>("button");
  const { isOpen: isNextUIModalOpen, onOpen: onNextUIModalOpen, onClose: onNextUIModalClose } = useDisclosure();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#262877]/5 via-white to-violet-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#262877]/10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-[#262877]/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#262877]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#262877]">BaldeCash UI Comparison</h1>
                <p className="text-sm text-[#262877]/70">NextUI vs DaisyUI vs Shadcn UI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShadcnBadge variant="outline" className="border-[#262877]/30 text-[#262877]">
                <Package className="w-3 h-3 mr-1" /> v0.1
              </ShadcnBadge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#262877] via-[#3a3b9e] to-[#262877] text-white py-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Palette className="w-4 h-4 text-violet-200" />
            <span className="text-sm font-medium">Estudio comparativo de UI Libraries</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Comparación de Componentes
          </h2>
          <p className="text-violet-100 text-base md:text-lg max-w-2xl mx-auto">
            Análisis detallado de componentes UI en NextUI, DaisyUI y Shadcn UI para el ecosistema BaldeCash
          </p>
        </div>
      </section>

      {/* Component Selector */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(componentData).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setSelectedComponent(key as keyof typeof componentData)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shrink-0 ${
                selectedComponent === key
                  ? "bg-[#262877] text-white shadow-lg shadow-[#262877]/30"
                  : "bg-white text-[#262877] border-2 border-[#262877]/20 hover:border-[#262877]/40"
              }`}
            >
              <Code className="w-4 h-4" />
              {data.title.split("/")[0].trim()}
            </button>
          ))}
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {componentData[selectedComponent].title}
          </h2>
          <p className="text-slate-600">{componentData[selectedComponent].description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* NextUI */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-violet-500 text-white p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">NextUI</h3>
                <ShadcnBadge className="bg-white/20 text-white border-0">Premium</ShadcnBadge>
              </div>
              <p className="text-sm text-blue-100">
                {componentData[selectedComponent].libraries.nextui.reason}
              </p>
            </div>

            {/* Demo Component */}
            <div className="bg-white border-2 border-[#262877]/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-[#262877] uppercase tracking-wider mb-4">Demo</p>

              {selectedComponent === "button" && (
                <div className="space-y-3">
                  <NextUIButton color="primary" className="w-full">Primary Button</NextUIButton>
                  <NextUIButton color="secondary" variant="flat" className="w-full">Secondary</NextUIButton>
                  <NextUIButton color="success" variant="bordered" className="w-full">Success</NextUIButton>
                </div>
              )}

              {selectedComponent === "card" && (
                <NextUICard className="border-none shadow-lg">
                  <NextUICardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <p className="text-tiny uppercase font-bold text-[#262877]">NextUI Card</p>
                    <h4 className="font-bold text-large">Ejemplo interactivo</h4>
                  </NextUICardHeader>
                  <NextUICardBody className="overflow-visible py-4">
                    <p className="text-sm text-slate-600">Esta tarjeta usa efectos de blur y sombras dinámicas</p>
                  </NextUICardBody>
                </NextUICard>
              )}

              {selectedComponent === "badge" && (
                <div className="flex flex-wrap gap-2">
                  <NextUIChip color="primary">Primary</NextUIChip>
                  <NextUIChip color="success">Success</NextUIChip>
                  <NextUIChip color="warning">Warning</NextUIChip>
                  <NextUIChip color="danger" variant="bordered">Danger</NextUIChip>
                  <NextUIChip variant="flat" onClose={() => {}}>Closable</NextUIChip>
                </div>
              )}

              {selectedComponent === "input" && (
                <div className="space-y-3">
                  <NextUIInput
                    type="email"
                    label="Email"
                    placeholder="usuario@ejemplo.com"
                    className="w-full"
                  />
                  <NextUIInput
                    type="text"
                    label="Nombre"
                    placeholder="Juan Pérez"
                    isInvalid
                    errorMessage="Este campo es requerido"
                    className="w-full"
                  />
                </div>
              )}

              {selectedComponent === "progress" && (
                <div className="space-y-4">
                  <NextUIProgress value={65} color="primary" className="w-full" showValueLabel />
                  <NextUIProgress value={40} color="success" className="w-full" />
                  <NextUIProgress value={85} color="warning" className="w-full" />
                </div>
              )}
            </div>

            {/* Pros/Cons */}
            <div className="bg-white border-2 border-[#262877]/10 rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Ventajas</h4>
                </div>
                <ul className="space-y-1.5 ml-8">
                  {componentData[selectedComponent].libraries.nextui.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Consideraciones</h4>
                </div>
                <ul className="space-y-1.5 ml-8">
                  {componentData[selectedComponent].libraries.nextui.cons.map((con, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#262877]" />
                  <h4 className="font-semibold text-slate-900 text-sm">Mejor para</h4>
                </div>
                <p className="text-sm text-slate-700 ml-6">
                  {componentData[selectedComponent].libraries.nextui.bestFor}
                </p>
              </div>
            </div>
          </div>

          {/* DaisyUI */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">DaisyUI</h3>
                <ShadcnBadge className="bg-white/20 text-white border-0">Lightweight</ShadcnBadge>
              </div>
              <p className="text-sm text-teal-100">
                {componentData[selectedComponent].libraries.daisyui.reason}
              </p>
            </div>

            {/* Demo Component */}
            <div className="bg-white border-2 border-[#262877]/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-[#262877] uppercase tracking-wider mb-4">Demo</p>

              {selectedComponent === "button" && (
                <div className="space-y-3">
                  <button className="btn btn-primary w-full">Primary Button</button>
                  <button className="btn btn-secondary w-full">Secondary</button>
                  <button className="btn btn-outline btn-success w-full">Success</button>
                </div>
              )}

              {selectedComponent === "card" && (
                <div className="card bg-base-100 shadow-xl border border-slate-200">
                  <div className="card-body">
                    <h2 className="card-title text-[#262877]">DaisyUI Card</h2>
                    <p className="text-sm text-slate-600">Estructura semántica con clases Tailwind</p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-sm btn-primary">Acción</button>
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent === "badge" && (
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-primary">Primary</span>
                  <span className="badge badge-success">Success</span>
                  <span className="badge badge-warning">Warning</span>
                  <span className="badge badge-error badge-outline">Error</span>
                  <span className="badge badge-lg">Large</span>
                </div>
              )}

              {selectedComponent === "input" && (
                <div className="space-y-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input type="email" placeholder="usuario@ejemplo.com" className="input input-bordered w-full" />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Nombre</span>
                    </label>
                    <input type="text" placeholder="Juan Pérez" className="input input-bordered input-error w-full" />
                    <label className="label">
                      <span className="label-text-alt text-error">Este campo es requerido</span>
                    </label>
                  </div>
                </div>
              )}

              {selectedComponent === "progress" && (
                <div className="space-y-4">
                  <progress className="progress progress-primary w-full" value="65" max="100"></progress>
                  <progress className="progress progress-success w-full" value="40" max="100"></progress>
                  <progress className="progress progress-warning w-full" value="85" max="100"></progress>
                </div>
              )}
            </div>

            {/* Pros/Cons */}
            <div className="bg-white border-2 border-[#262877]/10 rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Ventajas</h4>
                </div>
                <ul className="space-y-1.5 ml-8">
                  {componentData[selectedComponent].libraries.daisyui.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Consideraciones</h4>
                </div>
                <ul className="space-y-1.5 ml-8">
                  {componentData[selectedComponent].libraries.daisyui.cons.map((con, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#262877]" />
                  <h4 className="font-semibold text-slate-900 text-sm">Mejor para</h4>
                </div>
                <p className="text-sm text-slate-700 ml-6">
                  {componentData[selectedComponent].libraries.daisyui.bestFor}
                </p>
              </div>
            </div>
          </div>

          {/* Shadcn UI */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Shadcn UI</h3>
                <ShadcnBadge className="bg-white/20 text-white border-0">Customizable</ShadcnBadge>
              </div>
              <p className="text-sm text-slate-300">
                {componentData[selectedComponent].libraries.shadcn.reason}
              </p>
            </div>

            {/* Demo Component */}
            <div className="bg-white border-2 border-[#262877]/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-[#262877] uppercase tracking-wider mb-4">Demo</p>

              {selectedComponent === "button" && (
                <div className="space-y-3">
                  <ShadcnButton className="w-full bg-[#262877] hover:bg-[#3a3b9e]">Primary Button</ShadcnButton>
                  <ShadcnButton variant="secondary" className="w-full">Secondary</ShadcnButton>
                  <ShadcnButton variant="outline" className="w-full">Outline</ShadcnButton>
                </div>
              )}

              {selectedComponent === "card" && (
                <ShadcnCard className="border-[#262877]/20">
                  <ShadcnCardHeader>
                    <CardTitle className="text-[#262877]">Shadcn UI Card</CardTitle>
                  </ShadcnCardHeader>
                  <ShadcnCardContent>
                    <p className="text-sm text-slate-600">Componente totalmente customizable con código en tu proyecto</p>
                  </ShadcnCardContent>
                </ShadcnCard>
              )}

              {selectedComponent === "badge" && (
                <div className="flex flex-wrap gap-2">
                  <ShadcnBadge className="bg-[#262877]">Primary</ShadcnBadge>
                  <ShadcnBadge variant="secondary">Secondary</ShadcnBadge>
                  <ShadcnBadge variant="outline">Outline</ShadcnBadge>
                  <ShadcnBadge variant="destructive">Destructive</ShadcnBadge>
                </div>
              )}

              {selectedComponent === "input" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <ShadcnInput type="email" placeholder="usuario@ejemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre</label>
                    <ShadcnInput type="text" placeholder="Juan Pérez" className="border-red-500" />
                    <p className="text-xs text-red-500">Este campo es requerido</p>
                  </div>
                </div>
              )}

              {selectedComponent === "progress" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Progreso</span>
                      <span>65%</span>
                    </div>
                    <ShadcnProgress value={65} className="w-full" />
                  </div>
                  <ShadcnProgress value={40} className="w-full" />
                  <ShadcnProgress value={85} className="w-full" />
                </div>
              )}
            </div>

            {/* Pros/Cons */}
            <div className="bg-white border-2 border-[#262877]/10 rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Ventajas</h4>
                </div>
                <ul className="space-y-1.5 ml-8">
                  {componentData[selectedComponent].libraries.shadcn.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Consideraciones</h4>
                </div>
                <ul className="space-y-1.5 ml-8">
                  {componentData[selectedComponent].libraries.shadcn.cons.map((con, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#262877]" />
                  <h4 className="font-semibold text-slate-900 text-sm">Mejor para</h4>
                </div>
                <p className="text-sm text-slate-700 ml-6">
                  {componentData[selectedComponent].libraries.shadcn.bestFor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-12 bg-white border-2 border-[#262877]/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#262877]" />
            Resumen y Recomendación
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-violet-50 p-5 rounded-xl border border-blue-200">
              <h4 className="font-bold text-[#262877] mb-2">NextUI</h4>
              <p className="text-sm text-slate-700">
                Ideal para <strong>BaldeCash Store</strong> y <strong>Dashboard</strong> donde la experiencia premium y animaciones fluidas son prioritarias.
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-xl border border-teal-200">
              <h4 className="font-bold text-teal-700 mb-2">DaisyUI</h4>
              <p className="text-sm text-slate-700">
                Perfecto para <strong>landing pages</strong> y <strong>marketing</strong> donde el rendimiento y SEO son críticos.
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-xl border border-slate-300">
              <h4 className="font-bold text-slate-900 mb-2">Shadcn UI</h4>
              <p className="text-sm text-slate-700">
                Óptimo para <strong>fintech wizard</strong> y <strong>formularios</strong> donde necesitamos control total y validaciones personalizadas.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/prototipos/laptops">
            <ShadcnButton className="bg-[#262877] hover:bg-[#3a3b9e] text-white w-full sm:w-auto">
              Ver E-commerce (NextUI)
            </ShadcnButton>
          </Link>
          <Link href="/prototipos/fintech">
            <ShadcnButton variant="outline" className="border-[#262877] text-[#262877] hover:bg-[#262877]/10 w-full sm:w-auto">
              Ver Wizard (Shadcn UI)
            </ShadcnButton>
          </Link>
          <Link href="/prototipos/dashboard">
            <ShadcnButton variant="secondary" className="w-full sm:w-auto">
              Ver Dashboard (NextUI + Shadcn)
            </ShadcnButton>
          </Link>
        </div>
      </section>

      {/* NextUI Modal Demo */}
      <NextUIModal isOpen={isNextUIModalOpen} onClose={onNextUIModalClose}>
        <NextUIModalContent>
          <NextUIModalHeader>Modal de NextUI</NextUIModalHeader>
          <NextUIModalBody>
            <p>Este es un ejemplo de modal con NextUI, con animaciones suaves y backdrop blur.</p>
          </NextUIModalBody>
          <NextUIModalFooter>
            <NextUIButton color="danger" variant="light" onPress={onNextUIModalClose}>
              Cerrar
            </NextUIButton>
            <NextUIButton color="primary" onPress={onNextUIModalClose}>
              Aceptar
            </NextUIButton>
          </NextUIModalFooter>
        </NextUIModalContent>
      </NextUIModal>
    </div>
  );
}
