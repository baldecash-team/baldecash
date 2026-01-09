'use client';

/**
 * FeedbackButtonSimple - Botón de feedback usando modern-screenshot
 * Implementación simple basada en el ejemplo de tunel/index.html
 */

import { useState } from 'react';
import { domToPng } from 'modern-screenshot';

interface FeedbackButtonSimpleProps {
  /** Clases adicionales para el contenedor */
  className?: string;
}

export function FeedbackButtonSimple({ className }: FeedbackButtonSimpleProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleCapture = async () => {
    setIsCapturing(true);

    // Guardar elementos sticky para restaurar después
    const stickyElements: { el: HTMLElement; originalStyles: { position: string; top: string; left: string; width: string } }[] = [];

    try {
      // Convertir elementos sticky a fixed para que se capturen correctamente
      document.querySelectorAll('*').forEach((el) => {
        if (el instanceof HTMLElement) {
          const computed = getComputedStyle(el);
          if (computed.position === 'sticky') {
            const rect = el.getBoundingClientRect();
            stickyElements.push({
              el,
              originalStyles: {
                position: el.style.position,
                top: el.style.top,
                left: el.style.left,
                width: el.style.width,
              },
            });
            el.style.position = 'fixed';
            el.style.top = `${rect.top}px`;
            el.style.left = `${rect.left}px`;
            el.style.width = `${rect.width}px`;
          }
        }
      });

      const dataUrl = await domToPng(document.body, {
        scale: 1,
        quality: 0.8,
        width: window.innerWidth,
        height: window.innerHeight,
        style: {
          transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`,
        },
      });
      setScreenshot(dataUrl);
      setIsModalOpen(true);
    } catch (error) {
      alert('Error al capturar la pantalla');
      console.error(error);
    } finally {
      // Restaurar elementos sticky
      stickyElements.forEach(({ el, originalStyles }) => {
        el.style.position = originalStyles.position;
        el.style.top = originalStyles.top;
        el.style.left = originalStyles.left;
        el.style.width = originalStyles.width;
      });
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setNombre('');
    setFeedback('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback enviado:', {
      nombre,
      feedback,
      url: window.location.href,
      screenshot,
    });
    alert('Feedback enviado correctamente!');
    handleClose();
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

      {/* Botón flotante */}
      <div className={`fixed bottom-6 right-6 z-[100] ${className || ''}`}>
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

          <div className="page-url-simple">{typeof window !== 'undefined' ? window.location.href : ''}</div>

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
            <button type="submit" className="btn-submit-simple">
              Enviar Feedback
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
