/**
 * Tracking integration tests
 *
 * Verifies that components emit the correct tracking events
 * by mocking the EventTrackerContext and checking calls.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FileUpload } from '../[landing]/solicitar/components/solicitar/fields/FileUpload';
import { FaqSection } from '../components/hero/FaqSection';
import { FloatingCtaButton } from '../components/FloatingCtaButton';

// Shared mock tracker
const mockTrack = jest.fn();

jest.mock('../[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
  useEventTracker: () => ({ track: mockTrack, flush: jest.fn() }),
}));

// Mock NextUI components used by FaqSection
jest.mock('@nextui-org/react', () => ({
  Accordion: ({ children, onSelectionChange, ...props }: { children: React.ReactNode; onSelectionChange?: (keys: Set<string>) => void;[key: string]: unknown }) => (
    <div data-testid="accordion" {...props} onClick={() => onSelectionChange?.(new Set(['1']))}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, title, ...props }: { children: React.ReactNode; title: React.ReactNode;[key: string]: unknown }) => (
    <div data-testid="accordion-item" {...props}>
      <div data-testid="accordion-title">{typeof title === 'string' ? title : title}</div>
      <div>{children}</div>
    </div>
  ),
  Chip: ({ children, ...props }: { children: React.ReactNode;[key: string]: unknown }) => <span {...props}>{children}</span>,
  Button: ({ children, onPress, ...props }: { children: React.ReactNode; onPress?: () => void;[key: string]: unknown }) => (
    <button {...props} onClick={onPress}>{children}</button>
  ),
}));

beforeEach(() => {
  mockTrack.mockClear();
});

// =========================================================================
// FileUpload tracking
// =========================================================================
describe('FileUpload tracking', () => {
  const defaultProps = {
    id: 'doc_upload',
    label: 'Documento',
    value: [] as { id: string; file: File; name: string; size: number; type: string }[],
    onChange: jest.fn(),
    accept: '.pdf,.jpg',
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  };

  it('emits file_selected when a valid file is added', () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector(`input[type="file"]`) as HTMLInputElement;

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    expect(mockTrack).toHaveBeenCalledWith('file_selected', {
      field_id: 'doc_upload',
      file_count: 1,
      file_type: 'application/pdf',
    });
  });

  it('emits file_upload_error for invalid file type', () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector(`input[type="file"]`) as HTMLInputElement;

    const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    expect(mockTrack).toHaveBeenCalledWith('file_upload_error', {
      field_id: 'doc_upload',
      error: 'invalid_type',
      count: 1,
    });
  });

  it('emits file_upload_error for oversized file', () => {
    render(<FileUpload {...defaultProps} maxSize={10} />);
    const input = document.querySelector(`input[type="file"]`) as HTMLInputElement;

    const file = new File(['a'.repeat(100)], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    expect(mockTrack).toHaveBeenCalledWith('file_upload_error', {
      field_id: 'doc_upload',
      error: 'too_large',
      count: 1,
    });
  });

  it('emits file_removed when removing a file', () => {
    const existingFile = {
      id: 'f1',
      file: new File([''], 'existing.pdf'),
      name: 'existing.pdf',
      size: 100,
      type: 'application/pdf',
    };
    render(<FileUpload {...defaultProps} value={[existingFile]} />);

    const removeButton = screen.getByLabelText(/eliminar/i);
    fireEvent.click(removeButton);

    expect(mockTrack).toHaveBeenCalledWith('file_removed', { field_id: 'doc_upload' });
  });
});

// =========================================================================
// FaqSection tracking
// =========================================================================
describe('FaqSection tracking', () => {
  const faqData = {
    title: 'Preguntas Frecuentes',
    subtitle: 'Resolvemos tus dudas',
    items: [
      { id: 1, question: '¿Cómo funciona?', answer: '<p>Así funciona</p>', category: 'General' },
      { id: 2, question: '¿Cuánto cuesta?', answer: '<p>Depende</p>', category: 'Pagos' },
    ],
    categories: ['General', 'Pagos'],
  };

  it('emits faq_toggle when an accordion item is opened', () => {
    render(<FaqSection data={faqData} />);

    const accordion = screen.getByTestId('accordion');
    fireEvent.click(accordion);

    expect(mockTrack).toHaveBeenCalledWith('faq_toggle', {
      question_id: 1,
      category: 'General',
    });
  });
});

// =========================================================================
// FloatingCtaButton tracking
// =========================================================================
describe('FloatingCtaButton tracking', () => {
  const ctaConfig = {
    title: 'Solicitar ahora',
    subtitle: '¡No te lo pierdas!',
    expanded_title: 'Solicita tu laptop',
    expanded_description: 'Aprobación en 24h',
    cta_text: 'Solicitar',
    url: 'https://wa.me/123',
    icon: 'GraduationCap',
  };

  it('emits cta_click with floating_cta_expand when clicking collapsed button', () => {
    render(<FloatingCtaButton config={ctaConfig} />);

    const button = screen.getByRole('button', { name: /solicitar ahora/i });
    fireEvent.click(button);

    expect(mockTrack).toHaveBeenCalledWith('cta_click', {
      cta_name: 'floating_cta_expand',
      location: 'floating',
    });
  });

  it('emits cta_click with floating_cta_link when clicking expanded CTA link', () => {
    render(<FloatingCtaButton config={ctaConfig} />);

    // First expand it
    const button = screen.getByRole('button', { name: /solicitar ahora/i });
    fireEvent.click(button);
    mockTrack.mockClear();

    // Click the CTA link
    const link = screen.getByRole('link', { name: /solicitar/i });
    fireEvent.click(link);

    expect(mockTrack).toHaveBeenCalledWith('cta_click', {
      cta_name: 'floating_cta_link',
      href: 'https://wa.me/123',
      location: 'floating',
    });
  });
});
