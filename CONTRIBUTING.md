# Contributing to DoctorFormAssist

Thank you for helping improve DoctorFormAssist.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/doctorformassist.git
cd doctorformassist
npm install       # also installs Husky git hooks
npm run dev       # start dev server at localhost:5173
```

## Before you commit

Husky runs lint-staged on every commit automatically. To run all checks manually:

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Vitest unit + integration
npm run test:e2e    # Playwright (requires dev server running)
```

## Branch naming

| Prefix   | Use for                          |
|----------|----------------------------------|
| `feat/`  | New features                     |
| `fix/`   | Bug fixes                        |
| `chore/` | Tooling, dependency updates      |
| `docs/`  | Documentation only               |
| `test/`  | Tests only                       |

Example: `feat/add-patient-id-field`

## Commit style (Conventional Commits)

```
type(scope?): short description

feat: add patient ID field
fix: sanitize special chars in PDF filename
chore: update jspdf to 2.5.2
test: add coverage for useDownload hook
```

## Pull Request

1. Open a PR against `main`
2. CI runs automatically — all checks must pass
3. You'll get a unique preview URL to verify the change visually
4. Request a review

## Adding a new lab test

1. Add the test to `src/constants/tests.ts` with a unique `TestId`
2. Add the `TestId` to the union type in `src/types/index.ts`
3. Run `npm test` — existing tests should still pass
4. Add a unit test verifying the new test renders in `PatientForm`
