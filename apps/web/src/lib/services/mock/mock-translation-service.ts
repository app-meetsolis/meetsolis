import {
  TranslationService,
  ServiceStatus,
  ServiceInfo,
} from '@meetsolis/shared';
import { BaseService } from '../base-service';

export class MockTranslationService
  extends BaseService
  implements TranslationService
{
  private supportedLanguages = new Map<string, string>([
    ['en', 'English'],
    ['es', 'Spanish'],
    ['fr', 'French'],
    ['de', 'German'],
    ['it', 'Italian'],
    ['pt', 'Portuguese'],
    ['ru', 'Russian'],
    ['ja', 'Japanese'],
    ['ko', 'Korean'],
    ['zh', 'Chinese'],
  ]);

  private translationCount = 0;

  constructor() {
    super();
    this.enableFallbackMode();
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Mock Translation Service',
      version: '1.0.0',
      description:
        'Mock translation service providing passthrough and language detection for development',
      dependencies: [],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    await new Promise(resolve => setTimeout(resolve, 80));

    return {
      status: 'healthy',
      responseTime: 80,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    console.log(
      `[MockTranslationService] Translating to ${targetLanguage}:`,
      text.substring(0, 50) + '...'
    );

    this.translationCount++;

    // Simulate translation delay
    await new Promise(resolve =>
      setTimeout(resolve, 300 + Math.random() * 700)
    );

    // Check if target language is supported
    if (!this.supportedLanguages.has(targetLanguage)) {
      throw new Error(`Unsupported target language: ${targetLanguage}`);
    }

    // In mock mode, we'll add a prefix to indicate translation
    const _languageName = this.supportedLanguages.get(targetLanguage);

    // For demonstration, we'll modify the text slightly based on target language
    switch (targetLanguage) {
      case 'es':
        return `[ES] ${text}`;
      case 'fr':
        return `[FR] ${text}`;
      case 'de':
        return `[DE] ${text}`;
      case 'it':
        return `[IT] ${text}`;
      case 'pt':
        return `[PT] ${text}`;
      case 'ru':
        return `[RU] ${text}`;
      case 'ja':
        return `[JA] ${text}`;
      case 'ko':
        return `[KO] ${text}`;
      case 'zh':
        return `[ZH] ${text}`;
      case 'en':
      default:
        return text; // No translation needed for English
    }
  }

  async detectLanguage(text: string): Promise<string> {
    console.log(
      '[MockTranslationService] Detecting language for:',
      text.substring(0, 30) + '...'
    );

    // Simulate detection delay
    await new Promise(resolve =>
      setTimeout(resolve, 200 + Math.random() * 300)
    );

    // Simple heuristic language detection based on common words/patterns
    const lowerText = text.toLowerCase();

    // Spanish indicators
    if (
      lowerText.includes('el ') ||
      lowerText.includes('la ') ||
      lowerText.includes('de ') ||
      lowerText.includes('que ')
    ) {
      return 'es';
    }

    // French indicators
    if (
      lowerText.includes('le ') ||
      lowerText.includes('la ') ||
      lowerText.includes('du ') ||
      lowerText.includes('que ')
    ) {
      return 'fr';
    }

    // German indicators
    if (
      lowerText.includes('der ') ||
      lowerText.includes('die ') ||
      lowerText.includes('das ') ||
      lowerText.includes('und ')
    ) {
      return 'de';
    }

    // Italian indicators
    if (
      lowerText.includes('il ') ||
      lowerText.includes('la ') ||
      lowerText.includes('di ') ||
      lowerText.includes('che ')
    ) {
      return 'it';
    }

    // Portuguese indicators
    if (
      lowerText.includes('o ') ||
      lowerText.includes('a ') ||
      lowerText.includes('de ') ||
      lowerText.includes('que ')
    ) {
      return 'pt';
    }

    // Default to English
    return 'en';
  }

  // Mock-specific methods
  getSupportedLanguages(): Map<string, string> {
    return new Map(this.supportedLanguages);
  }

  getTranslationCount(): number {
    return this.translationCount;
  }

  resetTranslationCount(): void {
    this.translationCount = 0;
  }

  addSupportedLanguage(code: string, name: string): void {
    this.supportedLanguages.set(code, name);
  }

  // Utility method for testing
  simulateTranslationError(): void {
    throw new Error('Mock translation service error for testing');
  }
}
