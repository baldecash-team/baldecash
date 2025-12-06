"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Progress, Chip, RadioGroup, Radio, Checkbox } from "@nextui-org/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, User, Phone, Mail, CreditCard, Briefcase, Users, Shield, Check, Loader2, Home, Search, Bell, Menu } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  nombre: string;
  dni: string;
  celular: string;
  email: string;
  ocupacion: string;
  ingresoMensual: string;
  referenciaNombre: string;
  referenciaCelular: string;
  aceptaTerminos: boolean;
}

const ocupaciones = [
  "Estudiante universitario",
  "Estudiante técnico",
  "Trabajador dependiente",
  "Trabajador independiente",
  "Practicante",
];

const ingresos = [
  "Menos de S/500",
  "S/500 - S/1,000",
  "S/1,000 - S/2,000",
  "S/2,000 - S/3,500",
  "Más de S/3,500",
];

// BaldeCash brand colors
const brandColors = {
  primary: "#262877", // Dark purple/navy
  primaryLight: "#3a3b9e",
  secondary: "#acadbf", // Light gray
};

export default function FintechPage() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    dni: "",
    celular: "",
    email: "",
    ocupacion: "",
    ingresoMensual: "",
    referenciaNombre: "",
    referenciaCelular: "",
    aceptaTerminos: false,
  });

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateCuota = () => {
    const baseAmount = formData.ingresoMensual === "Más de S/3,500" ? 350 :
                       formData.ingresoMensual === "S/2,000 - S/3,500" ? 280 :
                       formData.ingresoMensual === "S/1,000 - S/2,000" ? 180 :
                       formData.ingresoMensual === "S/500 - S/1,000" ? 120 : 89;
    return baseAmount;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    } else if (step === 3) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsApproved(true);
        setStep(4);
      }, 2500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const progressPercent = step === 4 ? 100 : ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#262877]/5 via-white to-violet-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#262877]/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-[#262877]/10 rounded-full transition">
                <ArrowLeft className="w-5 h-5 text-[#262877]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#262877]">BaldeCash</h1>
                <p className="text-sm text-[#262877]/70">Financiamiento estudiantil</p>
              </div>
            </div>
            <Badge variant="outline" className="border-[#262877]/30 text-[#262877]">
              <Shield className="w-3 h-3 mr-1" /> Seguro
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {step === 1 && (
        <section className="bg-gradient-to-r from-[#262877] to-[#3a3b9e] text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tu equipo para estudiar.<br />
              <span className="text-violet-200">Desde S/89/mes.</span>
            </h2>
            <p className="text-violet-100 mb-6 max-w-md mx-auto">
              Sin cuenta bancaria. Aprobación en minutos. Diseñado para estudiantes peruanos.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-6 py-3">
              <Check className="w-5 h-5" />
              <span>Sin historial crediticio requerido</span>
            </div>
          </div>
        </section>
      )}

      {/* Progress Bar */}
      {step < 4 && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#262877] font-medium">
              Paso {step} de 3
            </span>
            <span className="text-sm text-[#262877]/70">
              {step === 1 ? "Datos personales" : step === 2 ? "Información económica" : "Confirmación"}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2"
            classNames={{
              indicator: "bg-[#262877]",
              track: "bg-[#262877]/20",
            }}
          />
        </div>
      )}

      {/* Form Container */}
      <main className="container mx-auto px-4 pb-32">
        {/* Step 1: Personal Data */}
        {step === 1 && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-[#262877]/10 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#262877]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#262877]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">¿Cómo te llamas?</CardTitle>
                    <CardDescription>Como aparece en tu DNI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Juan Pérez García"
                    value={formData.nombre}
                    onChange={(e) => updateForm("nombre", e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#262877]/20 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#262877] focus:ring-2 focus:ring-[#262877]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">DNI</label>
                  <input
                    type="text"
                    placeholder="12345678"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => updateForm("dni", e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 bg-white border-2 border-[#262877]/20 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#262877] focus:ring-2 focus:ring-[#262877]/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#262877]/10 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#262877]/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#262877]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">¿Cómo te contactamos?</CardTitle>
                    <CardDescription>Te enviaremos un código de verificación</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Celular</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 bg-slate-100 border-2 border-r-0 border-[#262877]/20 rounded-l-xl text-slate-500 text-sm font-medium">
                      +51
                    </span>
                    <input
                      type="text"
                      placeholder="999 888 777"
                      maxLength={9}
                      value={formData.celular}
                      onChange={(e) => updateForm("celular", e.target.value.replace(/\D/g, ""))}
                      className="flex-1 px-4 py-3 bg-white border-2 border-[#262877]/20 rounded-r-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#262877] focus:ring-2 focus:ring-[#262877]/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="juan@universidad.edu.pe"
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#262877]/20 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#262877] focus:ring-2 focus:ring-[#262877]/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Economic Info */}
        {step === 2 && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-[#262877]/10 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#262877]/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#262877]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">¿A qué te dedicas?</CardTitle>
                    <CardDescription>Selecciona tu ocupación principal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.ocupacion}
                  onValueChange={(val) => updateForm("ocupacion", val)}
                  className="gap-3"
                >
                  {ocupaciones.map((ocu) => (
                    <Radio
                      key={ocu}
                      value={ocu}
                      classNames={{
                        base: "border-2 border-[#262877]/20 rounded-xl p-3 hover:border-[#262877]/40 data-[selected=true]:border-[#262877] data-[selected=true]:bg-[#262877]/5 max-w-full m-0 bg-white",
                        label: "text-slate-700",
                        wrapper: "group-data-[selected=true]:border-[#262877]",
                        control: "group-data-[selected=true]:bg-[#262877] group-data-[selected=true]:border-[#262877]",
                      }}
                    >
                      {ocu}
                    </Radio>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-[#262877]/10 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#262877]/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#262877]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">¿Cuánto es tu ingreso mensual?</CardTitle>
                    <CardDescription>Aproximado, incluyendo todas tus fuentes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.ingresoMensual}
                  onValueChange={(val) => updateForm("ingresoMensual", val)}
                  className="gap-3"
                >
                  {ingresos.map((ing) => (
                    <Radio
                      key={ing}
                      value={ing}
                      classNames={{
                        base: "border-2 border-[#262877]/20 rounded-xl p-3 hover:border-[#262877]/40 data-[selected=true]:border-[#262877] data-[selected=true]:bg-[#262877]/5 max-w-full m-0 bg-white",
                        label: "text-slate-700",
                        wrapper: "group-data-[selected=true]:border-[#262877]",
                        control: "group-data-[selected=true]:bg-[#262877] group-data-[selected=true]:border-[#262877]",
                      }}
                    >
                      {ing}
                    </Radio>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {formData.ingresoMensual && (
              <div className="bg-gradient-to-r from-[#262877] to-[#3a3b9e] rounded-2xl p-4 text-white text-center shadow-lg">
                <p className="text-sm text-violet-200">Tu cuota estimada</p>
                <p className="text-3xl font-bold">S/{calculateCuota()}/mes</p>
                <p className="text-xs text-violet-200 mt-1">*Sujeto a aprobación</p>
              </div>
            )}

            <Card className="border-[#262877]/10 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#262877]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#262877]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Referencia personal</CardTitle>
                    <CardDescription>Familiar o amigo que podamos contactar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre de referencia</label>
                  <input
                    type="text"
                    placeholder="María García"
                    value={formData.referenciaNombre}
                    onChange={(e) => updateForm("referenciaNombre", e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#262877]/20 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#262877] focus:ring-2 focus:ring-[#262877]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Celular de referencia</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 bg-slate-100 border-2 border-r-0 border-[#262877]/20 rounded-l-xl text-slate-500 text-sm font-medium">
                      +51
                    </span>
                    <input
                      type="text"
                      placeholder="999 888 777"
                      maxLength={9}
                      value={formData.referenciaCelular}
                      onChange={(e) => updateForm("referenciaCelular", e.target.value.replace(/\D/g, ""))}
                      className="flex-1 px-4 py-3 bg-white border-2 border-[#262877]/20 rounded-r-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#262877] focus:ring-2 focus:ring-[#262877]/20 transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && !isLoading && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-[#262877]/10 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Revisa tu información</CardTitle>
                <CardDescription>Confirma que todos los datos estén correctos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Nombre</span>
                    <span className="font-medium text-slate-900">{formData.nombre || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">DNI</span>
                    <span className="font-medium text-slate-900">{formData.dni || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Celular</span>
                    <span className="font-medium text-slate-900">+51 {formData.celular || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-900">{formData.email || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Ocupación</span>
                    <span className="font-medium text-slate-900">{formData.ocupacion || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Ingreso mensual</span>
                    <span className="font-medium text-slate-900">{formData.ingresoMensual || "—"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-[#262877] hover:text-[#3a3b9e] font-medium"
                >
                  Editar información
                </button>
              </CardContent>
            </Card>

            <Card className="border-[#262877]/20 bg-gradient-to-br from-[#262877]/5 to-violet-50">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-[#262877]">Tu cuota mensual estimada</p>
                  <p className="text-4xl font-bold text-[#262877]">S/{calculateCuota()}</p>
                  <p className="text-xs text-[#262877]/70 mt-1">12 meses • TCEA 35%</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Checkbox
                isSelected={formData.aceptaTerminos}
                onValueChange={(val) => updateForm("aceptaTerminos", val)}
                classNames={{
                  label: "text-sm text-slate-600",
                  wrapper: "group-data-[selected=true]:border-[#262877] group-data-[selected=true]:bg-[#262877]",
                }}
              >
                Acepto los{" "}
                <a href="#" className="text-[#262877] underline">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="#" className="text-[#262877] underline">
                  política de privacidad
                </a>
              </Checkbox>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 rounded-lg p-3">
                <Shield className="w-4 h-4 text-[#262877]" />
                <span>Tu información está cifrada con encriptación de 256 bits</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-lg mx-auto text-center py-20 animate-in fade-in">
            <Loader2 className="w-16 h-16 text-[#262877] animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Evaluando tu solicitud...
            </h3>
            <p className="text-slate-500">Esto tomará solo unos segundos</p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && isApproved && (
          <div className="max-w-lg mx-auto text-center py-12 animate-in fade-in zoom-in">
            <div className="w-24 h-24 bg-[#262877]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-[#262877]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              ¡Felicidades, {formData.nombre.split(" ")[0]}!
            </h2>
            <p className="text-slate-600 mb-6">Tu solicitud ha sido pre-aprobada</p>

            <Card className="border-[#262877]/20 bg-gradient-to-br from-[#262877]/5 to-violet-50 mb-6">
              <CardContent className="pt-6">
                <p className="text-sm text-[#262877] mb-1">Línea de crédito disponible</p>
                <p className="text-5xl font-bold text-[#262877] mb-4">S/3,500</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Cuota desde</p>
                    <p className="font-semibold text-slate-900">S/{calculateCuota()}/mes</p>
                  </div>
                  <div className="w-px bg-[#262877]/20" />
                  <div>
                    <p className="text-slate-500">Plazo hasta</p>
                    <p className="font-semibold text-slate-900">24 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full font-semibold mb-3 bg-[#262877] text-white hover:bg-[#3a3b9e]"
              as={Link}
              href="/prototipos/laptops"
            >
              Ver productos disponibles
            </Button>
            <Button
              variant="flat"
              size="lg"
              className="w-full bg-[#262877]/10 text-[#262877] hover:bg-[#262877]/20"
              as={Link}
              href="/prototipos/dashboard"
            >
              Ir a mi dashboard
            </Button>
          </div>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      {step < 4 && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#262877]/10 p-4 z-50">
          <div className="container mx-auto max-w-lg flex gap-3">
            {step > 1 && (
              <Button
                variant="flat"
                size="lg"
                onPress={handleBack}
                className="flex-shrink-0 bg-[#262877]/10 text-[#262877]"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="lg"
              className="flex-1 font-semibold bg-[#262877] text-white hover:bg-[#3a3b9e]"
              onPress={handleNext}
              isDisabled={
                (step === 1 && (!formData.nombre || !formData.dni || !formData.celular || !formData.email)) ||
                (step === 2 && (!formData.ocupacion || !formData.ingresoMensual)) ||
                (step === 3 && !formData.aceptaTerminos)
              }
              endContent={<ArrowRight className="w-4 h-4" />}
            >
              {step === 3 ? "Enviar solicitud" : "Continuar"}
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-[#262877]">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <Bell className="w-5 h-5" />
            <span className="text-xs mt-1">Alertas</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Menú</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
