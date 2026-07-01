import { config } from '../config';
import { apiFetch, type ApiResult } from './client';
import { mock } from './mock';
import type { SendEmailResp, VerifyEmailResp, EmailStatusResp } from './types';

export async function sendEmailVerification(application_id: number, document_number: string): Promise<ApiResult<SendEmailResp>> {
  if (config.apiMode === 'mock') return mock.sendEmailVerification();
  return apiFetch('/public/email-verification/send', { method: 'POST', body: JSON.stringify({ application_id, document_number }) });
}

export async function verifyEmailCode(application_id: number, document_number: string, code: string): Promise<ApiResult<VerifyEmailResp>> {
  if (config.apiMode === 'mock') return mock.verifyEmailCode(code);
  return apiFetch('/public/email-verification/verify', { method: 'POST', body: JSON.stringify({ application_id, document_number, code }) });
}

export async function getEmailStatus(application_id: number, document_number: string): Promise<ApiResult<EmailStatusResp>> {
  if (config.apiMode === 'mock') return mock.emailStatus();
  return apiFetch('/public/email-verification/status', { method: 'POST', body: JSON.stringify({ application_id, document_number }) });
}
