'use client';

/**
 * InstitutionalBannerV3 - Seccion dedicada con beneficios
 *
 * Caracteristicas:
 * - Seccion completa con mas informacion
 * - Lista de beneficios del convenio
 * - Mas espacio para comunicar valor
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Building, Gift, Percent, Clock, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { InstitutionalBannerProps } from '../../../types/hero';

export const InstitutionalBannerV3: React.FC<InstitutionalBannerProps> = ({
  institution,
  onSearch,
}) => {
  const defaultBenefits = [
    { icon: Percent, text: 'Tasas preferenciales' },
    { icon: Clock, text: 'Aprobacion express' },
    { icon: Shield, text: 'Sin aval requerido' },
    { icon: Gift, text: 'Beneficios exclusivos' },
  ];

  if (!institution) {
    return (
      <div className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border border-[#4654CD]/20 bg-white">
            <CardBody className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                    <Building className="w-6 h-6 text-[#4654CD]" />
                    <h3 className="text-xl font-semibold text-neutral-900">
                      Convenios Institucionales
                    </h3>
                  </div>
                  <p className="text-neutral-600 mb-6">
                    Mas de 32 instituciones educativas confian en nosotros.
                    Busca la tuya y accede a beneficios exclusivos.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {defaultBenefits.map((benefit) => (
                      <div
                        key={benefit.text}
                        className="flex items-center gap-2 text-sm text-neutral-600"
                      >
                        <benefit.icon className="w-4 h-4 text-[#4654CD]" />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Button
                    className="bg-[#4654CD] text-white font-semibold px-8 cursor-pointer"
                    size="lg"
                    endContent={<ArrowRight className="w-5 h-5" />}
                    onPress={onSearch}
                  >
                    Buscar mi institucion
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-12 bg-[#4654CD]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-[#4654CD]">
                {institution.code.substring(0, 2)}
              </span>
            </div>
            <div className="text-white">
              <p className="text-sm opacity-80">Convenio activo con</p>
              <h3 className="text-2xl font-bold">{institution.name}</h3>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {defaultBenefits.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-center gap-2 text-white/90"
              >
                <benefit.icon className="w-4 h-4" />
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          <Button
            className="bg-white text-[#4654CD] font-semibold px-8 cursor-pointer"
            size="lg"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            Ver mis beneficios
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InstitutionalBannerV3;
