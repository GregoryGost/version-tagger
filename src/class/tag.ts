import { createHmac } from 'node:crypto';
import { inc, clean, parse, compare } from 'semver';
import { info } from '@actions/core';
//
import type { SemVer } from 'semver';
import type { ReleaseTypeT } from '../types';

/**
 * Tagger class
 * * DOC: https://semver.org/
 */
class Tag {
  /**
   * Input source version.
   * From Githab Action Input, or `package.json` file
   * ---
   * The base version comes from explicit input or package.json; repository tags
   * are examined to find the next prerelease identifier.
   */
  private readonly version: string;
  /**
   * Known tags from Git repo (the GitHub API order is not trusted)
   */
  private readonly previousTags: readonly string[];
  /**
   * Custom Prefix for version. Example: `v`
   */
  private readonly prefix: string | null;
  /**
   * Custom Postfix for version. Example: `beta`, `rc`
   */
  private readonly postfix: string | null;
  /**
   * Postfix No Upgrade version flag.
   * Default: `false`
   */
  private readonly postfixNoUp: boolean;
  /**
   * Additional metadata for tag
   * If boolean `true`. Trim SHA commit
   * Example: `true`, `false` || `build123`
   * Default: `false`
   */
  private readonly metadata: string | boolean;
  /**
   * Release type version.
   * `major`(X.y.z) or `minor`(x.Y.z) or `patch`(x.y.Z).
   * If not specified, then no version will be incremented.
   * Default: `null`
   */
  private readonly releaseType: ReleaseTypeT | null;
  /**
   * Whether to automatically upgrade the version regardless of the committed version in the file.
   * DANGEROUS!!! The version in the file may not match what will be in the tags as a result.
   * If `FALSE`, no automatic promotions will be made.
   * Default: `false`
   */
  private readonly auto: boolean;

  constructor(
    version: string,
    last_tag?: string | readonly string[] | null,
    prefix?: string | null,
    postfix?: string | null,
    postfix_no_up?: boolean,
    metadata?: string | boolean,
    release_type?: ReleaseTypeT | null,
    auto?: boolean
  ) {
    this.version = version;
    this.previousTags = typeof last_tag === 'string' ? [last_tag] : (last_tag ?? []);
    this.prefix = prefix ?? null;
    this.postfix = postfix ?? null;
    this.postfixNoUp = postfix_no_up ?? false;
    this.metadata = metadata ?? false;
    this.releaseType = release_type ?? null;
    this.auto = auto ?? false;
    //
  }

  /**
   * New tag builder
   * @returns {string} New tag / version
   */
  buildNewTag(): string {
    let newVersion: string = this.upVersion();
    newVersion = this.upPostfix(newVersion);
    if (this.prefix !== null) newVersion = `${newVersion !== '' ? this.prefix : ''}${newVersion}`;
    newVersion += this.getMetadata(newVersion);
    return newVersion;
  }

  /**
   * Up Version
   * If AUTO `true`: major, minor, patch or prerelease
   * If AUTO `false` - no up version (Manual)
   * @returns {string} Updated version or not changed version
   */
  private upVersion(): string {
    const version = clean(this.version);
    if (version === null) throw new Error(`Error clean version "${this.version}"`);
    info(`Now version: ${version}`);

    if (this.auto && this.releaseType === null)
      throw new Error('auto requires releasetype to choose a SemVer increment');

    if (this.releaseType !== null && this.releaseType !== '') {
      const updatedVersion = inc(version, this.releaseType);
      if (updatedVersion === null) throw new Error(`Cannot increment version "${version}"`);
      return updatedVersion;
    }

    return version;
  }

  /**
   * Generate the next prerelease for a given base version and channel.
   * The highest numeric identifier is selected from all repository tags,
   * independent of the order returned by GitHub.
   */
  private upPostfix(version: string): string {
    if (this.postfix === null || this.postfix === '') return version;
    if (!/^[0-9A-Za-z-]+$/.test(this.postfix))
      throw new Error(`Invalid prerelease identifier "${this.postfix}"`);

    const parsedVersion = parse(version);
    if (parsedVersion === null) throw new Error(`Invalid SemVer "${version}"`);
    const baseVersion = `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
    const prefix = this.prefix ?? '';
    const parsedTags: SemVer[] = [];

    for (const name of this.previousTags) {
      if (prefix !== '' && !name.startsWith(prefix)) continue;
      const parsedTag = parse(prefix !== '' ? name.slice(prefix.length) : name);
      if (parsedTag !== null) parsedTags.push(parsedTag);
    }

    for (const tag of parsedTags) {
      const taggedVersion = `${tag.major}.${tag.minor}.${tag.patch}`;
      if (compare(taggedVersion, baseVersion) > 0)
        throw new Error(`Requested version ${baseVersion} is older than an existing release line ${tag.version}`);
      if (taggedVersion === baseVersion && tag.prerelease.length === 0)
        throw new Error(`Version ${baseVersion} is already released; update the base version first`);
    }

    if (this.postfixNoUp) return `${baseVersion}-${this.postfix}`;

    let latestIdentifier = 0;
    const candidates = [...parsedTags, parsedVersion];

    for (const candidate of candidates) {
      const candidateVersion = `${candidate.major}.${candidate.minor}.${candidate.patch}`;
      if (candidateVersion !== baseVersion || candidate.prerelease[0] !== this.postfix) continue;

      if (candidate.prerelease.length === 1) continue;
      if (
        candidate.prerelease.length !== 2 ||
        typeof candidate.prerelease[1] !== 'number' ||
        !Number.isSafeInteger(candidate.prerelease[1])
      )
        throw new Error(`Unsupported prerelease format "${candidate.version}"`);

      latestIdentifier = Math.max(latestIdentifier, candidate.prerelease[1]);
    }

    if (!Number.isSafeInteger(latestIdentifier + 1))
      throw new Error(`Prerelease counter overflow for ${baseVersion}-${this.postfix}`);

    return `${baseVersion}-${this.postfix}.${latestIdentifier + 1}`;
  }

  /**
   * Get new Metadata based on SHA1 version hash
   * @param {string} version - Base version
   * @returns {string} Metadata.
   * If `true`: return SHA1 sliced hash. Example: `+f05d261f`.
   * If `false`: return empty string.
   * If custom string - return as is
   */
  private getMetadata(version: string): string {
    if (this.metadata === true) {
      const hash = createHmac('sha1', version).digest('hex').slice(0, 8);
      return `+${hash}`;
    } else if (typeof this.metadata === 'string' && this.metadata.length > 0) {
      return `+${this.metadata}`;
    }
    return '';
  }


}

export { Tag };
