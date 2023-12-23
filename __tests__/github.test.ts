/**
 * Unit tests for src/class/github.ts
 */

import { join } from 'node:path';
import * as core from '@actions/core';
import * as github from '@actions/github';
//
import { Github } from '../src/class/github';
//
import type {
  TagResponseT,
  TagDataT,
  CompareCommitsResponseT,
  CommitDataT,
  CreateTagResponseT,
  CreateRefResponseT
} from '../src/types';

const mockToken = 'oBgGDgMmhwHAwxJaqBZzImWeypnYKWwQSGtvtYxhNzzYomNINkLaOHAVFCNwtOgXSb';

// Mock the GitHub Actions github library
let getOctokitMock: jest.SpyInstance;
// Mock the GitHub Actions core library
let setFailedMock: jest.SpyInstance;
let infoMock: jest.SpyInstance;
let warningMock: jest.SpyInstance;

describe('github.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    //
    process.env.GITHUB_EVENT_PATH = join(__dirname, 'github_payload.json');
    process.env.GITHUB_REPOSITORY = 'GregoryGost/version-tagger';
    //
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    infoMock = jest.spyOn(core, 'info').mockImplementation();
    warningMock = jest.spyOn(core, 'warning').mockImplementation();
    getOctokitMock = jest.spyOn(github, 'getOctokit').mockImplementation();
  });
  /**
   * Instance test
   */
  it('github instance', async () => {
    const githubTest: Github = new Github(mockToken);
    expect(githubTest instanceof Github).toBe(true);
  });
  /**
   * Get tags tests
   */
  it('github tags one tag', async () => {
    const tagArray: TagDataT[] = [
      {
        name: '2.0.0',
        commit: {
          sha: '',
          url: ''
        },
        zipball_url: '',
        tarball_url: '',
        node_id: ''
      }
    ];
    getOctokitMock.mockImplementation(() => {
      return {
        rest: {
          repos: {
            listTags: async (): Promise<TagResponseT> => {
              const octokitResponse: TagResponseT = {
                headers: {
                  date: String(Date.now())
                },
                status: 200,
                url: '',
                data: tagArray
              };
              return octokitResponse;
            }
          }
        }
      };
    });
    // Default tags are []
    const githubTest: Github = new Github(mockToken);
    expect(githubTest.tags.length).toBe(0);
    // Get tag from repository
    const tagFromFunc: string[] = await githubTest.getTags();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Tags received ["2.0.0"]');
    expect(tagFromFunc.length).toBe(1);
    expect(githubTest.tags.length).toBe(1);
    expect(tagFromFunc.includes('2.0.0')).toBe(true);
    expect(githubTest.tags.includes('2.0.0')).toBe(true);
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  it('github get tags is empty', async () => {
    // Get tag is empty from repository
    const tagArray: TagDataT[] = [];
    getOctokitMock.mockImplementation(() => {
      return {
        rest: {
          repos: {
            listTags: async (): Promise<TagResponseT> => {
              const octokitResponse: TagResponseT = {
                headers: {
                  date: String(Date.now())
                },
                status: 200,
                url: '',
                data: tagArray
              };
              return octokitResponse;
            }
          }
        }
      };
    });
    const githubTest: Github = new Github(mockToken);
    const tagFromFunc: string[] = await githubTest.getTags();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Tags not received');
    expect(tagFromFunc.length).toBe(0);
    expect(githubTest.tags.length).toBe(0);
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  it('github get tags more one', async () => {
    // Get tag more one
    const tagArray: TagDataT[] = [
      {
        name: '2.1.0',
        commit: {
          sha: '',
          url: ''
        },
        zipball_url: '',
        tarball_url: '',
        node_id: ''
      },
      {
        name: '2.2.0',
        commit: {
          sha: '',
          url: ''
        },
        zipball_url: '',
        tarball_url: '',
        node_id: ''
      }
    ];
    getOctokitMock.mockImplementation(() => {
      return {
        rest: {
          repos: {
            listTags: async (): Promise<TagResponseT> => {
              const octokitResponse: TagResponseT = {
                headers: {
                  date: String(Date.now())
                },
                status: 200,
                url: '',
                data: tagArray
              };
              return octokitResponse;
            }
          }
        }
      };
    });
    const githubTest: Github = new Github(mockToken);
    const tagFromFunc: string[] = await githubTest.getTags();
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Tags received ["2.1.0","2.2.0"]');
    expect(tagFromFunc.length).toBe(2);
    expect(tagFromFunc.includes('2.1.0')).toBe(true);
    expect(tagFromFunc.includes('2.2.0')).toBe(true);
    expect(setFailedMock).not.toHaveBeenCalled();
  });
  /**
   * Get tag array is failed test
   */
  it('github tags failed', async () => {
    const githubTest: Github = new Github(mockToken);
    await githubTest.getTags();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, `Cannot read properties of undefined (reading 'rest')`);
    expect(githubTest.tags.length).toBe(0);
  });
  /**
   * Push new Tag
   */
  it('github push new tag', async () => {
    const newTag = 'v3.0.0-rc.5';
    const githubSha = 'c3d0be41ecbe669545ee3e94d31ed9a4bc91ee3c';
    const githubHeadRef = 'test-1';
    //
    const baseCommit: CommitDataT = {
      url: '',
      sha: '',
      node_id: '',
      html_url: '',
      comments_url: '',
      commit: {
        url: '',
        author: null,
        committer: null,
        message: '',
        comment_count: 0,
        tree: {
          sha: '',
          url: ''
        }
      },
      author: null,
      committer: null,
      parents: []
    };
    const firstCommit: CommitDataT = {
      url: '',
      sha: '12345',
      node_id: '',
      html_url: '',
      comments_url: '',
      commit: {
        url: '',
        author: null,
        committer: null,
        message: 'Message for commit 1',
        comment_count: 0,
        tree: {
          sha: '',
          url: ''
        }
      },
      author: {
        login: 'TestLogin1',
        id: 1,
        node_id: '',
        avatar_url: '',
        gravatar_id: null,
        url: '',
        html_url: '',
        followers_url: '',
        following_url: '',
        gists_url: '',
        starred_url: '',
        subscriptions_url: '',
        organizations_url: '',
        repos_url: '',
        events_url: '',
        received_events_url: '',
        type: 'User',
        site_admin: false
      },
      committer: null,
      parents: []
    };
    const secondCommit: CommitDataT = {
      url: '',
      sha: '67890',
      node_id: '',
      html_url: '',
      comments_url: '',
      commit: {
        url: '',
        author: null,
        committer: null,
        message: 'Message for commit 2',
        comment_count: 0,
        tree: {
          sha: '',
          url: ''
        }
      },
      author: null,
      committer: null,
      parents: []
    };
    const compareCommitData: CompareCommitsResponseT['data'] = {
      url: '',
      html_url: '',
      permalink_url: '',
      diff_url: '',
      patch_url: '',
      base_commit: baseCommit,
      merge_base_commit: baseCommit,
      status: 'behind',
      ahead_by: 0,
      behind_by: 0,
      total_commits: 1,
      commits: [firstCommit, secondCommit]
    };
    const createTagData: CreateTagResponseT['data'] = {
      node_id: '',
      tag: 'v7.0.0',
      sha: 'abcd-sha',
      url: '',
      message: '',
      tagger: {
        name: '',
        email: '',
        date: ''
      },
      object: {
        type: 'commit',
        sha: '',
        url: ''
      }
    };
    const createRefData: CreateRefResponseT['data'] = {
      ref: `refs/tags/${newTag}`,
      node_id: '',
      url: 'htttps://someurl.some',
      object: {
        type: 'commit',
        sha: '',
        url: ''
      }
    };
    getOctokitMock.mockImplementation(() => {
      return {
        rest: {
          repos: {
            compareCommits: async (): Promise<CompareCommitsResponseT> => {
              const octokitResponse: CompareCommitsResponseT = {
                headers: {
                  date: String(Date.now())
                },
                status: 200,
                url: '',
                data: compareCommitData
              };
              return octokitResponse;
            }
          },
          git: {
            createTag: async (): Promise<CreateTagResponseT> => {
              const octokitResponse: CreateTagResponseT = {
                headers: {
                  date: String(Date.now())
                },
                status: 201,
                url: '',
                data: createTagData
              };
              return octokitResponse;
            },
            createRef: async (): Promise<CreateRefResponseT> => {
              const octokitResponse: CreateRefResponseT = {
                headers: {
                  date: String(Date.now())
                },
                status: 201,
                url: '',
                data: createRefData
              };
              return octokitResponse;
            }
          }
        }
      };
    });
    const githubTest: Github = new Github(mockToken);
    expect(githubTest.message).toBe('');
    await githubTest.pushNewTag(newTag, githubSha, githubHeadRef);
    expect(setFailedMock).not.toHaveBeenCalled();
    expect(githubTest.message).toBe(
      `\n1) [TestLogin1]: Message for commit 1\nSHA: 12345\n\n2) []: Message for commit 2\nSHA: 67890\n`
    );
    expect(infoMock).toHaveBeenNthCalledWith(1, 'Build message ok for v3.0.0-rc.5');
    expect(infoMock).toHaveBeenNthCalledWith(2, 'Create new tag: "v7.0.0" SHA: "abcd-sha"');
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      'Create reference for tag: refs/tags/v3.0.0-rc.5 (htttps://someurl.some)'
    );
  });
  it('github push new tag negative', async () => {
    const newTag = 'v5.0.0-rc.5';
    const githubSha = 'r3d0be41ecbe669545ee3e94d31ed9a4bc91ee3c';
    const githubHeadRef = 'test-2';
    const githubTest: Github = new Github(mockToken);
    expect(githubTest.message).toBe('');
    await githubTest.pushNewTag(newTag, githubSha, githubHeadRef);
    expect(setFailedMock).toHaveBeenNthCalledWith(1, `Cannot read properties of undefined (reading 'rest')`);
    expect(warningMock).toHaveBeenNthCalledWith(
      1,
      `Error get message from compare commits Cannot read properties of undefined (reading 'rest'). Return stub messsage.`
    );
  });
});
