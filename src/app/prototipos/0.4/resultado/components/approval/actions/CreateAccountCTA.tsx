'use client';

/**
 * CreateAccountCTA - Llamado a crear cuenta en Zona Estudiantes
 * Componente [DEFINIDO] - Una sola versión
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { User, ArrowRight, Shield, Bell, History } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreateAccountCTAProps {
  onCreateAccount?: () => void;
  variant?: 'primary' | 'secondary';
}

export const CreateAccountCTA: React.FC<CreateAccountCTAProps> = ({
  onCreateAccount,
  variant = 'secondary'
}) => {
  const benefits = [
    { icon: Bell, text: 'Recibe notificaciones del estado de tu solicitud' },
    { icon: History, text: 'Revisa el historial de tus pagos' },
    { icon: Shield, text: 'Accede a ofertas exclusivas' },
  ];

  if (variant === 'primary') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Button
          size="lg"
          className="w-full bg-[#4654CD] text-white font-semibold h-14 cursor-pointer"
          startContent={<User className="w-5 h-5" />}
          endContent={<ArrowRight className="w-5 h-5" />}
          onPress={onCreateAccount}
        >
          Crear mi cuenta
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full"
    >
      <Card className="border border-neutral-200">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#4654CD]/10 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-[#4654CD]" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-neutral-800 mb-1">
                Crea tu cuenta en Zona Estudiantes
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Accede a tu espacio personal para gestionar tu financiamiento.
              </p>

              <ul className="space-y-2 mb-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                    <benefit.icon className="w-4 h-4 text-[#4654CD]" />
                    <span>{benefit.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="bordered"
                className="border-[#4654CD] text-[#4654CD] cursor-pointer"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={onCreateAccount}
              >
                Crear cuenta
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default CreateAccountCTA;
