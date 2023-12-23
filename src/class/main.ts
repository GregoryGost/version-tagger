import { setFailed, setOutput, info } from '@actions/core';
//
import { Config } from './config';
import { Tag } from './tag';
import { Github } from './github';

class Main {
  /**
   * Config class instance
   */
  private readonly config: Config;
  /**
   * Tag class instance
   */
  private readonly _tag: Tag;
  /**
   * Github class instance
   */
  private readonly _github: Github;

  constructor() {
    this.config = new Config();
    this._tag = new Tag(
      this.config.version,
      this.config.prefix,
      this.config.postfix,
      this.config.postfixNoUpgrade,
      this.config.metadata,
      this.config.releaseType,
      this.config.autoUp
    );
    this._github = new Github(this.config.token);
  }

  /**
   * Get tag builder
   * @returns {Tag} Tag instance builder object
   */
  get tag(): Tag {
    return this._tag;
  }

  /**
   * Get github builder
   * @returns {Github} Github instance builder object
   */
  get github(): Github {
    return this._github;
  }

  // get tags(last tag) from repo
  // create new tag
  // check new tag is exists in repo (=> failed)
  // if dry run - only output
  // else push tag in repo and output

  async run(): Promise<void> {
    try {
      // get tags(last tag) from repo
      const repoTags: string[] | null = await this._github.getTags();
      // create new tag
      const newTag: string = this._tag.buildNewTag();
      // check new tag is exists in repo (=> failed)
      if (repoTags !== null && repoTags.length > 0) {
        if (repoTags.includes(newTag)) throw new Error(`Tag "${newTag}" is already exists in repository!!!`);
      }
      // if dry run - only output
      if (this.config.dryRun) {
        info('Dry Run is enabled. Just output new tag version ...');
        setOutput('newtag', newTag);
        return;
      }
      // else push tag in repo and output
      await this._github.pushNewTag(newTag, this.config.githubSha, this.config.githubHeadRef);
      info(`Pushed new tag "${newTag}" is OK. Work done`);
      setOutput('newtag', newTag);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFailed(error.message);
    }
  }
}

export { Main };
