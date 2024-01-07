/**
 * Unit tests for src/class/config.ts
 */

import { cwd } from 'node:process';
import { normalize, join } from 'node:path';
import { readFileSync } from 'node:fs';
//
import * as core from '@actions/core';
//
import { Config } from '../src/class/config';

const mockToken =
  'oBgGDgMmhwHAwxJaqBZzImWeypnYKWwQSGtvtYxhNzzYomNINkLaOHAVFCNwtOgXSbuiBeZuaMLIhDNUwVzeoTfQUyoLYLzROcNXJFiwRGZLzYBgVhwYkZMgGxFmvcsTqtHHADnlQjkQBwRPjraMMWvEersLQIJT';

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance;
let getBooleanInputMock: jest.SpyInstance;
let setFailedMock: jest.SpyInstance;

describe('config.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    //
    process.env.GITHUB_SHA = 'c3d0be41ecbe669545ee3e94d31ed9a4bc91ee3c';
    process.env.GITHUB_HEAD_REF = 'develop';
    //
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    getBooleanInputMock = jest.spyOn(core, 'getBooleanInput').mockImplementation();
    //
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        default:
          return '';
      }
    });
  });
  /**
   * Instance test
   */
  it('config instance', async () => {
    const config: Config = new Config();
    expect(config instanceof Config).toBe(true);
  });
  /**
   * Get root path test
   */
  it('get root path', async () => {
    const config: Config = new Config();
    const currentDir: string = normalize(cwd());
    expect(config.root).toBe(currentDir);
  });
  /**
   * Get input version test
   */
  it('get version from action input', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'version':
          return '5.5.5';
        default:
          return '';
      }
    });
    const config: Config = new Config();
    expect(config.version).toBe('5.5.5');
  });
  /**
   * Get version test from `package.json`
   */
  it('get version from package.json', async () => {
    const config: Config = new Config();
    const currentDir: string = normalize(cwd());
    const packageData: string = readFileSync(normalize(join(currentDir, 'package.json')), 'utf-8');
    expect(config.version).toBe(JSON.parse(packageData).version);
  });
  /**
   * Get default version test
   * Default version: `0.1.0`
   */
  it('get default version', async () => {
    const testDir: string = normalize(join(cwd(), '__tests__'));
    const config: Config = new Config(testDir);
    expect(config.version).toBe('0.1.0');
  });
  /**
   * Set version test for last tag enabled
   * Return version from `package.json`
   */
  it('set new version (use last tag = true)', async () => {
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
          return true;
        default:
          return false;
      }
    });
    const config: Config = new Config();
    expect(config.version).toBe('1.0.0');
    config.version = '1.5.6';
    expect(config.version).toBe('1.5.6');
  });
  /**
   * Get input token test
   */
  it('get token', async () => {
    const config: Config = new Config();
    expect(config.token).toBe(mockToken);
  });
  /**
   * Get input prefix test
   */
  it('get prefix', async () => {
    // Default: null
    let config: Config = new Config();
    expect(config.prefix).toBe(null);
    // Normal
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'prefix':
          return 'v';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.prefix).toBe('v');
    //
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'prefix':
          return 'r';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.prefix).toBe('r');
  });
  /**
   * Get input postfix test
   */
  it('get postfix', async () => {
    // Default: null
    let config: Config = new Config();
    expect(config.postfix).toBe(null);
    // Normal
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'postfix':
          return '-beta';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.postfix).toBe('-beta');
    //
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'postfix':
          return '-rc.';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.postfix).toBe('-rc.');
  });
  /**
   * Get input postfix no upgrade
   */
  it('get postfix no upgrade', async () => {
    // Default
    let config: Config = new Config();
    expect(config.postfixNoUpgrade).toBe(false);
    // Input True
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'postfixnoup':
          return true;
        default:
          return false;
      }
    });
    config = new Config();
    expect(config.postfixNoUpgrade).toBe(true);
  });
  /**
   * Get input metadata test
   */
  it('get metadata', async () => {
    // Default: false
    let config: Config = new Config();
    expect(config.metadata).toBe(false);
    // String variant
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'metadata':
          return '-build777';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.metadata).toBe('-build777');
    // Enable Auto Hash variant
    getInputMock.mockImplementation((name: string): string | boolean => {
      switch (name) {
        case 'metadata':
          return true;
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.metadata).toBe(true);
  });
  /**
   * Get Release type test
   */
  it('get release type', async () => {
    // Default empty string
    let config: Config = new Config();
    expect(config.releaseType).toBe(null);
    // Major (passed)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'releasetype':
          return 'major';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.releaseType).toBe('major');
    // Empty string
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'releasetype':
          return '';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.releaseType).toBe(null);
    // No range type
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'releasetype':
          return 'pre';
        default:
          return '';
      }
    });
    config = new Config();
    expect(config.releaseType).toBe(null);
  });
  /**
   * Get input dry run test
   */
  it('get dry run', async () => {
    // Default: False
    let config: Config = new Config();
    expect(config.dryRun).toBe(false);
    // Input True
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'dryrun':
          return true;
        default:
          return false;
      }
    });
    config = new Config();
    expect(config.dryRun).toBe(true);
    // Input False
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'dryrun':
          return false;
        default:
          return false;
      }
    });
    config = new Config();
    expect(config.dryRun).toBe(false);
  });
  /**
   * Get auto up test
   */
  it('get auto up', async () => {
    // Default: False
    const config: Config = new Config();
    expect(config.autoUp).toBe(false);
  });
  /**
   * Get Github SHA commit that triggered the workflow
   */
  it('get github sha', async () => {
    let config: Config = new Config();
    expect(config.githubSha).toBe('c3d0be41ecbe669545ee3e94d31ed9a4bc91ee3c');
    // No Default. If is Empty => Failed
    process.env.GITHUB_SHA = '';
    config = new Config();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, `GITHUB_SHA is Empty!!!`);
    expect(config.githubSha).toBe('');
  });
  /**
   * Get head ref or source branch of the pull request in a workflow run.
   */
  it('get github head ref', async () => {
    let config: Config = new Config();
    expect(config.githubHeadRef).toBe('develop');
    // Default
    process.env.GITHUB_HEAD_REF = '';
    config = new Config();
    expect(config.githubHeadRef).toBe('main');
  });
});
