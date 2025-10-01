import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

/**
 * Input Sanitization Configuration and Utilities
 * Provides XSS protection and input validation
 */

// Default sanitization options for user-generated content
const DEFAULT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
  ],
  allowedAttributes: {
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
};

// Strict sanitization for form inputs (no HTML allowed)
const STRICT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedSchemes: [],
};

/**
 * Sanitize HTML content while preserving basic formatting
 */
export function sanitizeHtmlContent(input: string): string {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input.trim(), DEFAULT_SANITIZE_OPTIONS);
}

/**
 * Strict sanitization - removes all HTML tags, attributes, and dangerous URL schemes
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';

  // First remove HTML tags
  let cleaned = sanitizeHtml(input.trim(), STRICT_SANITIZE_OPTIONS);

  // Then remove dangerous URL schemes from plain text
  // These can be used for XSS attacks even in plain text contexts
  const dangerousSchemes = [
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /file:/gi,
    /about:/gi,
  ];

  dangerousSchemes.forEach(scheme => {
    cleaned = cleaned.replace(scheme, '');
  });

  return cleaned;
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  strict = false
): T {
  const sanitizer = strict ? sanitizeText : sanitizeHtmlContent;
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizer(value) as T[keyof T];
    } else if (value instanceof Date) {
      // Preserve Date objects
      sanitized[key as keyof T] = value;
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item =>
        typeof item === 'string'
          ? sanitizer(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item, strict)
            : item
      ) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value, strict);
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Common validation schemas with built-in sanitization
 */
export const secureSchemas = {
  // Safe text input (no HTML, length limited)
  safeText: (maxLength = 1000) =>
    z
      .string()
      .max(maxLength)
      .transform(sanitizeText)
      .refine(val => val.length > 0, {
        message: 'Text cannot be empty after sanitization',
      }),

  // Email with sanitization
  email: z.string().email().transform(sanitizeText),

  // HTML content with basic formatting allowed
  htmlContent: (maxLength = 5000) =>
    z.string().max(maxLength).transform(sanitizeHtmlContent),

  // URL with sanitization
  url: z.string().url().transform(sanitizeText),

  // Username (alphanumeric + underscore/dash only)
  username: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and dashes'
    )
    .min(3)
    .max(30)
    .transform(sanitizeText),

  // Meeting room name
  roomName: z
    .string()
    .regex(
      /^[a-zA-Z0-9-_\s]+$/,
      'Room name can only contain letters, numbers, spaces, underscores, and dashes'
    )
    .min(1)
    .max(100)
    .transform(sanitizeText),
};

/**
 * Middleware function for sanitizing API request bodies
 */
export function createSanitizationMiddleware<T extends z.ZodSchema>(schema: T) {
  return (data: unknown) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw new Error('Invalid input data');
    }
  };
}

/**
 * Sanitize file names for secure file uploads
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}
