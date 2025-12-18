'use client';

/**
 * DniAutocompleteFeedback - Feedback de autocompletado RENIEC
 *
 * 3 versiones de animacion:
 * V1 - Skeleton en campos mientras carga
 * V2 - Spinner + mensaje "Buscando tus datos..."
 * V3 - Progress bar con pasos
 */

import React from 'react';
import { Skeleton, Progress, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, User, Calendar, MapPin } from 'lucide-react';
import type { ReniecData } from '../types';

interface DniAutocompleteFeedbackProps {
  isLoading: boolean;
  data: ReniecData | null;
  version: 1 | 2 | 3;
  dataAppearVersion?: 1 | 2 | 3;
}

/**
 * V1 - Skeleton en campos mientras carga
 */
const FeedbackV1Loading: React.FC = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-16 rounded" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  </div>
);

/**
 * V2 - Spinner + mensaje
 */
const FeedbackV2Loading: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <div className="w-12 h-12 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#4654CD] animate-spin" />
    </div>
    <div className="text-center">
      <p className="font-medium text-neutral-800">Buscando tus datos...</p>
      <p className="text-sm text-neutral-500">Consultando RENIEC</p>
    </div>
  </div>
);

/**
 * V3 - Progress bar con pasos
 */
const FeedbackV3Loading: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const [step, setStep] = React.useState(0);

  const steps = [
    { label: 'Conectando con RENIEC', icon: Loader2 },
    { label: 'Verificando DNI', icon: User },
    { label: 'Obteniendo datos', icon: Calendar },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 5;
      });
    }, 75);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (progress < 33) setStep(0);
    else if (progress < 66) setStep(1);
    else setStep(2);
  }, [progress]);

  const CurrentIcon = steps[step].icon;

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
          <CurrentIcon className="w-5 h-5 text-[#4654CD] animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-800">{steps[step].label}</p>
          <Progress
            value={progress}
            size="sm"
            color="primary"
            className="mt-1"
            classNames={{
              indicator: 'bg-[#4654CD]',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Data display with animations
 */
interface DataDisplayProps {
  data: ReniecData;
  appearVersion: 1 | 2 | 3;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ data, appearVersion }) => {
  const fields = [
    { label: 'Nombres', value: data.nombres, icon: User },
    { label: 'Apellidos', value: data.apellidos, icon: User },
    { label: 'Fecha de nacimiento', value: formatDate(data.fechaNacimiento), icon: Calendar },
  ];

  const getAnimationProps = (index: number) => {
    switch (appearVersion) {
      case 1: // Fade in todos juntos
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 },
        };
      case 2: // Cascada uno por uno
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: index * 0.15 },
        };
      case 3: // Aparicion instantanea
      default:
        return {};
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Chip
          size="sm"
          radius="sm"
          startContent={<Check className="w-3 h-3" />}
          classNames={{
            base: 'bg-[#22c55e]/10 px-2 py-0.5 h-auto',
            content: 'text-[#22c55e] text-xs font-medium',
          }}
        >
          Datos obtenidos de RENIEC
        </Chip>
      </div>

      {fields.map((field, index) => {
        const Icon = field.icon;
        const animProps = getAnimationProps(index);

        return (
          <motion.div
            key={field.label}
            {...animProps}
            className="space-y-1"
          >
            <label className="text-sm font-medium text-neutral-500">
              {field.label}
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
              <Icon className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-800 font-medium">{field.value}</span>
              <Check className="w-4 h-4 text-[#22c55e] ml-auto" />
            </div>
          </motion.div>
        );
      })}

      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-2">
        <MapPin className="w-3 h-3" />
        Estos datos no pueden ser editados
      </p>
    </div>
  );
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Main component
 */
export const DniAutocompleteFeedback: React.FC<DniAutocompleteFeedbackProps> = ({
  isLoading,
  data,
  version,
  dataAppearVersion = 1,
}) => {
  if (isLoading) {
    switch (version) {
      case 1:
        return <FeedbackV1Loading />;
      case 2:
        return <FeedbackV2Loading />;
      case 3:
        return <FeedbackV3Loading />;
      default:
        return <FeedbackV1Loading />;
    }
  }

  if (data) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DataDisplay data={data} appearVersion={dataAppearVersion} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};

export default DniAutocompleteFeedback;
