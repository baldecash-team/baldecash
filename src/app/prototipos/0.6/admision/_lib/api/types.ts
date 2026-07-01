/** Una pregunta del banco horneada en el context del link (snapshot). */
export type VideoQuestion = { code: string; description: string; example_video_url?: string };

/** Contexto del link. `applicant_name` lo agrega el backend para personalizar. */
export type LinkContext = {
  document_type_codes?: string[];
  questions?: VideoQuestion[];
  applicant_name?: string;
} | null;

export type LinkValidation =
  | { valid: true; purpose: string; application_id: number; expires_at?: string; context?: LinkContext }
  | { valid: false; reason: string };
export type UploadUrlResp = { file_key: string; upload_url: string; content_type: string; expires_in: number };
export type ConfirmResp = { success: boolean; application_document_id: number; file_key: string; view_url: string; document_type?: { code: string; name: string }; message?: string };
export type CompleteResp = { completed: boolean; application_id: number; workflow_resumed: boolean };
