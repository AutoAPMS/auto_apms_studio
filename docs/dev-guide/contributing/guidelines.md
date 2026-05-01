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

## Security note

- Always validate uploaded XML files. The backend uses `defusedxml` and enforces a 1MB size limit on uploads.
