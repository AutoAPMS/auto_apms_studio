# Contributing

Thanks for your interest in contributing to AutoAPMS Studio! This page describes the typical workflow and a few guidelines to make the review process smooth.

## Quick workflow

1. Fork the repo and create a feature branch:

```bash
git checkout -b feat/<short-description>
```

2. Implement your changes and add tests.
3. Run tests and linters locally.
4. Push your branch and open a Merge Request (PR) against `master`. Describe the change, rationale and testing steps.

## Review & testing

- Keep PRs small and focused to speed up review.
- Include unit tests for backend logic and JavaScript frontend logic.
- The maintainers will review and may request changes. Please respond to feedback and keep the branch up to date.

## Before you open a PR

- Run linters and type checks.
- Update developer docs (`docs/dev-guide/`) if your change affects public backend APIs or development setup.
- If you change user-visible behavior, also update the user guide.

<div class="custom-block tip" style="padding: 8px 12px;">
  <p style="margin: 0;">Tip: Small, well-documented PRs are reviewed faster. Add a short testing checklist to the PR description.</p>
</div>


