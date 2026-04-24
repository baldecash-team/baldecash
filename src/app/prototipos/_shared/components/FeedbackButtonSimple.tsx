'use client';

/**
 * FeedbackButtonSimple - Botón de feedback con captura vía ApiFlash
 */

import { useState, useEffect } from 'react';

const FEEDBACK_API_URL = 'https://ws.baldecash.com/api/feedback';
const FEEDBACK_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3IiwianRpIjoiMmMyZWE0ZDc3OTQwZWY2ZTdmMzJlOGRkMjUwNjRhYTdhNjIyNDRmMzUzMDBkOTcyMGFjY2FhMWQxZmU4OTE2MzUxOGEwMDkzMGViZTc2NGQiLCJpYXQiOjE3NDIzMzc0OTEuMjExMzUsIm5iZiI6MTc0MjMzNzQ5MS4yMTEzNTMsImV4cCI6MTc3Mzg3MzQ5MS4xOTQ0NTUsInN1YiI6IjEiLCJzY29wZXMiOlsiKiJdfQ.GmljQKk_hSEzVFlRfZMYRpt1jtBc_Fl27Vt2UEeMT5lwN4ms1w84f-dJOObRDUyzh4--DONHc7O1WZ36SjttIqmPotbSw9UWRlrA0cDrhGzmwt6nQGAAqCth1g8pkgu5tXb737wbDq8hTHtu5FU05nLrs2bYqxtbjgp500VoQB23_xEi-5FybCX0pM3i38F6VeyPoduIiY7-FRiUq6tw153uSIcCjNpZGwkffBqw6hxQ0rgGe8G_ytFbMxha_Z0zuDL5oqXtEE2U2w4mIG2_cKygysbyPOd3Qkq_LLD_lRpOWHPASrxLdVQGpLkayCBXzHb4B-Qr0Z7zQz9LqZADqojck5J8R4ZitmPpGwHbQvh6t6IbsJuXRq9mFE37VPpqxvmHyJzo_4uM5Rm0K-jKvZ4WggUddAjDn8untElx1ncMjCmFs_kOcpnoUStv3aOQGk75635_WImjTStt05BQ_EmDoRZizUqZ2zVhlrxjmgnv1SxEiPL4jDK9jaLJWUnS2MPQX4yzhd6xwhFk0LI677xpMOiag-kFU5nC3naIc9bZBKj_Ekt1UyMejPL4KqMQsBk6g40eD6ju8qVEjNEZxYCLtgD6Qr8_dheXfXiDTQQltgrG-qSzio888E_ygdq2cawS73zf5edQiau_p_wpodbCl1O6r5BzZhRuaFF0zAA';

interface FeedbackButtonSimpleProps {
  /** Clases adicionales para el contenedor */
  className?: string;
  /** ID de la landing actual (se envía en el submit) */
  landingId?: number;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function FeedbackButtonSimple({ className, landingId }: FeedbackButtonSimpleProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener URL en el cliente para evitar error de hidratación
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const handleCapture = async () => {
    setIsCapturing(true);
    setPageUrl(window.location.href); // Actualizar URL al momento de captura

    // Esperar a que el overlay se renderice completamente
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Guardar elementos sticky/fixed para restaurar después
    const elementsToFix: { el: HTMLElement; originalStyles: { position: string; top: string; left: string; width: string; transition: string } }[] = [];
    let capturedDataUrl: string | null = null;

    try {
      // Ajustar elementos sticky y fixed para que se capturen correctamente
      // Solo buscar en elementos que típicamente son sticky/fixed (nav, header, elementos de primer nivel)
      const potentialElements = document.querySelectorAll('nav, header, [class*="navbar"], [class*="header"], [class*="sticky"], [class*="fixed"], body > div > div');

      potentialElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const computed = getComputedStyle(el);
          const position = computed.position;

          if (position === 'sticky' || position === 'fixed') {
            // No modificar elementos del feedback
            if (el.closest('[data-feedback-simple]')) {
              return;
            }
            const rect = el.getBoundingClientRect();
            elementsToFix.push({
              el,
              originalStyles: {
                position: el.style.position,
                top: el.style.top,
                left: el.style.left,
                width: el.style.width,
                transition: el.style.transition,
              },
            });
            // Desactivar transiciones y ajustar posición
            el.style.transition = 'none';
            el.style.position = 'fixed';
            el.style.top = `${rect.top + window.scrollY}px`;
            el.style.left = `${rect.left}px`;
            el.style.width = `${rect.width}px`;
          }
        }
      });

      // Usar ApiFlash para capturar screenshot
      const apiKey = '8ada1a5d9b8348c99b7ad1338351e032';
      const currentUrl = window.location.href;

