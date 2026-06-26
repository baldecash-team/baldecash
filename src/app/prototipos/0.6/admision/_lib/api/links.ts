import { config } from '../config';
import { apiFetch, type ApiResult } from './client';
import { mock } from './mock';
import type { LinkValidation, UploadUrlResp, ConfirmResp, CompleteResp, SendEmailResp, VerifyEmailResp, EmailStatusResp } from './types';

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
export async function completeLink(token: string): Promise<ApiResult<CompleteResp>> {
  if (config.apiMode === 'mock') return mock.completeLink();
  return apiFetch(`/public/links/${token}/complete`, { method: 'POST' });
}
export async function sendEmailByToken(token: string): Promise<ApiResult<SendEmailResp>> {
  if (config.apiMode === 'mock') return mock.sendEmailVerification();
  return apiFetch(`/public/links/${token}/email/send`, { method: 'POST' });
}
export async function verifyEmailByToken(token: string, code: string): Promise<ApiResult<VerifyEmailResp>> {
  if (config.apiMode === 'mock') return mock.verifyEmailCode(code);
  return apiFetch(`/public/links/${token}/email/verify`, { method: 'POST', body: JSON.stringify({ code }) });
}
export async function emailStatusByToken(token: string): Promise<ApiResult<EmailStatusResp>> {
  if (config.apiMode === 'mock') return mock.emailStatus();
  return apiFetch(`/public/links/${token}/email/status`);
}
