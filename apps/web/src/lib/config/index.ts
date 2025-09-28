// Export the validated configuration
export { config, env } from './env';
export type { Config } from './env';

// Environment-specific configurations
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

// URL configurations
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return '';
  }

  if (process.env.VERCEL_URL) {
    // Vercel deployment
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return 'http://localhost:3000';
};

// API configurations
export const apiConfig = {
  baseUrl: getBaseUrl(),
  timeout: 10000,
  retries: 3,
} as const;