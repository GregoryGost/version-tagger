/**
 * Unit tests for src/class/tag.ts
 */

import { expect } from '@jest/globals';
import * as core from '@actions/core';
//
import { Tag } from '../src/class/tag';

jest.mock(
  '@actions/core',
  () => ({
    setFailed: jest.fn(),
    info: jest.fn()
  }),
  { virtual: true }
);

let setFailedMock: jest.MockedFunction<typeof core.setFailed>;

describe('tag.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setFailedMock = jest.mocked(core.setFailed);
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
    expect(() => tag.buildNewTag()).toThrow(/older than an existing release line/);
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
    expect(tag.buildNewTag()).toBe('v2.0.1-dev.1'); // Promote and then reuse the matching prerelease line
    tag = new Tag('v2.0.2', undefined, 'v', 'dev', undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.3-dev.1'); // Exactly one patch increment
    tag = new Tag('v2.0.2', undefined, 'v', undefined, undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.3'); // Exactly one patch increment
    tag = new Tag('v2.0.2-dev.1', undefined, 'v', undefined, undefined, undefined, 'patch', true);
    expect(tag.buildNewTag()).toBe('v2.0.2'); // Promote existing patch prerelease to stable
    // minor
    tag = new Tag('v2.0.2-dev.1', undefined, 'v', 'dev', undefined, undefined, 'minor', true);
    expect(tag.buildNewTag()).toBe('v2.1.0-dev.1'); // No additional patch increment
    // major
    tag = new Tag('v2.0.2-dev.1', undefined, 'v', 'dev', undefined, undefined, 'major', true);
    expect(tag.buildNewTag()).toBe('v3.0.0-dev.1'); // No additional patch increment
  });
  it('selects the largest prerelease identifier across unordered tags', () => {
    const tags = [
      'v1.1.0',
      'v1.2.0-dev.2',
      'v1.2.0-rc.25',
      'v1.2.0-dev.10',
      'v1.2.0-dev.3',
      'not-a-semver'
    ];
    expect(new Tag('1.2.0', tags, 'v', 'dev').buildNewTag()).toBe('v1.2.0-dev.11');
    expect(new Tag('1.2.0', [...tags].reverse(), 'v', 'dev').buildNewTag()).toBe('v1.2.0-dev.11');
  });

  it('starts the 1.2.0 prerelease series separately from 1.1.0 tags', () => {
    const tags = ['v1.1.0', 'v1.1.0-dev.1', 'v1.1.0-dev.55'];
    expect(new Tag('1.2.0', tags, 'v', 'dev').buildNewTag()).toBe('v1.2.0-dev.1');
    expect(new Tag('1.2.0', [...tags, 'v1.2.0-dev.1'], 'v', 'dev').buildNewTag()).toBe('v1.2.0-dev.2');
  });

  it('rejects prereleases after a stable release of the same or newer version', () => {
    expect(() => new Tag('1.2.0', ['v1.2.0'], 'v', 'dev').buildNewTag()).toThrow(/already released/);
    expect(() => new Tag('1.2.0', ['v1.2.1-dev.1'], 'v', 'dev').buildNewTag()).toThrow(/older/);
  });

  it('does not mix release channels or prefixes', () => {
    const tags = ['v1.2.0-rc.12', 'r1.2.0-dev.9', 'v1.2.0-dev.2'];
    expect(new Tag('1.2.0', tags, 'v', 'dev').buildNewTag()).toBe('v1.2.0-dev.3');
    expect(new Tag('1.2.0', tags, 'v', 'rc').buildNewTag()).toBe('v1.2.0-rc.13');
  });

  /**
   * Negative tests
   */
  it('negative build tag', async () => {
    // Clear tag
    const tag: Tag = new Tag('vA.0.2-dev.1', undefined, 'v', 'dev', undefined, undefined, 'major', true);
    expect(() => tag.buildNewTag()).toThrow('Error clean version "vA.0.2-dev.1"');
    expect(setFailedMock).not.toHaveBeenCalled();
  });
});
