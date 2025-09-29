/**
 * Security Headers Test Suite
 * Tests for security header implementation and CSP validation
 */

import {
  getSecurityHeaders,
  securityHeaders,
  developmentSecurityHeaders,
} from '@/lib/security/headers';

describe('Security Headers', () => {
  describe('getSecurityHeaders', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should return production headers for production environment', () => {
      process.env.NODE_ENV = 'production';
      const headers = getSecurityHeaders();

      expect(headers).toEqual(securityHeaders);
      expect(headers['Content-Security-Policy']).not.toContain('unsafe-eval');
    });

    it('should return development headers for development environment', () => {
      process.env.NODE_ENV = 'development';
      const headers = getSecurityHeaders();

      expect(headers).toEqual(developmentSecurityHeaders);
      expect(headers['Content-Security-Policy']).toContain('unsafe-eval');
    });
  });

  describe('Security Header Validation', () => {
    let headers: Record<string, string>;

    beforeEach(() => {
      headers = securityHeaders;
    });

    it('should include all required security headers', () => {
      const requiredHeaders = [
        'Content-Security-Policy',
        'X-XSS-Protection',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Strict-Transport-Security',
        'Referrer-Policy',
        'Permissions-Policy',
      ];

      requiredHeaders.forEach(header => {
        expect(headers).toHaveProperty(header);
        expect(headers[header]).toBeTruthy();
      });
    });

    it('should have proper CSP configuration', () => {
      const csp = headers['Content-Security-Policy'];

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain('https://*.clerk.dev');
      expect(csp).toContain('https://*.supabase.co');
    });

    it('should prevent framing', () => {
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    it('should enable XSS protection', () => {
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('should prevent MIME type sniffing', () => {
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should enforce HTTPS', () => {
      const hsts = headers['Strict-Transport-Security'];
      expect(hsts).toContain('max-age=31536000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    });

    it('should have proper referrer policy', () => {
      expect(headers['Referrer-Policy']).toBe(
        'strict-origin-when-cross-origin'
      );
    });

    it('should limit browser features with permissions policy', () => {
      const policy = headers['Permissions-Policy'];
      expect(policy).toContain('camera=self');
      expect(policy).toContain('microphone=self');
      expect(policy).toContain('interest-cohort=()');
    });
  });

  describe('CSP Directive Parsing', () => {
    it('should properly parse CSP directives', () => {
      const csp = securityHeaders['Content-Security-Policy'];
      const directives = csp.split(';').map(d => d.trim());

      const directiveMap = new Map<string, string[]>();
      directives.forEach(directive => {
        const [name, ...sources] = directive.split(/\s+/);
        directiveMap.set(name, sources);
      });

      expect(directiveMap.get('default-src')).toEqual(["'self'"]);
      expect(directiveMap.get('script-src')).toContain("'self'");
      expect(directiveMap.get('script-src')).toContain('https://*.clerk.dev');
      expect(directiveMap.get('object-src')).toEqual(["'none'"]);
    });

    it('should not allow inline scripts in production CSP', () => {
      const csp = securityHeaders['Content-Security-Policy'];
      const scriptSrc = csp.match(/script-src[^;]+/)?.[0];

      expect(scriptSrc).toBeDefined();
      // Should have 'unsafe-inline' for specific third-party needs but be restrictive
      expect(scriptSrc).toContain("'unsafe-inline'");
      expect(scriptSrc).not.toContain("'unsafe-eval'");
    });

    it('should allow eval in development CSP only', () => {
      const devCsp = developmentSecurityHeaders['Content-Security-Policy'];
      const prodCsp = securityHeaders['Content-Security-Policy'];

      expect(devCsp).toContain("'unsafe-eval'");
      expect(prodCsp).not.toContain("'unsafe-eval'");
    });
  });
});
