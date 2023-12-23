/// <reference types="node" />
import type { ReleaseType } from 'semver';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TAG
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export declare type ReleaseTypeT = ReleaseType | '';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GITHUB
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export declare type TagResponseT = RestEndpointMethodTypes['repos']['listTags']['response'];

export declare type TagDataT = RestEndpointMethodTypes['repos']['listTags']['response']['data'][0];

export declare type CreateTagResponseT = RestEndpointMethodTypes['git']['createTag']['response'];

export declare type CompareCommitsResponseT = RestEndpointMethodTypes['repos']['compareCommits']['response'];

export declare type CommitDataT = CompareCommitsResponseT['data']['commits'][0];

export declare type CreateRefResponseT = RestEndpointMethodTypes['git']['createRef']['response'];
