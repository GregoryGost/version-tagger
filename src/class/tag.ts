import { createHmac } from 'node:crypto';
import { inc, clean, parse } from 'semver';
import { setFailed } from '@actions/core';
//
import type { SemVer } from 'semver';
import type { ReleaseTypeT } from '../types';
import type { IdentifierBase } from 'semver/functions/inc';

/**
 * Tagger class
 * * DOC: https://semver.org/
 */
class Tag {
  /**
   * Input source version.
   * From Githab Action Input, or `package.json` file
   * ---
   * If the version is obtained from the package.json file and postfix is used, then the last tag must be used.
   * Because only the last tag contains the last postfix index.
   */
  private readonly version: string;
  /**
   * Last tag from Git repo
   */
  private readonly lastTag: string | null;
  /**
   * Custom Prefix for version. Example: `v`
   */
  private readonly prefix: string | null;
  /**
   * Custom Postfix for version. Example: `beta`, `rc`
   */
  private readonly postfix: string | null;
  /**
   * Start identifier for postfix up
   * Example: `0` => `v1.0.0-beta.0` | `1` => `v1.0.0-beta.1`
   * Default: `1`
   */
  private readonly startPostfixIdentifier: IdentifierBase;
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
  /**
   * Utility Regexp for get version release type.
   * major, minor, patch
   */
  private readonly versionRegExp: RegExp = /(\d+)\.(\d+)\.(\d+)/;
  /**
   * Frieze postfix patch version for "pre" workaround
   */
  private postfixPatchFrieze: string | null;

  constructor(
    version: string,
    last_tag?: string | null,
    prefix?: string | null,
    postfix?: string | null,
    postfix_no_up?: boolean,
    metadata?: string | boolean,
    release_type?: ReleaseTypeT | null,
    auto?: boolean
  ) {
    this.version = version;
    this.lastTag = last_tag ?? null;
    this.prefix = prefix ?? null;
    this.postfix = postfix ?? null;
    this.postfixNoUp = postfix_no_up ?? false;
    this.metadata = metadata ?? false;
    this.releaseType = release_type ?? null;
    this.auto = auto ?? false;
    //
    this.startPostfixIdentifier = '1';
    this.postfixPatchFrieze = null;
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
    try {
      const version: string | null = clean(this.version);
      if (version === null) throw new Error(`Error clean version "${this.version}"`);
      // Get patch version for frieze
      if (this.postfix !== null && this.postfix !== '' && this.releaseType === null) {
        const versionMatch: RegExpMatchArray | null = version.match(this.versionRegExp);
        if (versionMatch !== null) this.postfixPatchFrieze = String(versionMatch[3]);
      }
      // Auto up if enabled
      if (this.auto === true) {
        if (this.releaseType !== null && this.releaseType !== '') {
          const newVersion: string | null = inc(version, this.releaseType);
          if (newVersion !== null) {
            return newVersion;
          }
        }
      } else if (this.releaseType === 'patch') {
        const newVersion: string | null = inc(version, this.releaseType);
        if (newVersion !== null) {
          return newVersion;
        }
      }
      return version;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFailed(error.message);
      return '';
    }
  }

  /**
   * Up Version postfix number.
   * Start identifier = `1`.
   * Example: `v1.0.0-rc.3` => `v1.0.0-rc.4` | `v1.0.0` => `v1.0.0-rc.1`
   * !!!NOTE!!! The "pre" operation is not available for use in typescript.
   * There is no basic option NOT to upgrade the patch version.
   * A workaround needs to be applied.
   * @param {string} version - Base version
   * @returns {string} Version with updated postfix
   */
  private upPostfix(version: string): string {
    // If postfix enabled
    if (this.postfix !== null && this.postfix !== '') {
      // If las tag exists postfix, change version. Get postfix from last tag
      version = this.setPostfixForBaseVersion(version);
      // next
      const identifier: false | IdentifierBase | undefined = this.postfixNoUp ? false : this.startPostfixIdentifier;
      const versionUpPostfix: string | null = inc(version, 'prerelease', this.postfix, identifier);
      if (versionUpPostfix === null) return version;
      // bring back the patch version
      if (this.postfixPatchFrieze !== null)
        return versionUpPostfix.replace(this.versionRegExp, `$1.$2.${this.postfixPatchFrieze}`);
      return versionUpPostfix;
    }
    return version;
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

  /**
   * Set postfix for base version
   * @param {string} version Raw version (from package.json - example 2.0.0)
   * @returns {string} postfixed version if set postfix and last tag is exists
   */
  private setPostfixForBaseVersion(version: string): string {
    // If las tag exists postfix, change version. Get postfix from last tag
    if (this.lastTag !== null && this.lastTag !== '') {
      const parseVersion: SemVer | null = parse(version);
      const parseLastTag: SemVer | null = parse(this.lastTag);
      if (parseLastTag !== null && parseVersion !== null) {
        if (
          parseVersion.major === parseLastTag.major &&
          parseVersion.minor === parseLastTag.minor &&
          parseVersion.patch === parseLastTag.patch
        ) {
          // Parse version prerelease
          // [] - if example v2.0.0
          // ['dev'] - if example v2.0.0-dev
          // ['dev', 1] - if example v2.0.0-dev.1
          if (parseLastTag.prerelease.length > 0 && parseLastTag.prerelease[0] !== undefined) {
            version += `-${parseLastTag.prerelease[0]}`;
          }
          if (parseLastTag.prerelease.length > 0 && parseLastTag.prerelease[1] !== undefined) {
            version += `.${parseLastTag.prerelease[1]}`;
          }
        }
      }
    }
    return version;
  }
}

export { Tag };
