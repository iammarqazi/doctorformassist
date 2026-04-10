# DoctorFormAssist

> **Live site:** [https://www.doctorformassist.com](https://www.doctorformassist.com)

Generate lab investigation requisition PDFs instantly. Set session details once, add multiple patients with their required tests, and download all PDFs in a single ZIP — entirely in the browser. No data ever leaves the device.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Development](#local-development)
5. [Running Tests](#running-tests)
6. [Deployment — Step by Step](#deployment--step-by-step)
7. [Custom Domain Setup](#custom-domain-setup)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Security](#security)
10. [Contributing](#contributing)

---

## Features

- One-time session details (Date, Doctor) shared across all patients
- Add unlimited patients, each with any combination of 14 lab tests
- Generates one PDF per patient-test pair (e.g. 3 patients × 4 tests = 12 PDFs)
- Each PDF has a printed Medical Officer label with a blank signature box
- All PDFs bundled into a single ZIP download named `lab_reports_YYYY-MM-DD.zip`
- 100% client-side — no backend, no database, no data uploaded anywhere
- Fully accessible (WCAG AA), keyboard navigable, screen-reader friendly
- Progressive Web App ready

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | React 18 + TypeScript (strict)    |
| Build tool    | Vite 5                            |
| PDF           | jsPDF (lazy-loaded)               |
| ZIP           | JSZip (lazy-loaded)               |
| Forms         | react-hook-form                   |
| Unit tests    | Vitest + React Testing Library    |
| E2E tests     | Playwright                        |
| Lint/format   | ESLint + Prettier                 |
| Git hooks     | Husky + lint-staged               |
| Hosting       | Cloudflare Pages (free)           |
| CI/CD         | GitHub Actions                    |

---

## Project Structure

```
doctorformassist/
├── src/
│   ├── components/          # UI components (presentational)
│   │   ├── SessionForm.tsx
│   │   ├── PatientForm.tsx
│   │   ├── PatientQueue.tsx
│   │   └── DownloadButton.tsx
│   ├── hooks/               # Custom React hooks (business logic)
│   │   ├── usePatientQueue.ts
│   │   └── useDownload.ts
│   ├── lib/                 # Pure functions (testable, no side effects)
│   │   ├── generatePdf.ts
│   │   └── generateZip.ts
│   ├── types/               # Shared TypeScript interfaces
│   ├── constants/           # Test definitions
│   ├── App.tsx
│   ├── App.module.css
│   ├── index.css
│   └── main.tsx
├── tests/
│   ├── unit/                # Pure function tests
│   ├── integration/         # Component + logic tests
│   └── e2e/                 # Full browser flow (Playwright)
├── public/
│   ├── _headers             # Cloudflare security headers
│   └── _redirects           # SPA routing fallback
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml        # Full CI/CD pipeline
│   └── dependabot.yml       # Automated dependency updates
├── .vscode/settings.json    # Shared editor config
├── playwright.config.ts
├── vitest.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## Local Development

### Prerequisites

- **Node.js** v20 or later — [nodejs.org](https://nodejs.org)
- **npm** v10 or later (comes with Node 20)
- **Git** — [git-scm.com](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/doctorformassist.git
cd doctorformassist
```

### 2. Install dependencies

```bash
npm install
```

This also sets up Husky git hooks automatically.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The dev server has hot module replacement — changes reflect instantly without refresh.

### 4. Build for production (optional local check)

```bash
npm run build
npm run preview
```

Open [http://localhost:4173](http://localhost:4173) to verify the production build locally.

---

## Running Tests

### Unit + Integration tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm run test:coverage
```

Coverage report is generated in `coverage/index.html`. Open it in a browser to inspect line/branch coverage. The pipeline enforces **≥80%** on all metrics.

### E2E tests (Playwright)

```bash
# Install browsers first (one-time)
npx playwright install --with-deps

# Run all E2E tests (headless)
npm run test:e2e

# Run with Playwright UI (visual, great for debugging)
npm run test:e2e:ui
```

E2E tests cover:
- Page load and element visibility
- Form validation errors
- Adding and removing patients from the queue
- Download button state transitions
- Actual ZIP file download and non-zero file size verification

### All checks (mirrors CI)

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

---

## Deployment — Step by Step

This app is deployed free on **Cloudflare Pages** — unlimited bandwidth, global CDN, scales to millions of users with zero configuration.

### Step 1 — Push code to GitHub

1. Create a new repository on [github.com](https://github.com/new)
   - Name: `doctorformassist`
   - Visibility: Public or Private (both work)

2. Push the project:

```bash
cd doctorformassist
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/doctorformassist.git
git push -u origin main
```

---

### Step 2 — Create a Cloudflare account

1. Go to [cloudflare.com](https://cloudflare.com) and sign up for a **free** account
2. Verify your email address

---

### Step 3 — Create a Cloudflare Pages project

1. In the Cloudflare dashboard, go to **Workers & Pages → Pages**
2. Click **Create a project → Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select your `doctorformassist` repository
5. Configure the build:

   | Setting              | Value         |
   |----------------------|---------------|
   | Framework preset     | Vite          |
   | Build command        | `npm run build` |
   | Build output directory | `dist`      |
   | Root directory       | `/`           |

6. Click **Save and Deploy**

Cloudflare builds and deploys your site. You'll get a URL like:
`https://doctorformassist.pages.dev`

---

### Step 4 — Add GitHub Secrets for CI/CD

The GitHub Actions pipeline needs two secrets to deploy automatically.

**Get your Cloudflare credentials:**

1. **Account ID:**
   - Cloudflare dashboard → Right sidebar → "Account ID" → Copy it

2. **API Token:**
   - Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click **Create Token**
   - Use the **"Edit Cloudflare Workers"** template
   - Under "Account Resources" → select your account
   - Under "Zone Resources" → select your zone (or All zones)
   - Click **Continue to summary → Create Token**
   - Copy the token (shown only once)

**Add secrets to GitHub:**

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** for each:

   | Secret Name              | Value                    |
   |--------------------------|--------------------------|
   | `CLOUDFLARE_API_TOKEN`   | Your API token           |
   | `CLOUDFLARE_ACCOUNT_ID`  | Your Account ID          |

Now every push to `main` triggers the full CI pipeline and auto-deploys to production. Every pull request gets a unique preview URL.

---

## Custom Domain Setup

To point `www.doctorformassist.com` to your Cloudflare Pages site:

### Step 1 — Buy the domain

Purchase `doctorformassist.com` from any registrar:
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (recommended — no markup, manages DNS automatically)
- Namecheap, GoDaddy, Google Domains, etc.

**Estimated cost:** ~$10–15/year for a `.com` domain.

### Step 2 — Add domain to Cloudflare Pages

1. In Cloudflare Pages → your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter `www.doctorformassist.com`
4. Click **Continue**

### Step 3 — Configure DNS

**If your domain is registered with Cloudflare Registrar:**
DNS is configured automatically. Skip to Step 4.

**If your domain is registered elsewhere:**

1. In your registrar's DNS settings, add a CNAME record:

   | Type  | Name | Target                              |
   |-------|------|-------------------------------------|
   | CNAME | www  | doctorformassist.pages.dev          |

2. Also add an apex redirect (for `doctorformassist.com` → `www.doctorformassist.com`):

   | Type  | Name | Target                              |
   |-------|------|-------------------------------------|
   | CNAME | @    | doctorformassist.pages.dev          |

   > Note: Some registrars don't support CNAME on apex (`@`). Use an ALIAS or ANAME record if available, or transfer DNS to Cloudflare.

3. Update your domain's nameservers to Cloudflare's:
   - Go to Cloudflare dashboard → **Add a Site** → enter `doctorformassist.com`
   - Follow the prompts — Cloudflare will show you two nameservers (e.g. `ns1.cloudflare.com`)
   - Go to your registrar → update nameservers to those two values
   - DNS propagation takes 5 minutes to 48 hours

### Step 4 — SSL/HTTPS

Cloudflare provisions a free SSL certificate automatically. Your site will be available at:

```
https://www.doctorformassist.com  ✓
https://doctorformassist.com      ✓ (redirects to www)
```

No configuration needed — Cloudflare handles it.

---

## CI/CD Pipeline

```
git push
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  1. Quality Gate                                    │
│     TypeScript strict check · ESLint · Prettier     │
└──────────────────────┬──────────────────────────────┘
                       │ pass
                       ▼
┌─────────────────────────────────────────────────────┐
│  2. Unit & Integration Tests                        │
│     Vitest · React Testing Library · ≥80% coverage  │
└──────────────────────┬──────────────────────────────┘
                       │ pass
                       ▼
┌─────────────────────────────────────────────────────┐
│  3. Production Build                                │
│     vite build · TypeScript compile                 │
└──────────────────────┬──────────────────────────────┘
                       │ pass
                       ▼
┌─────────────────────────────────────────────────────┐
│  4. E2E Tests                                       │
│     Playwright · Chromium + Firefox + Mobile Chrome  │
└──────────────────────┬──────────────────────────────┘
                       │ pass
              ┌────────┴────────┐
              ▼                 ▼
        Pull Request?       Push to main?
              │                 │
              ▼                 ▼
     Preview Deploy      Production Deploy
     (unique URL per PR)  doctorformassist.com
```

**Branch strategy:**

| Branch    | Triggers                  | Deploys to            |
|-----------|---------------------------|-----------------------|
| `main`    | Full pipeline on push     | Production            |
| `develop` | Quality + Tests only      | —                     |
| `feat/*`  | Quality + Tests on PR     | Preview URL           |
| Any PR    | Full pipeline             | Preview URL           |

**Automated dependency updates:**
Dependabot creates weekly PRs for outdated npm packages and GitHub Actions. Each PR goes through the full CI pipeline before it can be merged.

---

## Security

- **No backend** — zero server attack surface
- **No data upload** — all PDF/ZIP generation happens in the user's browser
- **CSP headers** enforced via `public/_headers` (blocks XSS, clickjacking)
- **Dependabot** watches for vulnerability patches weekly
- **TypeScript strict mode** catches type errors at compile time, not runtime
- **ESLint** with `no-explicit-any` rule — prevents unsafe type coercions

---

## Contributing

### Branch naming

```
feat/short-description     # new feature
fix/short-description      # bug fix
chore/short-description    # tooling, deps
docs/short-description     # documentation only
```

### Commit messages (Conventional Commits)

```
feat: add patient ID field to form
fix: correct filename sanitization for special characters
chore: update jspdf to 2.5.2
docs: add custom domain setup steps
test: add e2e test for multi-patient download
```

### Pull request checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes with ≥80% coverage
- [ ] `npm run test:e2e` passes locally
- [ ] New features have unit tests
- [ ] Accessibility: new UI elements have proper labels

---

## License

MIT — free to use, modify, and distribute.
