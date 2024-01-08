import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, normalize, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { getInput, getBooleanInput, setFailed } from '@actions/core';
//
import type { ReleaseTypeT } from '../types';
import type { PackageJson } from 'type-fest';

/**
 * Basic configure class
 * Get from class:
 * * `root` - Node project root directory
 * * `token` - Github Action input token
 * * `version` - Node project version from package.json file
 * * `prefix` - Custom Prefix for version
 * * `postfix` - Custom Postfix for version
 * * `dryrun` - Push or not push new tag to repo
 */
class Config {
  /**
   * Path to root action dir
   */
  private readonly rootPath: string;
  /**
   * JSON data object from package.json file
   */
  private readonly packageJsonData: PackageJson | null;
  /**
   * Default version if not found version in package.json file
   */
  private readonly defaultVersion: string = '0.1.0';
  /**
   * `REQUIRED` Token from Github Action Inputs
   */
  private readonly _inputToken: string;
  /**
   * `OPTIONAL` Version from Github Action Inputs
   * Example: `1.0.0`
   */
  private _inputVersion: string;
  /**
   * `OPTIONAL` Prefix from Github Action Inputs
   * Example: `v`
   * Result example: `v1.0.0`
   */
  private readonly _inputPrefix: string;
  /**
   * `OPTIONAL` Postfix from Github Action Inputs
   * Example: `beta`
   * Result example: `v1.0.0-beta.0`
   */
  private readonly _inputPostfix: string;
  /**
   * Do not apply version upgrade to postfix.
   * No number will be added to the postfix.
   * Example: `v1.0.0-beta`, `2.5.1-rc`
   */
  private readonly _inputPostfixNoUpgrade: boolean;
  /**
   * `OPTIONAL` Additional metadata for tag
   * If boolean `true`. Trim SHA commit
   * Example: `fyf2c5fr`, `build123`
   * Result example: `v1.0.0-beta.1+build123`
   */
  private readonly _inputMetadata: string | boolean;
  /**
   * `OPTIONAL` Dry Run from Github Action Inputs
   * If `true`, then it does not actually commit and push the new tag into the repository.
   * It simply displays the version in the info.
   * Default: `false`
   */
  private readonly _dryRun: boolean;
  /**
   * `OPTIONAL` Forced version update. May be incorrect because in some cases duplicates the version upgrade.
   * DANGEROUS!!! The version in the file may not match what will be in the tags as a result.
   * If `FALSE`, no automatic promotions will be made.
   * Default: `false`
   */
  private readonly _autoUpVersion: boolean;
  /**
   * Release type version.
   * `major`(X.y.z) or `minor`(x.Y.z) or `patch`(x.y.Z).
   * All variants: `major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch`, `prerelease`.
   * If not specified, then no version will be incremented.
   * ---
   * * DOC: https://github.com/npm/node-semver/blob/main/README.md'
   */
  private readonly _inputReleaseType: ReleaseTypeT;
  /**
   * The commit SHA that triggered the workflow.
   * The value of this commit SHA depends on the event that triggered the workflow.
   * For more information, see
   * Events that trigger workflows: <https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows>.
   * Example: `ffac537e6cbbf934b08745a378932722df287a53`
   */
  private readonly _githubSha: string;
  /**
   * The head ref or source branch of the pull request in a workflow run.
   * This property is only set when the event that triggers a workflow
   *    run is either `pull_request` or `pull_request_target`.
   * For example, `feature-branch-1`.
   */
  private readonly _githubHeadRef: string;
  /**
   * Use latest available tag as source version.
   * Applies the latest available tag received from the repository for the source version.
   * If there are no available tags, it takes the version from the `package.json` file
   */
  private readonly _inputUseLastTag: boolean;

  constructor(root_path?: string) {
    this.rootPath = root_path ?? Config.getRootDir();
    this._inputToken = getInput('token', { required: true });
    this._inputVersion = getInput('version', { required: false });
    this._inputUseLastTag = getBooleanInput('uselasttag', { required: false }) ?? false;
    this._inputPrefix = getInput('prefix', { required: false });
    this._inputPostfix = getInput('postfix', { required: false });
    this._inputPostfixNoUpgrade = getBooleanInput('postfixnoup', { required: false }) ?? false;
    this._inputMetadata = getInput('metadata', { required: false });
    this._inputReleaseType = getInput('releasetype', { required: false }) as ReleaseTypeT;
    this._autoUpVersion = getBooleanInput('auto', { required: false }) ?? false;
    this._dryRun = getBooleanInput('dryrun', { required: false }) ?? false;
    //
    this.packageJsonData = this._inputVersion !== undefined && this._inputVersion !== '' ? null : this.getPackageData();
    // Environments variable
    this._githubSha = this.setGithabSha(process.env.GITHUB_SHA);
    this._githubHeadRef =
      process.env.GITHUB_HEAD_REF && process.env.GITHUB_HEAD_REF !== '' ? process.env.GITHUB_HEAD_REF : 'main';
  }