      const apiUrl = new URL('https://api.apiflash.com/v1/urltoimage');
      apiUrl.searchParams.set('access_key', apiKey);
      apiUrl.searchParams.set('url', currentUrl);
      apiUrl.searchParams.set('wait_until', 'page_loaded');
      apiUrl.searchParams.set('width', String(window.innerWidth));
      apiUrl.searchParams.set('height', String(window.innerHeight));
      apiUrl.searchParams.set('format', 'jpeg');
      apiUrl.searchParams.set('quality', '80');
      apiUrl.searchParams.set('response_type', 'image');

      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error('Error al capturar screenshot con ApiFlash');
      }

      const blob = await response.blob();
      capturedDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      alert('Error al capturar la pantalla');
      console.error(error);
    }

    // Restaurar elementos sticky/fixed (siempre, incluso si hubo error)
    // Mantener transition: none durante la restauración para evitar animación
    elementsToFix.forEach(({ el, originalStyles }) => {
      el.style.position = originalStyles.position;
      el.style.top = originalStyles.top;
      el.style.left = originalStyles.left;
      el.style.width = originalStyles.width;
      // transition sigue siendo 'none' aquí
    });

    // Forzar reflow para aplicar los cambios inmediatamente
    document.body.offsetHeight;

    // Esperar un frame para que se apliquen los estilos restaurados
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Ahora restaurar las transiciones
    elementsToFix.forEach(({ el, originalStyles }) => {
      el.style.transition = originalStyles.transition;
    });

    // Esperar a que el navegador complete el repintado antes de ocultar el overlay
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Ocultar overlay y mostrar modal
    setIsCapturing(false);

    if (capturedDataUrl) {
      setScreenshot(capturedDataUrl);
      setIsModalOpen(true);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setNombre('');
    setFeedback('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('user', nombre);
      formData.append('comments', feedback);
      formData.append('url', pageUrl);
      if (landingId !== undefined) {
        formData.append('landing_id', String(landingId));
      }
      if (screenshot) {
        formData.append('attachment', dataUrlToBlob(screenshot), 'screenshot.jpg');
      }

      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${FEEDBACK_API_TOKEN}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al enviar feedback');

      alert('Feedback enviado correctamente!');
      handleClose();
    } catch (error) {
      console.error(error);
      alert('Error al enviar feedback. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Estilos inline como en el HTML original */}
      <style>{`
        .modal-overlay-simple {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.6);
          z-index: 1000;
          justify-content: center;
          align-items: center;
        }
        .modal-overlay-simple.active {
          display: flex;
        }
        .modal-simple {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .modal-header-simple {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .modal-header-simple h2 {
          margin: 0;
          font-size: 1.2em;
        }
        .modal-close-simple {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }
        .screenshot-preview-simple {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .page-url-simple {
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.85em;
          color: #666;
          margin-bottom: 15px;
          word-break: break-all;
        }
        .form-group-simple {
          margin-bottom: 15px;
        }
        .form-group-simple label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .form-group-simple input,
        .form-group-simple textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1em;
          box-sizing: border-box;
        }
        .form-group-simple textarea {
          min-height: 100px;
          resize: vertical;
        }
        .btn-submit-simple {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          width: 100%;
        }
        .btn-submit-simple:hover {
          background: #0056b3;
        }
        .feedback-btn-simple:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .loading-spinner-simple {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin-simple 0.8s linear infinite;
          margin-right: 6px;
          vertical-align: middle;
        }
        @keyframes spin-simple {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Overlay de captura - completamente opaco para ocultar el movimiento del navbar */}
      {isCapturing && (
        <div
          className="fixed inset-0 z-[200] bg-white flex items-center justify-center"
          data-feedback-simple
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-700 font-medium">Capturando pantalla...</p>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <div className={`fixed bottom-6 right-6 z-[100] ${className || ''}`} data-feedback-simple>
        <button
          className="feedback-btn-simple bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-wait"
          onClick={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <>
              <span className="loading-spinner-simple" />
              Capturando...
            </>
          ) : (
            '📸 Feedback'
          )}
        </button>
      </div>

      {/* Modal */}
      <div
        className={`modal-overlay-simple ${isModalOpen ? 'active' : ''}`}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
        data-feedback-simple
      >
        <div className="modal-simple">
          <div className="modal-header-simple">
            <h2>Enviar Feedback</h2>
            <button className="modal-close-simple" onClick={handleClose}>
              &times;
            </button>
          </div>

          {screenshot && (
            <img
              src={screenshot}
              alt="Captura de pantalla"
              className="screenshot-preview-simple"
            />
          )}

          <div className="page-url-simple">{pageUrl}</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-simple">
              <label htmlFor="nombre-simple">Nombre</label>
              <input
                type="text"
                id="nombre-simple"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre"
              />
            </div>
            <div className="form-group-simple">
              <label htmlFor="feedback-simple">Feedback</label>
              <textarea
                id="feedback-simple"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                placeholder="Describe tu feedback..."
              />
            </div>
            <button type="submit" className="btn-submit-simple" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
