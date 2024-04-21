/**
 * Unit tests for src/class/tag.ts
 */
import * as core from '@actions/core';
//
import { Tag } from '../src/class/tag';

// Mock the GitHub Actions core library
let setFailedMock: jest.SpyInstance;

describe('tag.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    //
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    jest.spyOn(core, 'info').mockImplementation();
  });
  /**
   * Instance test
   */
  it('tag instance', async () => {
    const tag: Tag = new Tag('2.0.0');
    expect(tag instanceof Tag).toBe(true);
  });
  /**
   * Tag tests
   */
  it('default', async () => {
    // Default. No changes
    const tag: Tag = new Tag('2.0.0');
    expect(tag.buildNewTag()).toBe('2.0.0');
  });
  it('clean version', async () => {
    const tag: Tag = new Tag(' =2.0.0 ');
    expect(tag.buildNewTag()).toBe('2.0.0');
  });
  it('use last tag', async () => {
    let tag: Tag = new Tag('2.0.0', 'v2.6.3-dev.1');
    expect(tag.buildNewTag()).toBe('2.0.0');
    tag = new Tag('3.0.0', null);
    expect(tag.buildNewTag()).toBe('3.0.0');
    tag = new Tag('4.0.0', undefined);
    expect(tag.buildNewTag()).toBe('4.0.0');
  });
  it('add prefix', async () => {
    // Add Prefix
    const tag: Tag = new Tag('2.0.0', undefined, 'v');
    expect(tag.buildNewTag()).toBe('v2.0.0');
  });
  it('add postfix', async () => {
    // Postfix up identifier.
    // Default identifier = 1
    let tag: Tag = new Tag('2.0.0', undefined, 'v', 'dev');
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
    tag = new Tag('2.0.1-dev.1', undefined, 'v', 'dev');
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.2');
  });
  it('add postfix + last tag', async () => {
    // Postfix up identifier.
    // Default identifier = 1
    // 1. version != last tag
    let tag: Tag = new Tag('2.0.0', 'v2.6.3-dev.1', 'v', 'dev');
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
    // 2. version = last tag
    tag = new Tag('2.6.3', 'v2.6.3-dev.1', 'v', 'dev');
    expect(tag.buildNewTag()).toBe('v2.6.3-dev.2');
  });
  it('add postfix no identifier', async () => {
    // Postfix NO up identifier ON
    let tag: Tag = new Tag('2.0.0', undefined, 'v', 'dev', true);
    expect(tag.buildNewTag()).toBe('v2.0.0-dev');
    // Postfix NO up identifier OFF
    tag = new Tag('2.0.0', undefined, 'v', 'dev', false);
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
    // Postfix NO up identifier Undefined = OFF
    tag = new Tag('2.0.0', undefined, 'v', 'dev', undefined);
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
  });
  it('metadata', async () => {
    // Metadata
    let tag: Tag = new Tag('2.0.0', undefined, 'v', 'dev', true, 'build123');
    expect(tag.buildNewTag()).toBe('v2.0.0-dev+build123');
    tag = new Tag('v2.0.1-dev+build123', undefined, 'v', 'dev', true, 'build456');
    expect(tag.buildNewTag()).toBe('v2.0.1-dev+build456');
    tag = new Tag('v2.0.1-dev+build456', undefined, 'v', 'dev', undefined, 'build789');
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1+build789');
    tag = new Tag('v2.0.1-dev+build789', undefined, 'v', 'dev', undefined, false);
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1');
    tag = new Tag('v2.0.1-dev+build789', undefined, 'v', 'dev', undefined, undefined);
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1');
    tag = new Tag('v2.0.1-dev+build789', undefined, 'v', 'dev', undefined, true);
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1+48c41ffe');
  });
  it('release type only', async () => {
    // Release Type
    // patch
    let tag: Tag = new Tag('v2.0.1-dev+build789', undefined, 'v', undefined, undefined, undefined, 'patch', false);
    expect(tag.buildNewTag()).toBe('v2.0.1');
    tag = new Tag('v2.0.10', undefined, 'v', undefined, undefined, undefined, 'patch', false);
    expect(tag.buildNewTag()).toBe('v2.0.11');
    // minor (no work for minor version if auto up = disable)
    tag = new Tag('v3.0.2-dev.1', undefined, 'v', undefined, undefined, undefined, 'minor', false);
    expect(tag.buildNewTag()).toBe('v3.1.0');
    tag = new Tag('v3.1.25', undefined, 'v', undefined, undefined, undefined, 'minor', false);
    expect(tag.buildNewTag()).toBe('v3.2.0');
    // major (no work for major version if auto up = disable)
    tag = new Tag('v4.0.2-dev.12', undefined, 'v', undefined, undefined, undefined, 'major', false);
    expect(tag.buildNewTag()).toBe('v5.0.0');
    tag = new Tag('v12.0.0', undefined, 'v', undefined, undefined, undefined, 'major', false);
    expect(tag.buildNewTag()).toBe('v13.0.0');
  });
  // !!! IMPORTANT !!!
  it('release type + auto up', async () => {
    // Release Type + Auto up version
    // !!! Not used when using postfix !!!
    // patch
    let tag: Tag = new Tag('v2.0.1-dev+build789', undefined, 'v', 'dev', undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.2-dev.1'); // CORRECT. Prerelease to prerelease and UP version
    tag = new Tag('v2.0.2', undefined, 'v', 'dev', undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.4-dev.1'); // INCORRECT !!!
    tag = new Tag('v2.0.2', undefined, 'v', undefined, undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.4'); // INCORRECT !!!
    tag = new Tag('v2.0.2-dev.1', undefined, 'v', undefined, undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.3'); // CORRECT. Prerelease to release and UP version
    // minor
    tag = new Tag('v2.0.2-dev.1', undefined, 'v', 'dev', undefined, undefined, 'minor', true);
    expect(tag.buildNewTag()).toBe('v2.1.1-dev.1'); // WARNING !!! And up patch
    // major
    tag = new Tag('v2.0.2-dev.1', undefined, 'v', 'dev', undefined, undefined, 'major', true);
    expect(tag.buildNewTag()).toBe('v3.0.1-dev.1'); // WARNING !!! And up patch
  });
  /**
   * Negative tests
   */
  it('negative build tag', async () => {
    // Clear tag
    const tag: Tag = new Tag('vA.0.2-dev.1', undefined, 'v', 'dev', undefined, undefined, 'major', true);
    const newTag: string = tag.buildNewTag();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Error clean version "vA.0.2-dev.1"');
    expect(newTag).toBe('');
  });
});
