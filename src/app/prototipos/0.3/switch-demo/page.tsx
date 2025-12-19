'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Custom Switch Component compatible with Tailwind v4
interface SwitchProps {
  defaultSelected?: boolean;
  isSelected?: boolean;
  onValueChange?: (value: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  isDisabled?: boolean;
  children?: React.ReactNode;
  'aria-label'?: string;
}

const sizeConfig = {
  sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 20 },
  md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 24 },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
};

const colorConfig = {
  primary: 'bg-[#4654CD]',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

function CustomSwitch({
  defaultSelected = false,
  isSelected: controlledSelected,
  onValueChange,
  size = 'md',
  color = 'primary',
  isDisabled = false,
  children,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected);

  const isControlled = controlledSelected !== undefined;
  const isOn = isControlled ? controlledSelected : internalSelected;

  const handleToggle = () => {
    if (isDisabled) return;

    if (!isControlled) {
      setInternalSelected(!isOn);
    }
    onValueChange?.(!isOn);
  };

  const { track, thumb, translate } = sizeConfig[size];
  const activeColor = colorConfig[color];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={handleToggle}
      className={`
        inline-flex items-center gap-2 cursor-pointer
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div
        className={`
          ${track} rounded-full relative transition-colors duration-200
          ${isOn ? activeColor : 'bg-neutral-300'}
        `}
      >
        <motion.div
          className={`
            ${thumb} bg-white rounded-full shadow-md absolute top-1/2
          `}
          initial={false}
          animate={{
            x: isOn ? translate : 2,
            y: '-50%',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </div>
      {children && (
        <span className="text-sm text-neutral-700 select-none">{children}</span>
      )}
    </button>
  );
}

export default function SwitchDemoPage() {
  const [controlled, setControlled] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-neutral-800 font-['Baloo_2']">
          Switch Demo - Custom Component
        </h1>

        {/* Basic */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">Basic</h2>
          <CustomSwitch defaultSelected aria-label="Automatic updates" />
        </section>

        {/* With Label */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">With Label</h2>
          <CustomSwitch defaultSelected>Automatic updates</CustomSwitch>
        </section>

        {/* Disabled */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">Disabled</h2>
          <div className="flex gap-4">
            <CustomSwitch isDisabled>Disabled off</CustomSwitch>
            <CustomSwitch isDisabled defaultSelected>Disabled on</CustomSwitch>
          </div>
        </section>

        {/* Sizes */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">Sizes</h2>
          <div className="flex gap-6 items-center">
            <CustomSwitch defaultSelected size="sm">Small</CustomSwitch>
            <CustomSwitch defaultSelected size="md">Medium</CustomSwitch>
            <CustomSwitch defaultSelected size="lg">Large</CustomSwitch>
          </div>
        </section>

        {/* Colors */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">Colors</h2>
          <div className="flex flex-wrap gap-6">
            <CustomSwitch defaultSelected color="primary">Primary</CustomSwitch>
            <CustomSwitch defaultSelected color="success">Success</CustomSwitch>
            <CustomSwitch defaultSelected color="warning">Warning</CustomSwitch>
            <CustomSwitch defaultSelected color="danger">Danger</CustomSwitch>
          </div>
        </section>

        {/* Controlled */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">Controlled</h2>
          <CustomSwitch
            isSelected={controlled}
            onValueChange={setControlled}
          >
            Airplane mode
          </CustomSwitch>
          <p className="text-sm text-neutral-500">
            Selected: <code className="bg-neutral-100 px-2 py-0.5 rounded">{controlled ? 'true' : 'false'}</code>
          </p>
        </section>

        {/* Uncontrolled (defaultSelected) */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">Uncontrolled (defaultSelected)</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Usando solo <code className="bg-neutral-100 px-1 rounded">defaultSelected</code> - el estado es interno
          </p>
          <div className="space-y-3">
            <CustomSwitch defaultSelected>
              Stock para entrega inmediata
            </CustomSwitch>
            <CustomSwitch>
              Notificaciones por email
            </CustomSwitch>
            <CustomSwitch defaultSelected>
              Modo oscuro
            </CustomSwitch>
          </div>
        </section>

        {/* BaldeCash Style */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700">BaldeCash - Disponibilidad</h2>
          <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-neutral-50 border border-neutral-200">
            <CustomSwitch defaultSelected size="sm" aria-label="Disponible ahora" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-neutral-700 font-medium block">Disponible ahora</span>
              <span className="text-xs text-neutral-400 block truncate">Stock para entrega inmediata</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
