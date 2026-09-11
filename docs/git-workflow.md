# Git Workflow

The repository follows a lightweight Gitflow model:

- `main` represents stable release points.
- `develop` contains the integrated next release.
- `feature/*` branches contain scoped product work and merge into `develop`.
- `release/*` branches prepare an approved release before merging into `main` and back into `develop`.
- `hotfix/*` branches start from `main` for urgent released fixes.

Use concise English commit messages with a conventional prefix such as `feat`, `fix`, `test`, `docs`, `refactor`, or `chore`. Keep generated output, dependencies, local configuration, and secrets outside version control.
