---
name: conventional-commits
description: >-
  Write and create git commits that follow the Conventional Commits
  specification (type(scope): description), and optionally push them to the
  remote once the user approves. Use this skill whenever the user asks to commit
  changes, make a commit, save their work to git, write a commit message, or
  commit and push — even if they don't say the words "conventional commit." Also
  use it when the user wants help wording a commit, splitting work into commits,
  or fixing up a vague commit message. Trigger on phrases like "commit this,"
  "commit my changes," "commit and push," "let's commit," "git commit," or
  "write a commit message."
---

# Conventional Commits

Turn a set of code changes into one or more well-formed Conventional Commits, then create them.

A good commit message answers two questions for the next person (often future-you): *what kind of change is this, and what does it do?* The Conventional Commits format encodes the first answer in a machine-readable prefix so tooling (changelogs, semantic-version bumps, release notes) can read it, and leaves the rest in plain language for humans. That dual audience is the whole point — keep both happy.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

- **type** — the *category* of change (see the table below). Required, lowercase.
- **scope** — *what area* of the codebase changed, in parentheses. Optional but encouraged here. Infer it from the changed paths (see "Choosing a scope").
- **description** — a concise summary in the **imperative mood** ("add", "fix", "remove" — as if completing the sentence "this commit will…"). Lowercase first letter, no trailing period, aim for ≤ 72 characters.
- **body** — *why* and any non-obvious *what*, when the subject alone isn't enough. Wrap at ~72 chars. Separate from the subject with a blank line.
- **footer** — breaking-change notes and references (issues, Trello cards). Separate with a blank line.

## Workflow

When the user asks you to commit, work through these steps. Don't narrate every step — just do them and report the result.

1. **Look at what actually changed.** Run `git status` and `git diff` (and `git diff --staged` if anything is already staged). Read the diff — the commit message should describe what the code does, not what the user said they were doing. The diff is ground truth.

2. **Decide if it's one commit or several.** If the changes form a single coherent unit of work, it's one commit. If you see clearly unrelated changes mixed together (e.g. a bug fix *and* an unrelated dependency bump *and* a docs tweak), that's a signal to split — propose splitting into separate commits and use `git add <path>` to stage each group. Don't force unrelated changes under one vague message; don't over-split tightly coupled changes either. When in doubt, lean toward one commit unless the seams are obvious.

3. **Pick the type** from the table below, based on the dominant intent of the change.

4. **Pick the scope** by inferring it from the changed paths (see "Choosing a scope"). Omit it rather than invent a noisy one.

5. **Write the subject line** in the imperative mood, describing the effect of the change.

6. **Add a body only when it earns its place** — when the *why* isn't obvious, when there are several distinct sub-changes worth listing as bullets, or when there's a breaking change or issue reference to record. For a small, self-explanatory change, a clean subject line is better than padding it with a body.

7. **Stage and commit.** Stage the relevant files (`git add`) and create the commit. Then show the user the final message and confirm it landed (`git log -1 --stat` or report the short hash).

8. **Offer to push — but only with the user's go-ahead.** A local commit is cheap to amend or undo; pushing publishes the work to the shared remote, where rewriting it disrupts anyone who already pulled. So treat pushing as a separate, deliberate step. After the commit lands, ask whether to push (e.g. *"Committed locally — want me to push to origin?"*) and push only once the user says yes. If their original request already asked to "commit and push," that **is** the approval — go straight to pushing, no second prompt needed. Push the branch you committed on with `git push`; if it has no upstream yet, set one with `git push -u origin <branch>`. Never push to the default branch directly, and never `--force` unless the user explicitly asks.

### Guardrails

- **Only commit when asked.** This skill is for when the user wants a commit. Don't commit proactively after making edits unless they've told you to.
- **Don't commit straight to the default branch.** If `git branch --show-current` reports `main`/`master`, create a topic branch first (named after the change, e.g. `feat/twitter-auth`) and commit there — unless the user explicitly wants the commit on the default branch.
- **Respect any required trailer.** If the harness or repo convention requires a trailer (for example, Claude Code appends a `Co-Authored-By:` line), include it in the footer.
- **Never use `--no-verify`** to skip hooks unless the user explicitly asks. If a pre-commit hook fails, fix the underlying issue or report it — don't bypass it.
- **Pushing is opt-in (step 8).** Never push without the user's approval — an explicit "commit and push" request counts as approval. Push only the branch you committed on, never `--force` unless asked, and report what was pushed and to where.

## Type reference

| Type       | Use it for                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| `feat`     | A new feature or capability for users.                                     |
| `fix`      | A bug fix.                                                                 |
| `docs`     | Documentation only (README, comments, ADRs).                              |
| `style`    | Formatting that doesn't change behavior (whitespace, semicolons, linting). |
| `refactor` | Code change that neither fixes a bug nor adds a feature.                   |
| `perf`     | A change that improves performance.                                        |
| `test`     | Adding or correcting tests.                                                |
| `build`    | Build system or dependencies (npm packages, Dockerfile, bundler config).   |
| `ci`       | CI configuration and scripts (GitHub Actions, pipelines).                  |
| `chore`    | Maintenance that doesn't touch src or tests (tooling, configs, `.gitignore`). |
| `revert`   | Reverts a previous commit.                                                  |

If a change spans types, pick the one that matches its **primary purpose**. A feature that happens to include a few tests is still `feat`. A pure test-coverage commit is `test`.

## Choosing a scope

Infer the scope from where the changes live. The scope should name a recognizable area of the project — a feature, module, or layer — not a file name. Examples of how paths map to scopes:

- `backend/src/auth/**`, an OAuth strategy → `auth`
- `docker-compose.yml`, `**/Dockerfile`, `.dockerignore` → `docker`
- `frontend/src/components/**` → `ui` (or the component family, e.g. `social-buttons`)
- a database migration or schema change → `db`
- `package.json` / lockfile dependency changes → `deps`
- `.github/workflows/**` → `ci`

If the change touches several areas with no single dominant one, it's usually a sign the commit should be split (step 2). If it genuinely spans the whole repo (e.g. a global rename), omit the scope rather than listing everything.

## Breaking changes

Signal a breaking change in **both** machine- and human-readable ways:

- Append `!` after the type/scope: `feat(api)!: ...`
- Add a `BREAKING CHANGE:` footer explaining what broke and how to migrate.

```
feat(api)!: require auth token on all /posts endpoints

BREAKING CHANGE: requests to /posts without a Bearer token now return 401.
Clients must attach the token issued by /auth/login.
```

## Examples

**A focused feature — subject line is enough:**
```
feat(auth): add Twitter OAuth login
```

**A bug fix referencing a ticket:**
```
fix(posts): prevent duplicate publish on double-click

Disable the publish button while the request is in flight so a fast
second click can't create a second post.

Refs: #214
```

**Infrastructure work with several related parts — bullets earn their place:**
```
build(docker): containerize backend and frontend

- add multi-stage Dockerfiles for both services
- add docker-compose for local orchestration
- ignore node_modules and build output via .dockerignore
```

**Splitting mixed changes** — if a working tree contains an auth feature *and* an unrelated README fix, make two commits:
```
feat(auth): add Twitter OAuth login
docs: document required Twitter env vars
```

## Anti-patterns to avoid

- Past tense or noun-only subjects: `feat(auth): added login` / `feat(auth): login changes`. Use the imperative: `add Twitter OAuth login`.
- Vague descriptions: `fix: bug`, `chore: stuff`, `update code`. Say what changed.
- A body that just restates the subject in a full sentence. If there's nothing new to add, leave it off.
- Cramming unrelated changes under one type because it's faster than splitting.
