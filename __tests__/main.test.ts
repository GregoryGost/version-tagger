/**
 * Unit tests for src/class/main.ts
 */

import { join } from 'node:path';
import * as core from '@actions/core';
//
import { Main } from '../src/class/main';

const mockToken = 'oBgGDgMmhwHAwxJaqBZzImWeypnYKWwQSGtvtYxhNzzYomNINkLaOHAVFCNwtOgXSb';
const mockVersion = '';
const mockPrefix = 'v';
const mockPostfix = 'rc';
const mockPostfixnoup = false;
const mockMetadata = '';
const mockReleasetype = '';
const mockAuto = false;
const mockDryrun = true;

process.env.GITHUB_EVENT_PATH = join(__dirname, 'github_payload.json');
process.env.GITHUB_REPOSITORY = 'GregoryGost/version-tagger';
process.env.GITHUB_SHA = 'c3d0be41ecbe669545ee3e94d31ed9a4bc91ee3c';
process.env.GITHUB_HEAD_REF = 'develop';

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance;
let getBooleanInputMock: jest.SpyInstance;
let setFailedMock: jest.SpyInstance;
let setOutputMock: jest.SpyInstance;
let infoMock: jest.SpyInstance;
//
let runMock: jest.SpyInstance;

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    //
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    getBooleanInputMock = jest.spyOn(core, 'getBooleanInput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();
    infoMock = jest.spyOn(core, 'info').mockImplementation();
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
  /**
   * Instance test
   */
  it('main instance', async () => {
    const mainTest: Main = new Main();
    expect(mainTest instanceof Main).toBe(true);
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * Main run function only called
   */
  it('main run call only', async () => {
    const mainTest: Main = new Main();
    runMock = jest.spyOn(mainTest, 'run').mockImplementation();
    await mainTest.run();
    expect(runMock).toHaveBeenCalled();
  });
  /**
   * Main run function work
   */
  it('main run tag is already exists', async () => {
    // Tag is already exists
    const mainTest: Main = new Main();
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return ['v1.0.0-rc.1'];
    });
    jest.spyOn(mainTest.tag, 'buildNewTag').mockImplementation((): string => {
      return 'v1.0.0-rc.1';
    });
    await mainTest.run();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, `Tag "v1.0.0-rc.1" is already exists in repository!!!`);
  });
  it('main run ok. dryrun = true', async () => {
    let mainTest: Main = new Main();
    // No legacy tags
    // Empty version
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    // jest.spyOn(mainTest.tag, 'buildNewTag').mockImplementation((): string => {
    //   return 'v1.0.0-rc.1';
    // });
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Dry Run is enabled. Just output new tag version ...');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v1.0.0-rc.1');
    expect(setFailedMock).not.toHaveBeenCalled();
    // Input Custom Version
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'version':
          return '5.6.1';
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
    mainTest = new Main();
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    await mainTest.run();
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'newtag', 'v5.6.1-rc.1');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  it('main run ok. no dryrun', async () => {
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'postfixnoup':
          return mockPostfixnoup;
        case 'auto':
          return mockAuto;
        case 'dryrun':
          return false;
        default:
          return false;
      }
    });
    const mainTest: Main = new Main();
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v1.0.0-rc.1" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v1.0.0-rc.1');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
});
