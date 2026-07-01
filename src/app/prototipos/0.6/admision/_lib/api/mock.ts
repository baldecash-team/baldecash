import type { ApiResult } from './client';
import type { LinkValidation, UploadUrlResp, ConfirmResp, CompleteResp } from './types';

export const mock = {
  validateLink: (token: string): ApiResult<LinkValidation> => {
    switch (token) {
      case 'demo-video-token':
        return { ok: true, data: { valid: true, purpose: 'video_validation', application_id: 123, context: { document_type_codes: ['video_negocio_1', 'video_negocio_2', 'video_negocio_3'], applicant_name: 'Juan' } } };
      // Tokens demo para previsualizar cada estado de la máquina:
      case 'demo-consumed-token':
        return { ok: true, data: { valid: false, reason: 'consumed' } };
      case 'demo-expired-token':
        return { ok: true, data: { valid: false, reason: 'expired' } };
      case 'demo-revoked-token':
        return { ok: true, data: { valid: false, reason: 'revoked' } };
      case 'demo-mismatch-token':
        return { ok: true, data: { valid: false, reason: 'purpose_mismatch' } };
      default:
        return { ok: true, data: { valid: false, reason: 'invalid' } };
    }
  },
  requestUploadUrl: (body: { content_type: string; document_type_code?: string }): ApiResult<UploadUrlResp> =>
    ({ ok: true, data: { file_key: `mock-key-${body.document_type_code ?? 'x'}`, upload_url: `mock://put`, content_type: body.content_type, expires_in: 3600 } }),
  confirmUpload: (body: { file_key: string; document_type_code?: string }): ApiResult<ConfirmResp> =>
    ({ ok: true, data: { success: true, application_document_id: 999, file_key: body.file_key, view_url: 'mock://view', document_type: { code: body.document_type_code ?? 'x', name: 'Video' }, message: 'Video confirmado correctamente' } }),
  complete: (_token: string, _body?: { latitude: number; longitude: number; accuracy_m?: number }): ApiResult<CompleteResp> => ({ ok: true, data: { completed: true, application_id: 123, workflow_resumed: true } }),
};
