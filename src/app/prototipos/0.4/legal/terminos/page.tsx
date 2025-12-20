'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ArrowLeft, FileText, Shield, Users, Scale, Bell, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/prototipos/0.4/hero/hero-preview">
            <Button
              isIconOnly
              variant="light"
              radius="lg"
              className="cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-neutral-800">Terminos y Condiciones</h1>
            <p className="text-xs text-neutral-500">Ultima actualizacion: Junio 2023</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border border-neutral-200 shadow-sm">
          <CardBody className="p-8 space-y-8">
            {/* Intro */}
            <div className="flex items-start gap-4 p-4 bg-[#4654CD]/5 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-[#4654CD]" />
              </div>
              <div>
                <h2 className="font-bold text-neutral-800 mb-1">Balde K S.A.C. (BaldeCash)</h2>
                <p className="text-sm text-neutral-600">
                  RUC: 20605530509 | Empresa de financiamiento regulada que ofrece arrendamiento operativo
                  de equipos informaticos y creditos de consumo para gastos educativos.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">1. Sobre BaldeCash</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600">
                <p>
                  BaldeCash opera como empresa de financiamiento ofreciendo dos servicios principales:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Financiamiento para adquisicion de equipos informaticos mediante arrendamiento operativo</li>
                  <li>Creditos de consumo para gastos educativos (materiales, matriculas, mensualidades)</li>
                </ul>
                <p>
                  Los servicios estan dirigidos a estudiantes universitarios y de institutos tecnicos.
                  La empresa puede prestar servicios directamente o a traves de entidades afiliadas
                  (Campus Control Sociedad Gestora de Fondos de Inversion S.A.C.).
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">2. Capacidad Legal</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600">
                <p>
                  Los servicios solo pueden ser contratados por personas naturales mayores de edad
                  con plena capacidad legal que sean estudiantes y requieran los servicios de BaldeCash.
                </p>
                <p>
                  Los usuarios deben completar formularios de solicitud con informacion valida y veraz.
                  Los datos personales deben ser exactos y actualizados. La informacion falsa puede
                  resultar en suspension o terminacion de cuenta sin compensacion.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">3. Procedimiento de Solicitud</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600">
                <p><strong>a) Envio de Solicitud:</strong> Los usuarios solicitan servicios a traves de la plataforma, especificando el equipo deseado.</p>
                <p><strong>b) Analisis de Perfil:</strong> BaldeCash y entidades afiliadas analizan perfiles en maximo 2 dias, considerando criterios academicos y personales.</p>
                <p><strong>c) Aceptacion o Rechazo:</strong> La decision es a absoluta discrecion de BaldeCash. Los contratos requieren firma electronica y video-selfie de confirmacion.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">4. Vigencia y Reembolsos</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600">
                <p>
                  La vigencia de ofertas corresponde a la fecha de promocion indicada. Cuando no aparece fecha de terminacion,
                  la oferta dura 30 dias desde su publicacion.
                </p>
                <p>
                  No se permiten reembolsos de pagos por servicios, excepto cuando BaldeCash no pueda entregar
                  servicios en plazos razonables por causas incontrolables.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">5. Propiedad Intelectual</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600">
                <p>
                  Las marcas, diseños y elementos de propiedad intelectual pertenecen a la empresa o proveedores,
                  protegidos por leyes de derechos de autor y tratados internacionales.
                </p>
                <p>
                  La reproduccion no autorizada esta prohibida. Los usuarios no pueden copiar,
                  realizar ingenieria inversa, descompilar o crear obras derivadas de la plataforma.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">6. Proteccion de Datos Personales</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600">
                <p>
                  BaldeCash recopila y procesa datos personales cumpliendo con la Ley N°29733 -
                  Ley de Proteccion de Datos Personales y su Reglamento (D.S.003-2013-JUS).
                </p>
                <p>
                  Los datos pueden transferirse a Campus Control (entidad afiliada), Equifax Peru S.A.
                  (servicios de datos de riesgo) y Amazon Com Inc (servidores web en Estados Unidos).
                </p>
                <p>
                  Los usuarios pueden ejercer derechos de acceso, actualizacion, rectificacion,
                  oposicion y eliminacion enviando correo a <strong>prestamos@baldecash.com</strong>.
                </p>
              </div>
            </section>

            {/* Contact */}
            <div className="p-6 bg-neutral-100 rounded-xl">
              <h4 className="font-bold text-neutral-800 mb-2">Contacto y Notificaciones</h4>
              <p className="text-sm text-neutral-600 mb-4">
                Quejas respecto a estos terminos deben enviarse a:
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-neutral-700"><strong>Direccion:</strong> Av. El Ejercito N° 1146 Int. 708, Magdalena del Mar, Lima</p>
                <p className="text-neutral-700"><strong>Email:</strong> prestamos@baldecash.com</p>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-xs text-neutral-400 text-center pt-4 border-t border-neutral-200">
              Este contrato se firma electronicamente bajo los articulos 141 y 141-A del Codigo Civil Peruano.
              Se rige por la legislacion peruana y los conflictos se someten a los tribunales de Lima, Peru.
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
