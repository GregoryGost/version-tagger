# Version Tagger

![License](https://img.shields.io/github/license/GregoryGost/version-tagger)
![RepoSize](https://img.shields.io/github/repo-size/GregoryGost/version-tagger)
![CodeSize](https://img.shields.io/github/languages/code-size/GregoryGost/version-tagger)
![IssuesOpen](https://img.shields.io/github/issues-raw/GregoryGost/version-tagger)
![LatestRelease](https://img.shields.io/github/v/release/GregoryGost/version-tagger)
![CI](https://github.com/GregoryGost/version-tagger/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/GregoryGost/version-tagger/actions/workflows/check-dist.yml/badge.svg)](https://github.com/GregoryGost/version-tagger/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/GregoryGost/version-tagger/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/GregoryGost/version-tagger/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Action to automate tag-based version control. For both production and development.

> [!IMPORTANT]
>
> The this version only works with projects containing a `package.json` or workflow file that passes the version to the
> input

## Config options

Configure permission:

- [Configuring the default GITHUB_TOKEN permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#configuring-the-default-github_token-permissions)

### Inputs

| name            | required | description                                                                                                                                                                                                                                                                                                                                                                               | default |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **token**       | `true`   | The GitHub Token to use for reference management in the repo                                                                                                                                                                                                                                                                                                                              |         |
| **version**     | `false`  | Version from previous action output. Pattern semver <https://semver.org>: `x.y.z`                                                                                                                                                                                                                                                                                                         | `0.1.0` |
| **prefix**      | `false`  | A prefix that will appear immediately before the tag version. Example: `v` => `v1.0.0`                                                                                                                                                                                                                                                                                                    | `''`    |
| **postfix**     | `false`  | Postfix that will appear immediately after the tag version. Example: `beta` => `v1.0.0-beta.0`                                                                                                                                                                                                                                                                                            | `''`    |
| **postfixnoup** | `false`  | Do not apply version upgrade to postfix. No number will be added to the postfix. Example: `v1.0.0-beta`, `2.5.1-rc`                                                                                                                                                                                                                                                                       | `false` |
| **metadata**    | `false`  | Add your own metadata, or use the sliced sha1 version hash.. Example: `build123` or `fyf2c5fr` => `v1.0.0-beta.1+fyf2c5fr`                                                                                                                                                                                                                                                                | `''`    |
| **releasetype** | `false`  | Used in conjunction with a `auto` parameter (but there is an exception `patch`). Release type version. `major`(X.y.z) or `minor`(x.Y.z) or `patch`(x.y.Z). If not specified, then no version will be incremented. All variants: `major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch`, `prerelease`. More in semver doc: <https://github.com/npm/node-semver/blob/main/README.md> | `''`    |
| **auto**        | `false`  | Forced version update. DANGEROUS-1!!! May be incorrect because in some cases duplicates the version upgrade. DANGEROUS-2!!! The version in the file may not match what will be in the tags as a result. If `FALSE`, no automatic promotions will be made.                                                                                                                                 | `false` |
| **dryrun**      | `false`  | If this value is true, the tag will not be pushed. Use for test this action                                                                                                                                                                                                                                                                                                               | `false` |

### Outputs

| name       | description                                                   |
| ---------- | ------------------------------------------------------------- |
| **newtag** | The GitHub Token to use for reference management in the repo. |

## Usage

Example `.github/workflows/develop.yml` that will execute when a `push` or `pull_request` to the `develop` branch
occurs.

`token: ${{ secrets.GITHUB_TOKEN }}` - is required parameter. Github automatically generates this token. There is no
need to create it separately. Plus it's not safe!

```yml
name: Create Develop Tag

on:
  pull_request:
  push:
    branches:
      - develop

permissions:
  contents: write

jobs:
  create-dev-tag:
    name: Create Develop Tag
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4

      - name: Create tag
        id: create-tag
        uses: GregoryGost/version-tagger@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          prefix: 'v'
```

Basic examples for use this action. Develop tagging variants. Production tagging variants.

### 1. Example: Version from package.json

Gets the version `1.0.0` from the `package.json` file.

- Result: `v1.0.0`

```yml
- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
```

### 2. Example: External version input (no use package.json)

Gets the version `2.0.0` from the previous step workflow

- Result: `v2.0.0`

```yml
- name: Some generate version
  id: previous-step-id

- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    version: ${{ steps.previous-step-id.outputs.version }}
    prefix: 'v'
```

### 3. Example: Repository last tag version (no use package.json)

Gets the versions array `['v3.0.0-rc.12', 'v3.0.0-rc.11', 'v3.0.0-rc.10']` from the tag list in repository  
Removes pre-release postfixes when using the release type.

- Result: `v3.0.0` if releasetype: `patch` or `minor` or `major` or etc.
- Next result: `v3.0.1` if releasetype `patch`

```yml
- name: Some generate version
  id: previous-step-id

- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
    uselasttag: true
    releasetype: 'patch'
```

### 4. Example: Prerelease version with identifier from package.json (develop branch)

Gets the version `4.0.0` from the `package.json` file.

- Result: `v4.0.0-dev.1`
- Next result: `v4.0.0-dev.2`, `v4.0.0-dev.3`, etc.

```yml
- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
    postfix: 'dev'
```

### 5. Example: Prerelease version no identifier from package.json (develop branch)

Gets the version `5.0.0` from the `package.json` file.

- Result: `v5.0.0-dev`
- Next result if no change version in package.json: ERROR. `Tag "v2.6.3-dev" is already exists in repository!!!`
- If change version in package.json to `5.3.0`. Result: `v5.3.0-dev`

```yml
- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
    postfix: 'dev'
    postfixnoup: true
```

### 6. Example: Prerelease or Release version from package.json + metadata

Gets the version `6.0.0` from the `package.json` file.

- Result: `v6.0.0+build101`

```yml
- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
    metadata: 'build101'
```

- Result: `v6.0.0+649b8949`

```yml
- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
    metadata: true
```

### 7. Example: Dry run. No tag push in repository

Gets the version `7.0.0` from the `package.json` file.

- Result: `v7.0.0` to output step github action

```yml
- name: Create tag
  id: create-tag
  uses: GregoryGost/version-tagger@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    prefix: 'v'
    dryrun: true

- name: Print Output
  id: output
  run: echo "${{ steps.create-tag.outputs.newtag }}"
```

## Contrib

- Using pnpm modules manager
- Using unit tests

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
