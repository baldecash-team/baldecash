"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Progress, Chip, RadioGroup, Radio, Checkbox } from "@nextui-org/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, User, Phone, Mail, CreditCard, Briefcase, Users, Shield, Check, Loader2, ChevronDown, Home, Search, Bell, Menu } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-emerald-100 rounded-full transition">
                <ArrowLeft className="w-5 h-5 text-emerald-700" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-emerald-900">BaldeCash</h1>
                <p className="text-sm text-emerald-600">Financiamiento estudiantil</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
              <Shield className="w-3 h-3 mr-1" /> Seguro
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {step === 1 && (
        <section className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tu equipo para estudiar.<br />
              <span className="text-emerald-200">Desde S/89/mes.</span>
            </h2>
            <p className="text-emerald-100 mb-6 max-w-md mx-auto">
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
            <span className="text-sm text-emerald-700 font-medium">
              Paso {step} de 3
            </span>
            <span className="text-sm text-emerald-600">
              {step === 1 ? "Datos personales" : step === 2 ? "Información económica" : "Confirmación"}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2"
            color="success"
          />
        </div>
      )}

      {/* Form Container */}
      <main className="container mx-auto px-4 pb-32">
        {/* Step 1: Personal Data */}
        {step === 1 && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-emerald-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">¿Cómo te llamas?</CardTitle>
                    <CardDescription>Como aparece en tu DNI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nombre completo"
                  placeholder="Juan Pérez García"
                  value={formData.nombre}
                  onValueChange={(val) => updateForm("nombre", val)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    inputWrapper: "border-emerald-200 hover:border-emerald-400",
                  }}
                />
                <Input
                  label="DNI"
                  placeholder="12345678"
                  maxLength={8}
                  value={formData.dni}
                  onValueChange={(val) => updateForm("dni", val.replace(/\D/g, ""))}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    inputWrapper: "border-emerald-200 hover:border-emerald-400",
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">¿Cómo te contactamos?</CardTitle>
                    <CardDescription>Te enviaremos un código de verificación</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Celular"
                  placeholder="999 888 777"
                  maxLength={9}
                  value={formData.celular}
                  onValueChange={(val) => updateForm("celular", val.replace(/\D/g, ""))}
                  variant="bordered"
                  size="lg"
                  startContent={<span className="text-slate-400 text-sm">+51</span>}
                  classNames={{
                    inputWrapper: "border-emerald-200 hover:border-emerald-400",
                  }}
                />
                <Input
                  label="Email"
                  placeholder="juan@universidad.edu.pe"
                  type="email"
                  value={formData.email}
                  onValueChange={(val) => updateForm("email", val)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    inputWrapper: "border-emerald-200 hover:border-emerald-400",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Economic Info */}
        {step === 2 && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-emerald-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">¿A qué te dedicas?</CardTitle>
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
                        base: "border-2 border-emerald-200 rounded-xl p-3 hover:border-emerald-400 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50 max-w-full m-0",
                        label: "text-slate-700",
                      }}
                    >
                      {ocu}
                    </Radio>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">¿Cuánto es tu ingreso mensual?</CardTitle>
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
                        base: "border-2 border-emerald-200 rounded-xl p-3 hover:border-emerald-400 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50 max-w-full m-0",
                        label: "text-slate-700",
                      }}
                    >
                      {ing}
                    </Radio>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {formData.ingresoMensual && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white text-center">
                <p className="text-sm text-emerald-100">Tu cuota estimada</p>
                <p className="text-3xl font-bold">S/{calculateCuota()}/mes</p>
                <p className="text-xs text-emerald-200 mt-1">*Sujeto a aprobación</p>
              </div>
            )}

            <Card className="border-emerald-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Referencia personal</CardTitle>
                    <CardDescription>Familiar o amigo que podamos contactar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nombre de referencia"
                  placeholder="María García"
                  value={formData.referenciaNombre}
                  onValueChange={(val) => updateForm("referenciaNombre", val)}
                  variant="bordered"
                  classNames={{
                    inputWrapper: "border-emerald-200 hover:border-emerald-400",
                  }}
                />
                <Input
                  label="Celular de referencia"
                  placeholder="999 888 777"
                  maxLength={9}
                  value={formData.referenciaCelular}
                  onValueChange={(val) => updateForm("referenciaCelular", val.replace(/\D/g, ""))}
                  variant="bordered"
                  startContent={<span className="text-slate-400 text-sm">+51</span>}
                  classNames={{
                    inputWrapper: "border-emerald-200 hover:border-emerald-400",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && !isLoading && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="text-lg">Revisa tu información</CardTitle>
                <CardDescription>Confirma que todos los datos estén correctos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Nombre</span>
                    <span className="font-medium">{formData.nombre || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">DNI</span>
                    <span className="font-medium">{formData.dni || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Celular</span>
                    <span className="font-medium">+51 {formData.celular || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium">{formData.email || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Ocupación</span>
                    <span className="font-medium">{formData.ocupacion || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Ingreso mensual</span>
                    <span className="font-medium">{formData.ingresoMensual || "—"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Editar información
                </button>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-emerald-700">Tu cuota mensual estimada</p>
                  <p className="text-4xl font-bold text-emerald-600">S/{calculateCuota()}</p>
                  <p className="text-xs text-emerald-600 mt-1">12 meses • TCEA 35%</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Checkbox
                isSelected={formData.aceptaTerminos}
                onValueChange={(val) => updateForm("aceptaTerminos", val)}
                classNames={{
                  label: "text-sm text-slate-600",
                }}
              >
                Acepto los{" "}
                <a href="#" className="text-emerald-600 underline">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="#" className="text-emerald-600 underline">
                  política de privacidad
                </a>
              </Checkbox>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 rounded-lg p-3">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Tu información está cifrada con encriptación de 256 bits</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-lg mx-auto text-center py-20 animate-in fade-in">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Evaluando tu solicitud...
            </h3>
            <p className="text-slate-500">Esto tomará solo unos segundos</p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && isApproved && (
          <div className="max-w-lg mx-auto text-center py-12 animate-in fade-in zoom-in">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              ¡Felicidades, {formData.nombre.split(" ")[0]}!
            </h2>
            <p className="text-slate-600 mb-6">Tu solicitud ha sido pre-aprobada</p>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 mb-6">
              <CardContent className="pt-6">
                <p className="text-sm text-emerald-700 mb-1">Línea de crédito disponible</p>
                <p className="text-5xl font-bold text-emerald-600 mb-4">S/3,500</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Cuota desde</p>
                    <p className="font-semibold text-slate-900">S/{calculateCuota()}/mes</p>
                  </div>
                  <div className="w-px bg-emerald-200" />
                  <div>
                    <p className="text-slate-500">Plazo hasta</p>
                    <p className="font-semibold text-slate-900">24 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              color="success"
              size="lg"
              className="w-full font-semibold mb-3"
              as={Link}
              href="/prototipos/laptops"
            >
              Ver productos disponibles
            </Button>
            <Button
              variant="flat"
              size="lg"
              className="w-full"
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 p-4 z-50">
          <div className="container mx-auto max-w-lg flex gap-3">
            {step > 1 && (
              <Button
                variant="flat"
                size="lg"
                onPress={handleBack}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              color="success"
              size="lg"
              className="flex-1 font-semibold"
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
          <button className="flex flex-col items-center text-emerald-600">
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