  /**
   * Get root actions directory
   * @returns {string} node project root path for action
   */
  get root(): string {
    return this.rootPath;
  }

  /**
   * Get token from Github Action input `token`
   * @returns {string} github action token
   */
  get token(): string {
    return this._inputToken;
  }

  /**
   * Get node project actual version
   * @returns {string} version from `package.json` file
   */
  get version(): string {
    if (this._inputVersion !== undefined && this._inputVersion !== '') return this._inputVersion;
    if (this.packageJsonData !== null && this.packageJsonData.version !== undefined)
      return this.packageJsonData.version;
    return this.defaultVersion;
  }

  /**
   * Set node project actual version
   * @param {string} new_version New version for source. Example: `v1.5.7-release`
   */
  set version(new_version: string) {
    this._inputVersion = new_version;
  }

  /**
   * Get release type from Github Action Inputs
   * @returns {ReleaseTypeT | null} release type `major`, `minor`, `patch` or null
   */
  get releaseType(): ReleaseTypeT | null {
    if (!this.checkReleaseType(this._inputReleaseType) || this._inputReleaseType === '') return null;
    return this._inputReleaseType;
  }

  /**
   * Get Prefix from Github Action Inputs
   * @returns {string | null} Prefix before version. Example: `v`. Result example: `v1.0.0`
   */
  get prefix(): string | null {
    if (this._inputPrefix === '') return null;
    return this._inputPrefix;
  }

  /**
   * Get Postfix from Github Action Inputs
   * @returns {string | null} Postfix after version. Example: `-beta`. Result example: `1.0.0-beta`
   */
  get postfix(): string | null {
    if (this._inputPostfix === '') return null;
    return this._inputPostfix;
  }

  /**
   * Get Postfix No Upgrade version flag
   * @returns {boolean} Postfix No Upgrade version flag. Default: `false`
   */
  get postfixNoUpgrade(): boolean {
    return this._inputPostfixNoUpgrade;
  }

  /**
   * Get additional metadata from Github Action Inputs
   * @returns {string | boolean | undefined} Metadata. Example: `+build123`. Result example: `v1.0.0-beta.1+build123`
   */
  get metadata(): string | boolean {
    if (this._inputMetadata === undefined || this._inputMetadata === '') return false;
    return this._inputMetadata;
  }

  /**
   * Get Dry Run from Github Action Inputs.
   * If `true`, then it does not actually commit and push the new tag into the repository.
   * It simply displays the version in the info.
   * @returns {boolean} Dry Run flag. Default: `false`
   */
  get dryRun(): boolean {
    return this._dryRun;
  }

  /**
   * Get Auto up version from Github Action Inputs.
   * If `true`, then the version upgrade mechanism will be applied without taking into account the dependence
   * on the source file (if it was applied)
   * @returns {boolean} Auto up version flag. Default: `false`
   */
  get autoUp(): boolean {
    return this._autoUpVersion;
  }

  /**
   * Get commit SHA that triggered the workflow.
   * @returns {string} Github SHA. Exampe: `ffac537e6cbbf934b08745a378932722df287a53`
   */
  get githubSha(): string {
    return this._githubSha;
  }

  /**
   * Get head ref or source branch of the pull request in a workflow run.
   * @returns {string} Head ref or source branch. Example: `feature-branch-1`
   */
  get githubHeadRef(): string {
    return this._githubHeadRef;
  }

  /**
   * Get Use latest available tag as source version
   * @returns {boolean} Use latest available tag flag. Default: `false`
   */
  get useLastTag(): boolean {
    return this._inputUseLastTag;
  }

  /**
   * Determining the Project Root Path
   * @returns {string} application root path
   */
  private static getRootDir(): string {
    const filename: string = fileURLToPath(pathToFileURL(__filename).toString());
    const dir = dirname(filename);
    let currentDir: string = dir;
    while (!existsSync(join(currentDir, 'package.json'))) {
      currentDir = join(currentDir, '..');
    }
    return normalize(currentDir);
  }

  /**
   * Get JSON data from package.json file
   * @returns {PackageJson} JSON object from package.json
   */
  private getPackageData(): PackageJson {
    const packageData: string = readFileSync(normalize(join(this.rootPath, 'package.json')), 'utf-8');
    return JSON.parse(packageData);
  }

  /**
   * Check Input Release type in correct range
   */
  private checkReleaseType(type: string): type is ReleaseTypeT {
    return ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease', ''].includes(type);
  }

  /**
   * Set Github commit SHA that triggered the workflow
   * @param {string | undefined} github_sha Example: `ffac537e6cbbf934b08745a378932722df287a53`
   * @returns {string} Failed or SHA
   */
  private setGithabSha(github_sha: string | undefined): string {
    if (github_sha !== undefined && github_sha !== '') {
      return github_sha;
    }
    setFailed('GITHUB_SHA is Empty!!!');
    return '';
  }
}

export { Config };
