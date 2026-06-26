export type SendEmailResp = { status: 'sent' | 'already_verified'; email: string; channel?: string; expires_at?: string; expires_in_minutes?: number };
export type VerifyEmailResp = { verified: boolean; status: string; verified_at?: string; workflow_resumed?: boolean };
export type EmailStatusResp = { verified: boolean; email: string; pending: boolean; expires_at?: string; attempts_used: number };

/** Contexto del link. `applicant_name` (mejora #6) lo agrega el backend para personalizar la pantalla. */
export type LinkContext = { document_type_codes?: string[]; applicant_name?: string } | null;

export type LinkValidation =
  | { valid: true; purpose: string; application_id: number; expires_at?: string; context?: LinkContext }
  | { valid: false; reason: string };
export type UploadUrlResp = { file_key: string; upload_url: string; content_type: string; expires_in: number };
export type ConfirmResp = { success: boolean; application_document_id: number; file_key: string; view_url: string; document_type?: { code: string; name: string }; message?: string };
export type CompleteResp = { completed: boolean; application_id: number; workflow_resumed: boolean };
