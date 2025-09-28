/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Override global expect type to use Jest instead of other testing libraries
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toHaveLength(expected: number): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toThrow(expected?: string | RegExp | Error): R;
      resolves: Matchers<Promise<R>>;
      rejects: Matchers<Promise<R>>;
    }
  }

  var expect: {
    <T = any>(actual: T): jest.Matchers<void>;
    objectContaining(object: Record<string, any>): any;
    stringContaining(expected: string): any;
    arrayContaining(array: any[]): any;
    any(constructor: any): any;
  };

  var it: {
    (name: string, fn?: jest.ProvidesCallback, timeout?: number): void;
    each<T extends readonly any[] | readonly readonly any[]>(table: T): (name: string, fn: (...args: T[number]) => void, timeout?: number) => void;
    skip: typeof it;
    only: typeof it;
  };

  var test: typeof it;
  var describe: {
    (name: string, fn: () => void): void;
    skip: typeof describe;
    only: typeof describe;
  };

  var beforeEach: (fn: jest.ProvidesCallback) => void;
  var afterEach: (fn: jest.ProvidesCallback) => void;
  var beforeAll: (fn: jest.ProvidesCallback) => void;
  var afterAll: (fn: jest.ProvidesCallback) => void;
}

export {};