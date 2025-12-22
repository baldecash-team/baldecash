'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Users, Check, ArrowRight, Shield } from 'lucide-react';

interface CosignerOptionProps {
  className?: string;
}

/**
 * CosignerOption - Opción de Codeudor
 * Explica visualmente la opción de aplicar con un codeudor
 * DEFINIDO: Con ilustración simple de 2 personas
 */
export const CosignerOption: React.FC<CosignerOptionProps> = ({ className = '' }) => {
  return (
    <Card className={`overflow-visible ${className}`}>
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Ilustración de 2 personas */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24">
              {/* Persona 1 (usuario) */}
              <div className="absolute left-0 top-2 w-14 h-14 bg-[#4654CD]/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-[#4654CD] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">Tú</span>
                </div>
              </div>
              {/* Persona 2 (codeudor) */}
              <div className="absolute right-0 top-2 w-14 h-14 bg-[#03DBD0]/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-[#03DBD0] rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              {/* Línea de conexión */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-neutral-300 rounded-full" />
              {/* Escudo de aprobación */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Aplica con un codeudor
            </h3>
            <p className="text-neutral-600 text-sm mb-4">
              Un familiar mayor de 25 años con ingresos comprobables puede respaldar tu solicitud y aumentar tus posibilidades de aprobación.
            </p>

            {/* Beneficios */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-700">Mayor probabilidad de aprobación</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-700">Acceso a montos más altos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-700">Proceso 100% digital</span>
              </div>
            </div>

            {/* Requisitos del codeudor */}
            <div className="bg-neutral-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-neutral-600 mb-2">¿Quién puede ser codeudor?</p>
              <ul className="text-xs text-neutral-500 space-y-1">
                <li>• Familiar directo (padre, madre, hermano/a, tío/a)</li>
                <li>• Mayor de 25 años</li>
                <li>• Con ingresos demostrables</li>
                <li>• Sin deudas en mora</li>
              </ul>
            </div>

            <Button
              className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
              endContent={<ArrowRight className="w-4 h-4" />}
            >
              Solicitar con codeudor
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
