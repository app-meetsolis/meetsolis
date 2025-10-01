/**
 * Input Sanitization Test Suite
 * Tests for XSS prevention and input validation
 */

import {
  sanitizeHtmlContent,
  sanitizeText,
  sanitizeObject,
  secureSchemas,
  createSanitizationMiddleware,
  sanitizeFileName,
} from '@/lib/security/sanitization';

describe('Input Sanitization', () => {
  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World<b>Bold</b>';
      const result = sanitizeText(input);
      expect(result).toBe('Hello WorldBold');
    });

    it('should handle empty and non-string inputs', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText(null as any)).toBe('');
      expect(sanitizeText(undefined as any)).toBe('');
      expect(sanitizeText(123 as any)).toBe('');
    });

    it('should remove dangerous scripts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>',
      ];

      maliciousInputs.forEach(input => {
        const result = sanitizeText(input);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('onload');
        expect(result).not.toContain('<iframe>');
      });
    });
  });

  describe('sanitizeHtmlContent', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtmlContent(input);
      expect(result).toBe('<p>Hello <strong>World</strong></p>');
    });

    it('should remove dangerous HTML', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtmlContent(input);
      expect(result).toBe('<p>Hello</p>');
    });

    it('should allow basic formatting tags', () => {
      const input =
        '<h1>Title</h1><p>Paragraph with <em>emphasis</em> and <strong>bold</strong></p>';
      const result = sanitizeHtmlContent(input);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<em>emphasis</em>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should remove dangerous attributes', () => {
      const input = '<p onclick="alert(1)">Hello</p>';
      const result = sanitizeHtmlContent(input);
      expect(result).not.toContain('onclick');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string properties', () => {
      const input = {
        name: '<script>alert("xss")</script>John',
        description: '<p>Hello <b>World</b></p>',
      };

      const result = sanitizeObject(input, true);
      expect(result.name).toBe('John');
      expect(result.description).toBe('Hello World');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: '<p>Developer</p>',
          },
        },
      };

      const result = sanitizeObject(input, true);
      expect(result.user.name).toBe('John');
      expect(result.user.profile.bio).toBe('Developer');
    });

    it('should handle arrays', () => {
      const input = {
        tags: ['<script>alert("xss")</script>tag1', '<b>tag2</b>'],
        users: [
          { name: '<script>alert("xss")</script>John' },
          { name: '<b>Jane</b>' },
        ],
      };

      const result = sanitizeObject(input, true);
      expect(result.tags).toEqual(['tag1', 'tag2']);
      expect(result.users[0].name).toBe('John');
      expect(result.users[1].name).toBe('Jane');
    });

    it('should preserve non-string values', () => {
      const input = {
        id: 123,
        active: true,
        date: new Date(),
        metadata: null,
        config: { count: 5 },
      };

      const result = sanitizeObject(input);
      expect(result.id).toBe(123);
      expect(result.active).toBe(true);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.metadata).toBeNull();
      expect(result.config.count).toBe(5);
    });
  });

  describe('secureSchemas', () => {
    describe('safeText', () => {
      const schema = secureSchemas.safeText(50);

      it('should validate and sanitize safe text', () => {
        const result = schema.parse('Hello World');
        expect(result).toBe('Hello World');
      });

      it('should sanitize dangerous text', () => {
        const result = schema.parse('<script>alert("xss")</script>Hello');
        expect(result).toBe('Hello');
      });

      it('should enforce length limits', () => {
        expect(() => schema.parse('a'.repeat(60))).toThrow();
      });

      it('should reject empty strings after sanitization', () => {
        expect(() => schema.parse('<script>alert("xss")</script>')).toThrow();
      });
    });

    describe('email', () => {
      it('should validate email format', () => {
        const result = secureSchemas.email.parse('user@example.com');
        expect(result).toBe('user@example.com');
      });

      it('should reject invalid emails', () => {
        expect(() => secureSchemas.email.parse('invalid-email')).toThrow();
      });

      it('should sanitize email input', () => {
        const result = secureSchemas.email.parse('user@example.com');
        expect(result).toBe('user@example.com');
      });
    });

    describe('username', () => {
      it('should allow valid usernames', () => {
        const validUsernames = ['john_doe', 'user123', 'test-user'];
        validUsernames.forEach(username => {
          expect(secureSchemas.username.parse(username)).toBe(username);
        });
      });

      it('should reject invalid characters', () => {
        const invalidUsernames = ['user@domain', 'user space', 'user<script>'];
        invalidUsernames.forEach(username => {
          expect(() => secureSchemas.username.parse(username)).toThrow();
        });
      });

      it('should enforce length limits', () => {
        expect(() => secureSchemas.username.parse('ab')).toThrow();
        expect(() => secureSchemas.username.parse('a'.repeat(35))).toThrow();
      });
    });
  });

  describe('createSanitizationMiddleware', () => {
    const testSchema = secureSchemas.safeText(100);
    const middleware = createSanitizationMiddleware(testSchema);

    it('should validate valid input', () => {
      const result = middleware('Hello World');
      expect(result).toBe('Hello World');
    });

    it('should throw on invalid input', () => {
      expect(() => middleware('<script>alert("xss")</script>')).toThrow(
        'Validation failed'
      );
    });

    it('should handle non-schema errors', () => {
      const brokenSchema = {
        parse: () => {
          throw new Error('Custom error');
        },
      } as any;

      const brokenMiddleware = createSanitizationMiddleware(brokenSchema);
      expect(() => brokenMiddleware('test')).toThrow('Invalid input data');
    });
  });

  describe('sanitizeFileName', () => {
    it('should sanitize dangerous file names', () => {
      const dangerous = '../../../etc/passwd';
      const result = sanitizeFileName(dangerous);
      expect(result).toBe('.._.._.._etc_passwd');
    });

    it('should preserve safe file names', () => {
      const safe = 'document.pdf';
      const result = sanitizeFileName(safe);
      expect(result).toBe('document.pdf');
    });

    it('should handle long file names', () => {
      const long = 'a'.repeat(300) + '.txt';
      const result = sanitizeFileName(long);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('should handle special characters', () => {
      const special = 'file with spaces & symbols!@#.txt';
      const result = sanitizeFileName(special);
      expect(result).toBe('file_with_spaces_symbols_.txt');
    });

    it('should collapse multiple underscores', () => {
      const multiple = 'file___with___many___underscores.txt';
      const result = sanitizeFileName(multiple);
      expect(result).not.toContain('___');
    });
  });

  describe('XSS Attack Vectors', () => {
    const commonXssVectors = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '<iframe src="javascript:alert(1)">',
      '<body onload="alert(1)">',
      '<input onfocus="alert(1)" autofocus>',
      '<select onfocus="alert(1)" autofocus>',
      '<textarea onfocus="alert(1)" autofocus>',
      '<keygen onfocus="alert(1)" autofocus>',
      '<video><source onerror="javascript:alert(1)">',
      '<audio src="x" onerror="alert(1)">',
      '<details open ontoggle="alert(1)">',
      '<marquee onstart="alert(1)">',
      '<<SCRIPT>alert("XSS");//<</SCRIPT>',
    ];

    const jsVectors = ['javascript:alert("XSS")'];

    it('should neutralize common XSS attack vectors', () => {
      commonXssVectors.forEach(vector => {
        const sanitized = sanitizeText(vector);

        // Should not contain dangerous keywords
        expect(sanitized.toLowerCase()).not.toMatch(
          /script|onerror|onload|onclick|onfocus|onstart|ontoggle/
        );

        // Should not contain angle brackets from tags
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('</script>');
      });
    });

    it('should neutralize JavaScript protocol vectors', () => {
      jsVectors.forEach(vector => {
        const sanitized = sanitizeText(vector);

        // Should not contain javascript: protocol
        expect(sanitized.toLowerCase()).not.toContain('javascript:');
      });
    });
  });
});
