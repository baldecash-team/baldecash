/**
 * BAL-5361: «Enviando tu solicitud» de Diseño 2 (prototipo de Brenda v58).
 * Los 3 pasos avanzan con el `SubmitStage` real del envío, sin «Subiendo
 * archivos»; Diseño 1 (`SubmitOverlay` sin `diseno2`) no cambia.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EsperaEnvioV2 } from '../EsperaEnvioV2';
import { pasosDeLaEspera, subtituloDeLaEspera } from '../esperaEnvio';
import { SubmitOverlay } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/submit/SubmitOverlay';
import type { SubmitStage } from '@/app/prototipos/0.6/[landing]/solicitar/hooks/useSubmitApplication';

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayoutOptional: () => ({ navbarProps: { logoUrl: 'https://cdn.example/logo.png' } }),
}));

const estados = (stage: SubmitStage) => pasosDeLaEspera(stage).map((p) => p.estado);

describe('pasosDeLaEspera', () => {
  it('los 3 pasos del prototipo, con su línea de apoyo', () => {
    expect(pasosDeLaEspera('validating').map((p) => [p.titulo, p.detalle])).toEqual([
      ['Revisando tus datos', 'Que todo esté completo'],
      ['Registrando tu solicitud', 'Guardamos tus datos'],
      ['Solicitud enviada', 'Ya la recibimos'],
    ]);
  });

  it('avanza con el envío real', () => {
    expect(estados('validating')).toEqual(['actual', 'pendiente', 'pendiente']);
    expect(estados('uploading')).toEqual(['hecho', 'actual', 'pendiente']);
    expect(estados('processing')).toEqual(['hecho', 'actual', 'pendiente']);
    expect(estados('slow')).toEqual(['hecho', 'actual', 'pendiente']);
    expect(estados('success')).toEqual(['hecho', 'hecho', 'hecho']);
  });

  it('si tarda (slow) cambia el texto de debajo del título', () => {
    expect(subtituloDeLaEspera('processing')).toBe('Tarda unos segundos.');
    expect(subtituloDeLaEspera('slow')).toBe('Está tardando un poco más de lo normal. Sigue en esta página.');
  });
});

describe('EsperaEnvioV2', () => {
  it('pinta los textos del prototipo, sin «Subiendo archivos»', () => {
    const { container } = render(<EsperaEnvioV2 stage="processing" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('heading', { name: 'Enviando tu solicitud' })).toBeInTheDocument();
    expect(screen.getByText('Tarda unos segundos.')).toBeInTheDocument();
    expect(screen.getByText('Progreso del envío')).toBeInTheDocument();
    expect(screen.getByText('No cierres ni actualices esta página')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Subiendo archivos/);
    expect(screen.getByRole('img', { name: 'BaldeCash' })).toHaveAttribute('src', 'https://cdn.example/logo.png');
  });

  it('marca el paso en curso y llena el tramo del paso hecho', () => {
    const { container } = render(<EsperaEnvioV2 stage="processing" />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[1]).toHaveTextContent('Registrando tu solicitud');
    expect(container.querySelectorAll('[data-paso-estado]')[0]).toHaveAttribute('data-paso-estado', 'hecho');
    const tramos = Array.from(container.querySelectorAll('[data-tramo-lleno]')).map((t) => t.getAttribute('data-tramo-lleno'));
    expect(tramos).toEqual(['1', '0']);
  });

  it('con éxito, los tres pasos quedan hechos', () => {
    const { container } = render(<EsperaEnvioV2 stage="success" />);
    const estadosPintados = Array.from(container.querySelectorAll('[data-paso-estado]')).map((n) => n.getAttribute('data-paso-estado'));
    expect(estadosPintados).toEqual(['hecho', 'hecho', 'hecho']);
  });
});

describe('SubmitOverlay', () => {
  it('con diseno2 pinta la espera de Diseño 2', () => {
    const { container } = render(<SubmitOverlay isOpen stage="validating" diseno2 />);
    expect(container.ownerDocument.querySelector('[data-espera-envio-v2]')).not.toBeNull();
  });

  it('con diseno2 pero cerrado o con error no pinta nada', () => {
    render(<SubmitOverlay isOpen={false} stage="validating" diseno2 />);
    render(<SubmitOverlay isOpen stage="error" diseno2 />);
    expect(document.querySelector('[data-espera-envio-v2]')).toBeNull();
  });

  it('Diseño 1 sigue igual (sin diseno2)', () => {
    render(<SubmitOverlay isOpen stage="processing" />);
    expect(document.querySelector('[data-espera-envio-v2]')).toBeNull();
    expect(screen.getByText('Validando datos')).toBeInTheDocument();
  });
});
