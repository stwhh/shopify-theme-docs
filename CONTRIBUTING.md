# Maintaining merchant documentation

Documentation source of truth is **this `.docs/` folder** in the private theme repository. GitHub Actions builds HonKit and pushes HTML to the public `shopify-theme-docs` repository (`gh-pages` branch).

## Local preview

```bash
cd .docs
npm install
npm run serve
```

Open **http://127.0.0.1:8766** (default). On Windows, HonKit’s built-in `serve` may fail with `EACCES` — use `npm run serve:local` instead of `serve`.

Change port: `DOCS_PORT=9000 npm run serve` (PowerShell: `$env:DOCS_PORT=9000; npm run serve`).

## Add a new page

1. Create a Markdown file (e.g. `sections/new-section.md`).
2. Add a link in **`SUMMARY.md`** (sidebar navigation).
3. Preview with `npm run serve`.
4. Commit and push to `main` on the **theme repo** — workflow **Deploy docs to public repository** publishes automatically.

## Publish flow

```text
Edit .docs/*.md  →  push theme repo  →  Actions builds _book/  →  push to public repo gh-pages  →  GitHub Pages
```

Requires (theme repo → Settings → Secrets and variables → Actions):

| Name | Type | Example |
|------|------|---------|
| `DOCS_DEPLOY_TOKEN` | Secret | **Personal Access Token** with push to public docs repo (see below) |
| `DOCS_PUBLIC_REPOSITORY` | Variable | `your-username/shopify-theme-docs` |
| `FORMINIT_FORM_ID` | Secret (optional) | Forminit form ID for the public support contact form |

### Support contact form (Forminit)

1. Create a form at [Forminit](https://forminit.com/) (formerly Getform.io).
2. In form **Settings**, set authentication to **Public**.
3. Copy your **Form ID** from the dashboard.
4. Set `form_id` in `.docs/forminit.config.json` locally, or `FORMINIT_FORM_ID` in GitHub Actions secrets for deploys.
5. Enable **email notifications** in Forminit so you receive submissions.
6. Field names in `support/contact.md.template` use Forminit conventions (`fi-sender-email`, `fi-text-message`, `fi-file-screenshot`, etc.). File uploads require **Pro** ($19/mo); autoresponder emails require **Business** ($49/mo). The docs page shows an on-screen thank-you message after submit (free).
7. `npm run build` runs `scripts/build-contact-page.mjs` to generate `support/contact.md` from `contact.md.template`.

### Create `DOCS_DEPLOY_TOKEN`

Cross-repo push **cannot** use the default `GITHUB_TOKEN`. Create a PAT:

**Fine-grained (recommended):** GitHub → Settings → Developer settings → Personal access tokens → Fine-grained → select only the **public docs repo** → Permissions → **Contents: Read and write**.

**Classic:** scope **`repo`** (or minimal access to that public repo).

Add the token as secret **`DOCS_DEPLOY_TOKEN`** on the **private theme repo** (Settings → Secrets and variables → Actions).

Public repo Pages: **Settings → Pages → Deploy from branch `gh-pages` / root**.

## GitBook.com (optional)

`.gitbook.yaml` and `SUMMARY.md` are compatible with [GitBook.com](https://www.gitbook.com/) if you connect the theme repo later.

## Developer-only docs (not in HonKit)

[SECTION_COLORS.md](../SECTION_COLORS.md) — section color system implementation (repo root, not published to merchant docs).
