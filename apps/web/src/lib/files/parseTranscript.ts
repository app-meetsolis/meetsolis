export type TranscriptSourceType = 'txt' | 'docx' | 'paste';

export interface ParsedTranscript {
  text: string;
  sourceType: TranscriptSourceType;
}

/**
 * Parse a transcript file client-side.
 * .txt: read as UTF-8 text directly.
 * .docx: returns empty text — server parses .docx with mammoth (Node.js).
 */
export async function parseTranscript(file: File): Promise<ParsedTranscript> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') {
    const text = await file.text();
    return { text, sourceType: 'txt' };
  }

  if (extension === 'docx') {
    // Parsed server-side — return empty so server handles extraction
    return { text: '', sourceType: 'docx' };
  }

  throw new Error(`Unsupported file type: .${extension}`);
}
