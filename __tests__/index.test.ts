/**
 * Unit tests for src/index.ts
 */

import { join } from 'node:path';
import * as core from '@actions/core';

import { Main } from '../src/class/main';

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance;
let getBooleanInputMock: jest.SpyInstance;

const mockToken = 'oBgGDgMmhwHAwxJaqBZzImWeypnYKWwQSGtvtYxhNzzYomNINkLaOHAVFCNwtOgXSb';
const mockVersion = '';
const mockPrefix = 'v';
const mockPostfix = 'rc';
const mockPostfixnoup = false;
const mockMetadata = '';
const mockReleasetype = '';
const mockAuto = false;
const mockDryrun = false;

process.env.GITHUB_EVENT_PATH = join(__dirname, 'github_payload.json');
process.env.GITHUB_REPOSITORY = 'GregoryGost/version-tagger';
process.env.GITHUB_SHA = 'c3d0be41ecbe669545ee3e94d31ed9a4bc91ee3c';
process.env.GITHUB_HEAD_REF = 'develop';

// Mock the action's entrypoint
let runMock: jest.SpyInstance;

describe('index.ts', () => {
  beforeAll(() => {
    runMock = jest.spyOn(Main.prototype, 'run').mockImplementation();
  });
  beforeEach(() => {
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    getBooleanInputMock = jest.spyOn(core, 'getBooleanInput').mockImplementation();
    //
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'version':
          return mockVersion;
        case 'prefix':
          return mockPrefix;
        case 'postfix':
          return mockPostfix;
        case 'metadata':
          return mockMetadata;
        case 'releasetype':
          return mockReleasetype;
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'postfixnoup':
          return mockPostfixnoup;
        case 'auto':
          return mockAuto;
        case 'dryrun':
          return mockDryrun;
        default:
          return false;
      }
    });
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  /**
   * Test entrypoint run method
   */
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/index');
    expect(runMock).toHaveBeenCalled();
  });
});
