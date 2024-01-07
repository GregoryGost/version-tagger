# Version Tagger (beta)

![License](https://img.shields.io/github/license/GregoryGost/version-tagger)
![RepoSize](https://img.shields.io/github/repo-size/GregoryGost/version-tagger)
![CodeSize](https://img.shields.io/github/languages/code-size/GregoryGost/version-tagger)
![IssuesOpen](https://img.shields.io/github/issues-raw/GregoryGost/version-tagger)
![LatestRelease](https://img.shields.io/github/v/release/GregoryGost/version-tagger)
![CI](https://github.com/GregoryGost/version-tagger/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/GregoryGost/version-tagger/actions/workflows/check-dist.yml/badge.svg)](https://github.com/GregoryGost/version-tagger/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/GregoryGost/version-tagger/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/GregoryGost/version-tagger/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Action to automate versioning management.

> [!IMPORTANT]
>
> The beta version only works with projects containing a `package.json` or workflow file that passes the version to the
> input

## Pre usage (github config)

Change or check repo setting for action

## Config options

Configure for this action

### Inputs

| name            | required | description                                                                                                                                                                                                                                                                                                                                           | default |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **token**       | `true`   | The GitHub Token to use for reference management in the repo                                                                                                                                                                                                                                                                                          |         |
| **version**     | `false`  | Version from previous action output. Pattern semver <https://semver.org>: `x.y.z`                                                                                                                                                                                                                                                                     | `0.1.0` |
| **prefix**      | `false`  | A prefix that will appear immediately before the tag version. Example: `v` => `v1.0.0`                                                                                                                                                                                                                                                                | `''`    |
| **postfix**     | `false`  | Postfix that will appear immediately after the tag version. Example: `beta` => `v1.0.0-beta.0`                                                                                                                                                                                                                                                        | `''`    |
| **postfixnoup** | `false`  | Do not apply version upgrade to postfix. No number will be added to the postfix. Example: `v1.0.0-beta`, `2.5.1-rc`                                                                                                                                                                                                                                   | `false` |
| **metadata**    | `false`  | Add your own metadata, or use the sliced sha1 version hash.. Example: `build123` or `fyf2c5fr` => `v1.0.0-beta.1+fyf2c5fr`                                                                                                                                                                                                                            | `''`    |
| **releasetype** | `false`  | Used in conjunction with a `auto` parameter. Release type version. `major`(X.y.z) or `minor`(x.Y.z) or `patch`(x.y.Z). If not specified, then no version will be incremented. All variants: `major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch`, `prerelease`. More in semver doc: <https://github.com/npm/node-semver/blob/main/README.md> | `''`    |
| **auto**        | `false`  | Used in conjunction with a `releasetype` parameter. Whether to automatically upgrade the version regardless of the committed version in the file. DANGEROUS!!! The version in the file may not match what will be in the tags as a result. If `FALSE`, no automatic promotions will be made.                                                          | `false` |
| **dryrun**      | `false`  | If this value is true, the tag will not be pushed. Use for test this action                                                                                                                                                                                                                                                                           | `false` |

### Outputs

| name       | description                                                   |
| ---------- | ------------------------------------------------------------- |
| **newtag** | The GitHub Token to use for reference management in the repo. |

## Usage

Basic example for use this action. Develop tagging. Production tagging.

```yml

```

## Contrib

Update pnpm Windows version

```sh
pnpm add -g @pnpm/exe
```

Update pnpm Linux(Debian) version

```sh
pnpm add -g pnpm
```

## Licensing

All source materials for the project are distributed under the [GPL v3](./LICENSE 'License Description') license. You
can use the project in any form, including for commercial activities, but it is worth remembering that the author of the
project does not provide any guarantees for the performance of the executable files, and also does not bear any
responsibility for claims or damage caused.

This repository contains references to all modules used and their licenses. They are collected in a
[special license file](./dist/licenses.txt). Their authors are (or are not) responsible for the quality and stability of
the operation of these modules.

## About

GregoryGost - <https://gregory-gost.ru>
