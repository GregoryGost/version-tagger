import { setFailed, setOutput, info } from '@actions/core';
import { clean, compare, rcompare } from 'semver';
//
import { Config } from './config';
import { Tag } from './tag';
import { Github } from './github';

class Main {
  /**
   * Config class instance
   */
  private readonly _config: Config;
  /**
   * Github class instance
   */
  private readonly _github: Github;

  constructor(root_path?: string) {
    this._config = new Config(root_path);
    this._github = new Github(this._config.token);
  }

  /**
   * Get github builder
   * @returns {Github} Github instance builder object
   */
  get github(): Github {
    return this._github;
  }

  /**
   * Get config builder
   * @returns {Config} Config instance builder object
   */
  get config(): Config {
    return this._config;
  }

  /**
   * Main run function.
   * * get tags(last tag) from repo
   * * create new tag
   * * check new tag is exists in repo (=> failed)
   * * if dry run - only output
   * * else push tag in repo and output
   */
  async run(): Promise<void> {
    try {
      const repoTags = await this._github.getTags();
      const prefix = this._config.prefix ?? '';
      const semanticTags: { tag: string; version: string }[] = [];

      for (const tag of repoTags) {
        if (prefix !== '' && !tag.startsWith(prefix)) continue;
        const version = clean(prefix !== '' ? tag.slice(prefix.length) : tag);
        if (version !== null) semanticTags.push({ tag, version });
      }

      semanticTags.sort((a, b) => rcompare(a.version, b.version));

      if (this._config.useLastTag) {
        if (semanticTags.length === 0 && repoTags.length > 0)
          throw new Error('No matching SemVer tags found for uselasttag');
        if (semanticTags.length > 0) this._config.version = semanticTags[0].tag;
      }

      const tagBuilder = new Tag(
        this._config.version,
        repoTags,
        this._config.prefix,
        this._config.postfix,
        this._config.postfixNoUpgrade,
        this._config.metadata,
        this._config.releaseType,
        this._config.autoUp
      );

      const newTag = tagBuilder.buildNewTag();
      const normalizedNewTag = clean(prefix !== '' ? newTag.slice(prefix.length) : newTag);
      if (normalizedNewTag === null) throw new Error(`Generated invalid SemVer tag "${newTag}"`);

      if (semanticTags.some(tag => compare(tag.version, normalizedNewTag) === 0))
        throw new Error(`Tag "${newTag}" already exists with the same semantic version`);

      if (semanticTags.length > 0 && compare(normalizedNewTag, semanticTags[0].version) < 0)
        throw new Error(`Tag "${newTag}" would be older than existing tag "${semanticTags[0].tag}"`);

      // if dry run - only output
      if (this._config.dryRun) {
        info(`Dry Run is enabled. Just output new tag version "${newTag}" ...`);
        setOutput('newtag', newTag);
        return;
      }
      // else push tag in repo and output
      await this._github.pushNewTag(newTag, this._config.githubSha, this._config.githubHeadRef);
      info(`Pushed new tag "${newTag}" is OK. Work done`);
      setOutput('newtag', newTag);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFailed(error.message);
    }
  }
}

export { Main };
