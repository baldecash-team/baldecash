'use client';

/**
 * Cronograma - Tabla de Cuotas Mensual (basado en V2)
 * Detailed table showing each month's payment with collapsible sections.
 */

import React, { useState } from 'react';
import { Calendar, Check, ChevronDown, ChevronUp, Info, Download, FileText, Percent, AlertCircle, Scale } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from '@nextui-org/react';
import { CronogramaProps } from '../../../types/detail';
import { formatMoney } from '../../../../utils/formatMoney';
import { Toast } from '@/app/prototipos/_shared';

const TERMS = [12, 18, 24, 36, 48];

const FINANCIAL_DATA = {
  tea: 49.36,
  tcea: 52.18,
  comisionDesembolso: 0,
  seguroDesgravamen: 1.5,
  seguroMultiriesgo: 0,
  gastoNotarial: 0,
  itiConvenio: 0,
};

export const Cronograma: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const baseTotal = monthlyQuota * term;
  const adjustedQuota = baseTotal / selectedTerm;

  const getMonthDate = (monthIndex: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthIndex);
    return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  };

  const visibleMonths = showAll ? selectedTerm : Math.min(6, selectedTerm);
  const hasMore = selectedTerm > 6;
  const totalPayment = adjustedQuota * selectedTerm;

  const handleDownloadPDF = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Detalle de Cuotas</h3>
              <p className="text-sm text-neutral-500">{selectedTerm} pagos mensuales</p>
            </div>
          </div>

          {/* Term Pills */}
          <div className="flex gap-1 flex-wrap">
            {TERMS.map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedTerm(t); setShowAll(false); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  selectedTerm === t
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {t}m
              </button>
            ))}
          </div>
        </div>

        {/* Payment Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Cuota</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Fecha</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Monto</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: visibleMonths }, (_, i) => (
                <tr
                  key={i}
                  className={`border-t border-neutral-100 ${i === visibleMonths - 1 && !showAll ? 'bg-gradient-to-t from-white to-transparent' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === selectedTerm - 1
                          ? 'bg-green-100 text-green-600'
                          : 'bg-[#4654CD]/10 text-[#4654CD]'
                      }`}>
                        {i + 1}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600 capitalize">
                    {getMonthDate(i)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-neutral-900">
                      S/{formatMoney(adjustedQuota)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show More/Less */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-[#4654CD] hover:bg-[#4654CD]/5 rounded-lg transition-colors cursor-pointer"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver las {selectedTerm - 6} cuotas restantes
              </>
            )}
          </button>
        )}

        {/* Total Summary */}
        <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-600">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Total a pagar</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            S/{formatMoney(totalPayment)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="bordered"
            className="flex-1 border-[#4654CD] text-[#4654CD] cursor-pointer"
            startContent={<Info className="w-4 h-4" />}
            onPress={() => setIsModalOpen(true)}
          >
            Ver detalle de pago
          </Button>
          <Button
            variant="bordered"
            className="flex-1 border-neutral-300 text-neutral-700 cursor-pointer"
            startContent={<Download className="w-4 h-4" />}
            onPress={handleDownloadPDF}
          >
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white",
          closeButton: "right-4 top-4 hover:bg-neutral-100 rounded-lg cursor-pointer",
        }}
      >
        <ModalContent className="bg-white">
          <ModalHeader className="flex items-center gap-3 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Detalle del Financiamiento</h3>
              <p className="text-sm font-normal text-neutral-500">Informacion completa de tu credito</p>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            {/* Summary */}
            <div className="bg-[#4654CD]/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-600">Cuota mensual</span>
                <span className="text-xl font-bold text-[#4654CD]">S/{formatMoney(adjustedQuota)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Plazo</span>
                <span className="font-semibold text-neutral-900">{selectedTerm} meses</span>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#4654CD]" />
                Tasas de Interes
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">TEA (Tasa Efectiva Anual)</p>
                  <p className="text-lg font-bold text-neutral-900">{FINANCIAL_DATA.tea}%</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">TCEA (Tasa de Costo Efectivo Anual)</p>
                  <p className="text-lg font-bold text-neutral-900">{FINANCIAL_DATA.tcea}%</p>
                </div>
              </div>

              <Divider className="my-4" />

              <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#4654CD]" />
                Comisiones y Seguros
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Comision de desembolso</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {FINANCIAL_DATA.comisionDesembolso > 0 ? `S/${FINANCIAL_DATA.comisionDesembolso}` : 'Sin costo'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Seguro de desgravamen</span>
                  <span className="text-sm font-medium text-neutral-900">{FINANCIAL_DATA.seguroDesgravamen}% mensual</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Seguro multiriesgo</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {FINANCIAL_DATA.seguroMultiriesgo > 0 ? `S/${FINANCIAL_DATA.seguroMultiriesgo}` : 'No aplica'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Gastos notariales</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {FINANCIAL_DATA.gastoNotarial > 0 ? `S/${FINANCIAL_DATA.gastoNotarial}` : 'Sin costo'}
                  </span>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Total */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-neutral-600">Monto total a pagar</p>
                    <p className="text-xs text-neutral-500">{selectedTerm} cuotas de S/{formatMoney(adjustedQuota)}</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">S/{formatMoney(totalPayment)}</p>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="flex items-start gap-2 text-xs text-neutral-500 mt-4">
                <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Esta informacion es referencial. Las tasas y condiciones finales seran confirmadas al momento de la aprobacion.
                  Consulta nuestros <a href="/prototipos/0.5/legal/terminos" className="text-[#4654CD] underline">Terminos y Condiciones</a> y
                  <a href="/prototipos/0.5/legal/privacidad" className="text-[#4654CD] underline ml-1">Politica de Privacidad</a>.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-neutral-100">
            <Button
              variant="bordered"
              className="border-neutral-300 cursor-pointer"
              onPress={() => setIsModalOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              startContent={<Download className="w-4 h-4" />}
              onPress={handleDownloadPDF}
            >
              Descargar PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Toast - Success */}
      <Toast
        message="Archivo PDF descargado correctamente"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

export default Cronograma;
