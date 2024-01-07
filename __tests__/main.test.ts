/**
 * Unit tests for src/class/main.ts
 */

import { cwd } from 'node:process';
import { normalize, join } from 'node:path';
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
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'postfixnoup':
          return mockPostfixnoup;
        case 'auto':
          return true;
        case 'dryrun':
          return mockDryrun;
        default:
          return false;
      }
    });
    // Tag is already exists
    const mainTest: Main = new Main();
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return ['v1.0.0-rc.1', 'v1.0.0-rc.2'];
    });
    // jest.spyOn(mainTest.tag, 'buildNewTag').mockImplementation((): string => {
    //   return 'v1.0.0-rc.1';
    // });
    await mainTest.run();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, `Tag "v1.0.0-rc.2" is already exists in repository!!!`);
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
  /**
   * Users cases tests
   * 1. Add prefix only
   * version from package.json / prefix=v / no auto / no releasetype / no postfix / no dryrun
   */
  it('package.json - add prefix only', async () => {
    // Action Input
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'version':
        case 'postfix':
        case 'metadata':
        case 'releasetype':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
        case 'postfixnoup':
        case 'auto':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3');
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe(null);
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.6.3" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.6.3');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 2. Add prefix and Up patch version
   * version from package.json / prefix=v / auto=true / releasetype=patch / no postfix / no dryrun
   */
  it('package.json - add prefix + up patch(2.6.3=>v2.6.4)', async () => {
    // Action Input
    // patch = (x.y.Z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'releasetype':
          return 'patch';
        case 'prefix':
          return 'v';
        case 'version':
        case 'postfix':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'auto':
          return true;
        case 'uselasttag':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3');
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe('patch');
    expect(mainTest.config.autoUp).toBe(true);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.6.4" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.6.4');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 3. Add prefix and Up minor version
   * version from package.json / prefix=v / auto=true / releasetype=minor / no postfix / no dryrun
   */
  it('package.json - add prefix + up minor(2.6.3=>v2.7.0)', async () => {
    // Action Input
    // minor = (x.Y.z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'releasetype':
          return 'minor';
        case 'prefix':
          return 'v';
        case 'version':
        case 'postfix':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'auto':
          return true;
        case 'uselasttag':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3');
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe('minor');
    expect(mainTest.config.autoUp).toBe(true);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.7.0" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.7.0');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 4. Add prefix and Up major version
   * version from package.json / prefix=v / auto=true / releasetype=major / no postfix / no dryrun
   */
  it('package.json - add prefix + up major(2.6.3=>v3.0.0)', async () => {
    // Action Input
    // minor = (x.Y.z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'releasetype':
          return 'major';
        case 'prefix':
          return 'v';
        case 'version':
        case 'postfix':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'auto':
          return true;
        case 'uselasttag':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3');
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe('major');
    expect(mainTest.config.autoUp).toBe(true);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v3.0.0" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v3.0.0');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 5. Add prefix and Release candidate Up
   * version from package.json / prefix=v / no auto / no releasetype / postfix=rc / no dryrun
   */
  it('package.json - add prefix + release candidate(2.6.3=>v2.6.3-rc.1)', async () => {
    // Action Input
    // minor = (x.Y.z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'postfix':
          return 'rc';
        case 'version':
        case 'metadata':
        case 'releasetype':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
        case 'postfixnoup':
        case 'auto':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return [''];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3');
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe('rc');
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe(null);
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.6.3-rc.1" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.6.3-rc.1');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  it('package.json - add prefix + release candidate(2.6.3=>v2.6.3-rc.1) + repo tags', async () => {
    // Action Input
    // minor = (x.Y.z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'postfix':
          return 'rc';
        case 'version':
        case 'metadata':
        case 'releasetype':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
        case 'postfixnoup':
        case 'auto':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return ['v2.6.2-rc.1', 'v2.5.0'];
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3');
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe('rc');
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe(null);
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.6.3-rc.1" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.6.3-rc.1');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 6. Use last tag only
   * version from last tag / prefix=v / no auto / no releasetype / postfix=rc / no dryrun
   */
  it('last tag - add prefix + release candidate(v5.6.4-rc.1=>v5.6.4-rc.2) + repo tags', async () => {
    let lastTagVersions: string[] = ['v5.6.4-rc.1', 'v2.5.0'];
    // Action Input
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'postfix':
          return 'rc';
        case 'releasetype':
        case 'version':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
          return true;
        case 'auto':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3'); // before get from package.json
    expect(mainTest.config.useLastTag).toBe(true);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe('rc');
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe(null);
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(mainTest.config.version).toBe('v5.6.4-rc.1'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v5.6.4-rc.2" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v5.6.4-rc.2');
    expect(setFailedMock).not.toHaveBeenCalled();
    // Next Run
    lastTagVersions = ['v5.6.4-rc.2', 'v5.6.4-rc.1', 'v2.5.0'];
    await mainTest.run();
    expect(mainTest.config.version).toBe('v5.6.4-rc.2'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(2, 'Pushed new tag "v5.6.4-rc.3" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'newtag', 'v5.6.4-rc.3');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 7. Up minor version from last tag
   * version from last tag / prefix=v / auto=true / releasetype=minor / no postfix / no dryrun
   */
  it('last tag - add prefix + up rc to minor(v4.4.4-rc.12=>v4.5.0)', async () => {
    const lastTagVersions: string[] = ['v4.4.4-rc.12', 'v4.4.4-rc.11', 'v4.4.4-rc.10'];
    // Action Input
    // minor = (x.Y.z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'releasetype':
          return 'minor';
        case 'prefix':
          return 'v';
        case 'version':
        case 'postfix':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'auto':
          return true;
        case 'uselasttag':
          return true;
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3'); // before get from package.json
    expect(mainTest.config.useLastTag).toBe(true);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe('minor');
    expect(mainTest.config.autoUp).toBe(true);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(mainTest.config.version).toBe('v4.4.4-rc.12'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v4.5.0" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v4.5.0');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 8. NO up minor version from last tag
   * version from last tag / prefix=v / auto=true / releasetype=patch / no postfix / no dryrun
   */
  it('last tag - add prefix + change rc to release version(v4.4.4-rc.12=>v4.4.4)', async () => {
    const lastTagVersions: string[] = ['v4.4.4-rc.12', 'v4.4.4-rc.11', 'v4.4.4-rc.10'];
    // Action Input
    // minor = (x.Y.z)
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'releasetype':
          return 'patch';
        case 'version':
        case 'postfix':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'auto':
          return true;
        case 'uselasttag':
          return true;
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    const testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    const mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3'); // before get from package.json
    expect(mainTest.config.useLastTag).toBe(true);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe('patch');
    expect(mainTest.config.autoUp).toBe(true);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(mainTest.config.version).toBe('v4.4.4-rc.12'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v4.4.4" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v4.4.4');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * 9 Example Version Flow
   */
  it('Example version flow: Last TAG (no use package.json): [develop] => [main/master]', async () => {
    //
    // 1. FROM BASE TO DEVELOP
    //    Config for develop branch
    //
    let lastTagVersions: string[] = [];
    // Action Input
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'postfix':
          return 'beta';
        case 'releasetype':
        case 'version':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
          return true;
        case 'auto':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    let testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    // Main instance
    let mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3'); // before get from package.json
    expect(mainTest.config.useLastTag).toBe(true);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe('beta');
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe(null);
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(mainTest.config.version).toBe('2.6.3'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.6.3-beta.1" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.6.3-beta.1');
    expect(setFailedMock).not.toHaveBeenCalled();
    //
    // 2. UP DEVELOP
    //
    lastTagVersions = ['v2.6.3-beta.1'];
    await mainTest.run();
    expect(mainTest.config.version).toBe('v2.6.3-beta.1'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(2, 'Pushed new tag "v2.6.3-beta.2" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'newtag', 'v2.6.3-beta.2');
    expect(setFailedMock).not.toHaveBeenCalled();
    // next develop up
    lastTagVersions = ['v2.6.3-beta.2', 'v2.6.3-beta.1'];
    await mainTest.run();
    expect(mainTest.config.version).toBe('v2.6.3-beta.2'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(3, 'Pushed new tag "v2.6.3-beta.3" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'newtag', 'v2.6.3-beta.3');
    expect(setFailedMock).not.toHaveBeenCalled();
    //
    // 3. DEVELOP TO RELEASE
    //    Config for main/master branch
    //
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'releasetype':
          return 'patch';
        case 'postfix':
        case 'version':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
          return true;
        case 'auto':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    lastTagVersions = ['v2.6.3-beta.3', 'v2.6.3-beta.2', 'v2.6.3-beta.1'];
    // Set test root dir
    testRootDir = normalize(join(cwd(), '__tests__', 'package_version_2.6.12'));
    // Main instance
    mainTest = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.12'); // before get from package.json
    expect(mainTest.config.useLastTag).toBe(true);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe(null);
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe('patch');
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(mainTest.config.version).toBe('v2.6.3-beta.3'); // after get from last repo tag
    expect(infoMock).toHaveBeenNthCalledWith(4, 'Pushed new tag "v2.6.3" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'newtag', 'v2.6.3');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  it('Example version flow: package.json: [develop] => [main/master]', async () => {
    //
    // 1. FROM BASE TO DEVELOP
    //    Config for develop branch
    //
    let lastTagVersions: string[] = [];
    // Action Input
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return mockToken;
        case 'prefix':
          return 'v';
        case 'postfix':
          return 'dev';
        case 'releasetype':
        case 'version':
        case 'metadata':
        default:
          return '';
      }
    });
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'uselasttag':
        case 'auto':
        case 'postfixnoup':
        case 'dryrun':
        default:
          return false;
      }
    });
    // Set test root dir
    let testRootDir: string = normalize(join(cwd(), '__tests__', 'package_version_2.6.3'));
    // Main instance
    let mainTest: Main = new Main(testRootDir);
    // Empty latest versions in repo
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    // Input params check
    expect(mainTest.config.token).toBe(mockToken);
    expect(mainTest.config.version).toBe('2.6.3'); // before get from package.json
    expect(mainTest.config.useLastTag).toBe(false);
    expect(mainTest.config.prefix).toBe('v');
    expect(mainTest.config.postfix).toBe('dev');
    expect(mainTest.config.postfixNoUpgrade).toBe(false);
    expect(mainTest.config.metadata).toBe(false);
    expect(mainTest.config.releaseType).toBe(null);
    expect(mainTest.config.autoUp).toBe(false);
    expect(mainTest.config.dryRun).toBe(false);
    // Run
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Pushed new tag "v2.6.3-dev.1" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'newtag', 'v2.6.3-dev.1');
    expect(setFailedMock).not.toHaveBeenCalled();
    //
    // 2. NEXT RUN IN DEVELOP (NO CHANGE VERSION = UP ONLY POSTFIX)
    //
    lastTagVersions = ['v2.6.3-dev.1'];
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(2, 'Pushed new tag "v2.6.3-dev.2" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'newtag', 'v2.6.3-dev.2');
    expect(setFailedMock).not.toHaveBeenCalled();
    //
    // 3. NEXT RUN IN DEVELOP (NEW PACKAGE VERSION = START POSTFIX FROM 1)
    //    New version from package.json start prefix from `dev.1`
    //    Exists latest versions in repo
    //    Up base version from package.json
    //    Get and Up postfix from last tag
    //
    lastTagVersions = ['v2.6.3-dev.2'];
    // Set test root dir
    testRootDir = normalize(join(cwd(), '__tests__', 'package_version_2.6.12'));
    // Main instance
    mainTest = new Main(testRootDir);
    jest.spyOn(mainTest.github, 'getTags').mockImplementation(async (): Promise<string[]> => {
      return lastTagVersions;
    });
    jest.spyOn(mainTest.github, 'pushNewTag').mockImplementation();
    await mainTest.run();
    expect(infoMock).toHaveBeenNthCalledWith(3, 'Pushed new tag "v2.6.12-dev.1" is OK. Work done');
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'newtag', 'v2.6.12-dev.1');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
});
