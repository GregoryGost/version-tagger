/**
 * Unit tests for src/index.ts
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockRun = jest.fn();
const mockMain = jest.fn(() => ({
  run: mockRun
}));

jest.mock('../src/class/main', () => ({
  Main: mockMain
}));

describe('index.ts', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  /**
   * Test entrypoint run method
   */
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/index');
    expect(mockMain).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledTimes(1);
  });
});
