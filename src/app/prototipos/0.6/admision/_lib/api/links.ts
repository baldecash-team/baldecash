import { config } from '../config';
import { apiFetch, type ApiResult } from './client';
import { mock } from './mock';
import type { LinkValidation, UploadUrlResp, ConfirmResp, CompleteResp } from './types';

export async function validateLink(token: string): Promise<ApiResult<LinkValidation>> {
  if (config.apiMode === 'mock') return mock.validateLink(token);
  return apiFetch(`/public/links/${token}`);
}
export async function requestUploadUrl(token: string, body: { filename: string; content_type: string; file_size_bytes: number; document_type_code?: string }): Promise<ApiResult<UploadUrlResp>> {
  if (config.apiMode === 'mock') return mock.requestUploadUrl(body);
  return apiFetch(`/public/links/${token}/upload-url`, { method: 'POST', body: JSON.stringify(body) });
}
export async function confirmUpload(token: string, body: { file_key: string; document_type_code?: string }): Promise<ApiResult<ConfirmResp>> {
  if (config.apiMode === 'mock') return mock.confirmUpload(body);
  return apiFetch(`/public/links/${token}/confirm`, { method: 'POST', body: JSON.stringify(body) });
}
export async function completeLink(
  token: string,
  body: { latitude: number; longitude: number; accuracy_m?: number },
): Promise<ApiResult<CompleteResp>> {
  if (config.apiMode === 'mock') return mock.complete(token, body);
  return apiFetch<CompleteResp>(`/public/links/${token}/complete`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
