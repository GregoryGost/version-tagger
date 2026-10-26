import { warning, info } from '@actions/core';
import { valid, lt, rcompare } from 'semver';
import { context, getOctokit } from '@actions/github';
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
  private readonly _client: ReturnType<typeof getOctokit>;
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
   * @returns {string} Built message or stub
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
    const tags: string[] = [];

    try {
      for (let page = 1; ; page++) {
        const response: TagResponseT = await this._client.rest.repos.listTags({
          owner: this.owner,
          repo: this.repo,
          per_page: 100,
          page
        });

        tags.push(...response.data.map((tagData: TagDataT) => tagData.name));
        if (response.data.length < 100) break;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list repository tags: ${message}`);
    }

    this._tags = tags;
    if (tags.length > 0) info(`Tags received ${JSON.stringify(tags)}`);
    else info('Tags not received from github repo');

    return [...tags];
  }

  /**
   * Commit and Push GitHub tag + reference
   * * DOC: https://docs.github.com/en/rest/git/tags?apiVersion=2022-11-28#create-a-tag-object
   * * DOC: https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28#create-a-reference
   * @param {string} new_tag - New version tag
   * @param {string} github_sha - Github commit SHA that triggered the workflow
   */
  async pushNewTag(new_tag: string, github_sha: string): Promise<void> {
    try {
      // Get message
      const message: string = await this.getMessage(new_tag, github_sha);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to push tag "${new_tag}": ${message}`);
    }
  }

  /**
   * Get special message for new version tag
   * * DOC: https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#compare-two-commits
   * @returns {string} Built message or stub
   */
  private async getMessage(new_tag: string, github_sha: string): Promise<string> {
    try {
      const previousTag =
        this._tags
          .filter(tag => valid(tag) !== null && (valid(new_tag) === null || lt(tag, new_tag)))
          .sort(rcompare)[0] ?? '';
      const changelog: CompareCommitsResponseT = await this._client.rest.repos.compareCommits({
        owner: this.owner,
        repo: this.repo,
        base: previousTag,
        head: github_sha
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
      warning(`Error get message from compare commits "${error.message}". Return stub message.`);
      const message = `Version: ${new_tag}`;
      this._message = message;
      return message;
    }
  }
}

export { Github };
