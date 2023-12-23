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
  it('add prefix', async () => {
    // Add Prefix
    const tag: Tag = new Tag('2.0.0', 'v');
    expect(tag.buildNewTag()).toBe('v2.0.0');
  });
  it('add postfix', async () => {
    // Postfix up identifier.
    // Default identifier = 1
    let tag: Tag = new Tag('2.0.0', 'v', 'dev');
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
    tag = new Tag('2.0.1-dev.1', 'v', 'dev');
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.2');
  });
  it('add postfix no identifier', async () => {
    // Postfix NO up identifier ON
    let tag: Tag = new Tag('2.0.0', 'v', 'dev', true);
    expect(tag.buildNewTag()).toBe('v2.0.0-dev');
    // Postfix NO up identifier OFF
    tag = new Tag('2.0.0', 'v', 'dev', false);
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
    // Postfix NO up identifier Undefined = OFF
    tag = new Tag('2.0.0', 'v', 'dev', undefined);
    expect(tag.buildNewTag()).toBe('v2.0.0-dev.1');
  });
  it('metadata', async () => {
    // Metadata
    let tag: Tag = new Tag('2.0.0', 'v', 'dev', true, 'build123');
    expect(tag.buildNewTag()).toBe('v2.0.0-dev+build123');
    tag = new Tag('v2.0.1-dev+build123', 'v', 'dev', true, 'build456');
    expect(tag.buildNewTag()).toBe('v2.0.1-dev+build456');
    tag = new Tag('v2.0.1-dev+build456', 'v', 'dev', undefined, 'build789');
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1+build789');
    tag = new Tag('v2.0.1-dev+build789', 'v', 'dev', undefined, false);
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1');
    tag = new Tag('v2.0.1-dev+build789', 'v', 'dev', undefined, undefined);
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1');
    tag = new Tag('v2.0.1-dev+build789', 'v', 'dev', undefined, true);
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1+48c41ffe');
  });
  it('release type + auto up', async () => {
    // Release Type + Auto up version
    // !!! Release type no work if Auto up is disabled !!!
    // patch
    let tag: Tag = new Tag('v2.0.1-dev+build789', 'v', 'dev', undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.2-dev.1');
    // minor
    tag = new Tag('v2.0.2-dev.1', 'v', 'dev', undefined, undefined, 'minor', true);
    expect(tag.buildNewTag()).toBe('v2.1.1-dev.1');
    // major
    tag = new Tag('v2.0.2-dev.1', 'v', 'dev', undefined, undefined, 'major', true);
    expect(tag.buildNewTag()).toBe('v3.0.1-dev.1');
  });
  /**
   * Negative tests
   */
  it('negative build tag', async () => {
    // Clear tag
    const tag: Tag = new Tag('vA.0.2-dev.1', 'v', 'dev', undefined, undefined, 'major', true);
    const newTag: string = tag.buildNewTag();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Error clean version "vA.0.2-dev.1"');
    expect(newTag).toBe('');
  });
});
