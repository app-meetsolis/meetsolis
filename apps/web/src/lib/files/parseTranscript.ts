/**
 * Parse transcript from uploaded file (.txt, .docx) or pasted text.
 * Returns plain text string suitable for AI summarization.
 */

export async function parseTranscriptFile(file: File): Promise<string> {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return file.text();
  }

  if (
    file.name.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${file.name}. Use .txt or .docx.`);
}

export function validateTranscriptText(text: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) return { valid: false, error: 'Transcript is empty' };
  if (trimmed.length < 100)
    return {
      valid: false,
      error: 'Transcript too short (minimum 100 characters)',
    };
  if (trimmed.length > 500_000)
    return {
      valid: false,
      error: 'Transcript too large (maximum 500,000 characters)',
    };
  return { valid: true };
}
