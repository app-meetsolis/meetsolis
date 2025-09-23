import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables for tests
process.env.USE_MOCK_SERVICES = 'true'
process.env.NODE_ENV = 'test'
process.env.SERVICE_TIMEOUT_MS = '1000'
process.env.CIRCUIT_BREAKER_THRESHOLD = '3'
process.env.RETRY_ATTEMPTS = '2'

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()

  // Reset environment to known state
  process.env.USE_MOCK_SERVICES = 'true'
})

// Suppress console warnings in tests unless debugging
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: act') ||
      args[0].includes('Warning: useLayoutEffect')
    )) {
      return
    }
    originalWarn.call(console, ...args)
  }

  console.error = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Warning:') ||
      args[0].includes('Error: Not implemented')
    )) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})