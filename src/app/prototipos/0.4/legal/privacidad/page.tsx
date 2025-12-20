'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ArrowLeft, Shield, Eye, Database, Globe, Lock, UserCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
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
            <h1 className="text-lg font-bold text-neutral-800">Politica de Privacidad</h1>
            <p className="text-xs text-neutral-500">Ultima actualizacion: Junio 2023</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border border-neutral-200 shadow-sm">
          <CardBody className="p-8 space-y-8">
            {/* Intro */}
            <div className="flex items-start gap-4 p-4 bg-[#03DBD0]/10 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-[#03DBD0]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#03DBD0]" />
              </div>
              <div>
                <h2 className="font-bold text-neutral-800 mb-1">Tu privacidad es importante</h2>
                <p className="text-sm text-neutral-600">
                  BaldeCash (Balde K S.A.C., RUC 20605530509) esta comprometido con la proteccion de datos
                  personales recopilados a traves de su plataforma, cumpliendo con la legislacion peruana.
                </p>
              </div>
            </div>

            {/* Marco Legal */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Marco Legal Aplicable</h3>
              </div>
              <div className="pl-11 flex flex-wrap gap-2">
                <Chip size="sm" variant="flat" className="bg-neutral-100">Constitucion Politica del Peru</Chip>
                <Chip size="sm" variant="flat" className="bg-neutral-100">Ley 29733 (Proteccion de Datos)</Chip>
                <Chip size="sm" variant="flat" className="bg-neutral-100">D.S. 003-2013-JUS</Chip>
                <Chip size="sm" variant="flat" className="bg-neutral-100">R.D. 019-2013-JUS/DGPDP</Chip>
              </div>
            </section>

            {/* Principios */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Principios de Tratamiento</h3>
              </div>
              <div className="pl-11 grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800 text-sm">Legalidad</p>
                  <p className="text-xs text-neutral-500">Rechaza recoleccion fraudulenta o ilicita</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800 text-sm">Consentimiento</p>
                  <p className="text-xs text-neutral-500">Requiere autorizacion del usuario</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800 text-sm">Finalidad</p>
                  <p className="text-xs text-neutral-500">Objetivos especificos y licitos</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800 text-sm">Proporcionalidad</p>
                  <p className="text-xs text-neutral-500">Tratamiento adecuado y no excesivo</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800 text-sm">Calidad</p>
                  <p className="text-xs text-neutral-500">Datos precisos, actuales y necesarios</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800 text-sm">Seguridad</p>
                  <p className="text-xs text-neutral-500">Protegidos y retenidos solo lo necesario</p>
                </div>
              </div>
            </section>

            {/* Datos Recopilados */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Informacion que Recopilamos</h3>
              </div>
              <div className="pl-11 space-y-4 text-neutral-600">
                <div>
                  <p className="font-medium text-neutral-800 mb-2">Datos proporcionados por el usuario:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Nombre, fecha de nacimiento, direccion, ubicacion geografica</li>
                    <li>Documentos de identidad (DNI), fotos, numeros de telefono, firma</li>
                    <li>Registros academicos y datos de situacion financiera</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-neutral-800 mb-2">Datos recopilados automaticamente:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Ubicacion tecnica/direccion IP, tipo de navegador, sistema operativo</li>
                    <li>Datos de interaccion, errores de descarga, tiempos de respuesta</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-neutral-800 mb-2">Fuentes de terceros:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Otros sitios web afiliados, agencias de credito</li>
                    <li>Proveedores de analisis de datos, socios comerciales</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Uso de Datos */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Uso de la Informacion</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600 text-sm">
                <p>Usamos tus datos para:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cumplir obligaciones contractuales</li>
                  <li>Comunicarnos contigo por cualquier medio</li>
                  <li>Notificar cambios en servicios</li>
                  <li>Optimizar presentacion de contenido</li>
                  <li>Cumplir requisitos legales y regulatorios</li>
                  <li>Administracion interna y solucion de problemas</li>
                  <li>Mejora de la plataforma y mantenimiento de seguridad</li>
                </ul>
              </div>
            </section>

            {/* Transferencia Internacional */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Transferencia Internacional</h3>
              </div>
              <div className="pl-11 space-y-3 text-neutral-600 text-sm">
                <p>
                  Los datos del usuario recopilados se transfieren a servidores mantenidos por
                  <strong> Amazon Web Services</strong> (EE.UU., EIN 91-1646860, 410 Terry Avenue North)
                  exclusivamente para almacenamiento.
                </p>
                <p>
                  La informacion puede transferirse y almacenarse fuera del Peru.
                  Al enviar datos, los usuarios aceptan este acuerdo.
                </p>
              </div>
            </section>

            {/* Derechos del Usuario */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#22c55e]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Tus Derechos</h3>
              </div>
              <div className="pl-11">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-lg">
                    <p className="font-medium text-neutral-800 text-sm">Acceso</p>
                    <p className="text-xs text-neutral-500">Consultar tus datos personales</p>
                  </div>
                  <div className="p-3 border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-lg">
                    <p className="font-medium text-neutral-800 text-sm">Actualizacion</p>
                    <p className="text-xs text-neutral-500">Corregir informacion incorrecta</p>
                  </div>
                  <div className="p-3 border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-lg">
                    <p className="font-medium text-neutral-800 text-sm">Rectificacion</p>
                    <p className="text-xs text-neutral-500">Modificar datos incompletos</p>
                  </div>
                  <div className="p-3 border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-lg">
                    <p className="font-medium text-neutral-800 text-sm">Oposicion</p>
                    <p className="text-xs text-neutral-500">Cesar el tratamiento de datos</p>
                  </div>
                  <div className="p-3 border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-lg md:col-span-2">
                    <p className="font-medium text-neutral-800 text-sm">Eliminacion</p>
                    <p className="text-xs text-neutral-500">Solicitar borrado de datos personales</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <div className="p-6 bg-[#4654CD]/5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800">Ejercer tus derechos</h4>
                  <p className="text-xs text-neutral-500">Contactanos para cualquier solicitud</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-neutral-700"><strong>Email:</strong> prestamos@baldecash.com</p>
                <p className="text-neutral-700"><strong>Direccion del controlador:</strong> Alfredo Benavides 1238, Oficina 404, Lima</p>
              </div>
            </div>

            {/* Protection Note */}
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Proteccion de Menores:</strong> La plataforma esta dirigida a adultos.
                BaldeCash no procesa conscientemente datos de menores sin consentimiento parental
                y eliminara tales datos rapidamente al descubrirlo.
              </p>
            </div>

            {/* Footer note */}
            <p className="text-xs text-neutral-400 text-center pt-4 border-t border-neutral-200">
              Esta politica y disputas relacionadas se rigen por la legislacion peruana.
              El acceso a servicios externos enlazados es bajo responsabilidad del usuario.
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
