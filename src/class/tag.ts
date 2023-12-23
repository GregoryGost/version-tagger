import { createHmac } from 'node:crypto';
import { inc, clean } from 'semver';
import { setFailed } from '@actions/core';
//
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
   */
  private readonly version: string;
  /**
   * Custom Prefix for version. Example: `v`
   */
  private readonly prefix: string | null;
  /**
   * Custom Postfix for version. Example: `-beta`
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
   * Example: `+fyf2c5fr`, `+build123`
   */
  private readonly metadata: string | boolean;
  /**
   * Release type version.
   * `major`(X.y.z) or `minor`(x.Y.z) or `patch`(x.y.Z).
   * If not specified, then no version will be incremented.
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
    prefix?: string | null,
    postfix?: string | null,
    postfix_no_up?: boolean,
    metadata?: string | boolean,
    release_type?: ReleaseTypeT | null,
    auto?: boolean
  ) {
    this.version = version;
    this.prefix = prefix ?? null;
    this.postfix = postfix ?? null;
    this.startPostfixIdentifier = '1';
    this.postfixNoUp = postfix_no_up ?? false;
    this.metadata = metadata ?? false;
    this.releaseType = release_type ?? null;
    this.auto = auto ?? false;
    this.postfixPatchFrieze = null;
  }

  /**
   * Main new tag builder
   * @returns {string} New tag
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
   * If AUTO `true`: major, minor, patch.
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
    if (this.postfix !== null && this.postfix !== '') {
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
}

export { Tag };
