# Contribution Guidelines

This page collects recommended conventions for code style, tests and CI.

## Code Style

- Backend: follow `ruff` and `mypy` settings in `auto_apms_studio/backend/pyproject.toml`.
- Frontend: follow the style used in `web/src`, you can use `prettier` to format the code (`npm run format`).

## Testing

- Add unit tests for backend logic under `auto_apms_studio/backend/tests/` using `pytest`.
- Add unit tests for frontend logic under `web/src/tests/` using `vitest`.
- Prefer deterministic tests. Mock adapters that require AutoAPMS or BehaviorTree.CPP imports (see existing tests for examples using `patch`).

## Commits & PRs

- Keep changes small and focused. Provide a clear PR description with testing steps.
- Include updated docs when public APIs or developer workflows change.
- Fork the repo and create a new branch for each PR. Use a descriptive name like `feat/add-node-upload` or `fix/node-model-cache`.

## CI & quality

- Ensure the CI passes before submitting a PR. The CI runs tests and linters for both backend and frontend.

## Release process

Releases are published by maintainers. Versions follow [Semantic Versioning](https://semver.org/) and are tagged as `vMAJOR.MINOR.PATCH`:

- **Patch** (`0.3.0` → `0.3.1`): bug fixes only.
- **Minor** (`0.3.1` → `0.4.0`): new features. While the major version is `0`, breaking changes may also be released as a minor version.
- **Major** (`0.4.0` → `1.0.0`): breaking changes once the API is considered stable.

### 1. Bump the version

The version is maintained in four files that must be kept in sync: `package.xml`, `auto_apms_studio/backend/pyproject.toml`, `web/package.json` and `web/package-lock.json`. Create a release branch from `develop` and bump all of them from the repository root:

```bash
VERSION=0.3.1 # New version without the leading "v"

git switch develop && git pull
git switch -c release/v${VERSION}

sed -i "s|<version>.*</version>|<version>${VERSION}</version>|" package.xml
sed -i "s|^version = \".*\"|version = \"${VERSION}\"|" auto_apms_studio/backend/pyproject.toml
(cd web && npm version "${VERSION}" --no-git-tag-version) # Updates package.json and package-lock.json
```

Verify that all files contain the new version, then commit and push:

```bash
git diff --stat # Should list exactly the four files above
grep -h "<version>" package.xml
grep -h "^version" auto_apms_studio/backend/pyproject.toml
grep -m1 '"version"' web/package.json

git commit -am "chore: bump version to ${VERSION}"
git push -u origin release/v${VERSION}
```

### 2. Merge into `master`

1. Open a PR from `release/vX.Y.Z` into `develop` and merge it once the CI passes.
2. Open a PR from `develop` into `master` and merge it once the CI passes.

::: tip Hotfixes
To release a fix without the features currently on `develop`, create the branch from `master` instead (`git switch -c hotfix/v${VERSION} master`), cherry-pick or implement the fix, bump the version as shown above and open the PR directly against `master`. Afterwards, merge `master` back into `develop`.
:::

### 3. Tag the release

Create an annotated tag on the merged commit on `master` and push it:

```bash
git switch master && git pull
git tag -a v${VERSION} -m "Release v${VERSION}"
git push origin v${VERSION}
```

Pushing the tag triggers the CI, which

- creates a GitHub release with the frontend and backend archives (`Build and Release` workflow),
- publishes the Docker image `ghcr.io/autoapms/auto_apms_studio_web:v${VERSION}`,
- redeploys the [Live Demo](https://autoapms.github.io/auto_apms_studio/), which always serves the latest release (`Deploy Pages` workflow). Previews of the latest commits on `master` and `develop` are served under `/master/` and `/develop/`.

Once the workflows have finished, check that the release appears on GitHub and that the version indicator at the bottom of the Live Demo's sidebar shows the new tag.

## Security note

- Always validate uploaded XML files. The backend uses `defusedxml` and enforces a 1MB size limit on uploads.
