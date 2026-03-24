import { generateEmbedding } from '../embeddings';

const mockGenerateEmbedding = jest.fn();
const mockCreateAIService = jest.fn(() => ({
  generateEmbedding: mockGenerateEmbedding,
}));
const mockClearAllServices = jest.fn();

jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: {
    createAIService: () => mockCreateAIService(),
    clearAllServices: () => mockClearAllServices(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateAIService.mockImplementation(() => ({
    generateEmbedding: mockGenerateEmbedding,
  }));
});

afterEach(() => {
  mockClearAllServices();
});

describe('generateEmbedding', () => {
  it('delegates to AIService.generateEmbedding', async () => {
    const fakeEmbedding = Array(1536).fill(0.1);
    mockGenerateEmbedding.mockResolvedValue(fakeEmbedding);

    const result = await generateEmbedding('test input');

    expect(mockCreateAIService).toHaveBeenCalledTimes(1);
    expect(mockGenerateEmbedding).toHaveBeenCalledWith('test input');
    expect(result).toEqual(fakeEmbedding);
  });

  it('propagates errors from AIService', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('AI unavailable'));

    await expect(generateEmbedding('test')).rejects.toThrow('AI unavailable');
  });
});
