import { setFailed, warning, info } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
//
import type {
  TagResponseT,
  TagDataT,
  CreateTagResponseT,
  CompareCommitsResponseT,
  CommitDataT,
  CreateRefResponseT
} from '../types';

/**
 * Github class
 * Used Octokit package. Based on GitHub API:
 * * DOC: https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
 * * DOC: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-tags
 * * DOC: https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#compare-two-commits
 * * DOC: https://docs.github.com/en/rest/git/tags?apiVersion=2022-11-28#create-a-tag-object
 * * DOC: https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28#create-a-reference
 */
class Github {
  /**
   * Githab repository context object
   * `{ owner, repo }`
   */
  // private readonly contextRepo: Context['repo'];
  /**
   * Github repository context Owner
   */
  private readonly owner: string;
  /**
   * Github repository context Repo
   */
  private readonly repo: string;
  /**
   * Githab Octokit Api client instance
   */
  private readonly _client: InstanceType<typeof GitHub>;
  /**
   * Tags in Github repository
   */
  private _tags: string[];
  private _message: string;

  constructor(token: string) {
    this.owner = context.repo.owner;
    this.repo = context.repo.repo;
    this._client = getOctokit(token);
    this._tags = [];
    this._message = '';
  }

  /**
   * Get Tags Github repository
   * @returns {string[]} Tags `array`
   */
  get tags(): string[] {
    return this._tags;
  }

  /**
   * Get special message for new version tag
   * @returns {string} Builded message or stub
   */
  get message(): string {
    return this._message;
  }

  /**
   * Get Repository Tags
   * * DOC: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-tags
   * @returns @returns {string[]} Tags `array`
   */
  async getTags(): Promise<string[]> {
    try {
      const repoTags: TagResponseT = await this._client.rest.repos.listTags({
        owner: this.owner,
        repo: this.repo,
        per_page: 100
      });
      const tags: string[] = repoTags.data.map((tagData: TagDataT) => {
        return tagData.name;
      });
      if (tags.length > 0) {
        this._tags = tags;
        info(`Tags received ${JSON.stringify(this._tags)}`);
      } else info('Tags not received from github repo');
      return this._tags;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFailed(error.message);
      return [];
    }
  }

  /**
   * Commit and Push GitHub tag + reference
   * * DOC: https://docs.github.com/en/rest/git/tags?apiVersion=2022-11-28#create-a-tag-object
   * * DOC: https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28#create-a-reference
   * @param {string} new_tag - New version tag
   * @param {string} github_sha - Github commit SHA that triggered the workflow
   * @param {string} github_head_ref - Github head ref or source branch of the pull request in a workflow run
   */
  async pushNewTag(new_tag: string, github_sha: string, github_head_ref: string): Promise<void> {
    try {
      // Get message
      const message: string = await this.getMessage(new_tag, github_head_ref);
      // Create tag
      const createTag: CreateTagResponseT = await this._client.rest.git.createTag({
        owner: this.owner,
        repo: this.repo,
        tag: new_tag,
        message,
        object: github_sha,
        type: 'commit'
      });
      info(`Create new tag: "${createTag.data.tag}" SHA: "${createTag.data.sha}"`);
      // Create reference
      const reference: CreateRefResponseT = await this._client.rest.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/tags/${createTag.data.tag}`,
        sha: createTag.data.sha
      });
      info(`Create reference for tag: ${reference.data.ref} (${reference.data.url})`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFailed(error.message);
    }
  }

  /**
   * Get special message for new version tag
   * * DOC: https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#compare-two-commits
   * @returns {string} Builded message or stub
   */
  private async getMessage(new_tag: string, github_head_ref: string): Promise<string> {
    try {
      const changelog: CompareCommitsResponseT = await this._client.rest.repos.compareCommits({
        owner: this.owner,
        repo: this.repo,
        base: this._tags.shift() ?? '',
        head: github_head_ref
      });
      const message: string = changelog.data.commits
        .map((commit_data: CommitDataT, index: number) => {
          let messageElement = index === 0 ? '\n' : '';
          messageElement += `${index + 1}) [${commit_data.author ? commit_data.author.login : ''}]: `;
          messageElement += `${commit_data.commit.message}`;
          messageElement += '\n';
          messageElement += `SHA: ${commit_data.sha}`;
          messageElement += '\n';
          return messageElement;
        })
        .join('\n');
      info(`Build message ok for ${new_tag}`);
      this._message = message;
      return message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      warning(`Error get message from compare commits ${error.message}. Return stub messsage.`);
      const message = `Version: ${new_tag}`;
      this._message = message;
      return message;
    }
  }
}

export { Github };
