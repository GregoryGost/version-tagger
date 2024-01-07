import { setFailed, setOutput, info } from '@actions/core';
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
      // let newTag: string | null = null;
      // get tags(last tag) from repo
      const repoTags: string[] = await this._github.getTags();
      // set version from last tag if use last tag is enabled
      if (this._config.useLastTag && repoTags && repoTags.length > 0) {
        this._config.version = repoTags[0];
      }
      // build and create new tag
      const tagBuilder: Tag = new Tag(
        this._config.version,
        this._config.useLastTag === false ? (repoTags.length > 0 ? repoTags[0] : null) : null,
        this._config.prefix,
        this._config.postfix,
        this._config.postfixNoUpgrade,
        this._config.metadata,
        this._config.releaseType,
        this._config.autoUp
      );
      const newTag: string = tagBuilder.buildNewTag();
      // check new tag is exists in repo (=> failed)
      // if inputVersion OR autoUp
      if (repoTags && repoTags.length > 0 && this._config.autoUp) {
        if (repoTags.includes(newTag)) throw new Error(`Tag "${newTag}" is already exists in repository!!!`);
      }
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
