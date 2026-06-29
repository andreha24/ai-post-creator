---
name: create-pr
description: >-
  Push the current branch and open a GitHub pull request for it, end to end.
  Use this skill whenever the user wants to create or open a PR, raise/submit a
  pull request, push their branch and open a PR, or "put this up for review" —
  even if they don't say the exact words "pull request." Trigger on phrases like
  "open a PR," "create a PR," "make a pull request for this branch," "push and
  open a PR," "submit this for review," or "raise a PR against main." This skill
  handles the git push and PR creation; it delegates the PR body to the
  pr-description skill.
---

# Create PR

Take the work on the current branch and turn it into an open pull request: make sure it's committed, push it, write a good title and body, and create the PR — falling back gracefully when the GitHub CLI isn't available.

The goal is to get the user from "my changes are done" to "here's the PR link" in one move, without them having to remember the push incantation, hand-write the description, or click through GitHub's new-PR form. Two things make this reliable across machines: not assuming `gh` is installed, and reusing the team's existing PR-description format instead of inventing a new one each time.

## Workflow

Work through these in order. Don't narrate each step — do the work and report the result (the PR URL) at the end.

### 1. Make sure the work is on a topic branch

Run `git branch --show-current`. If it reports the default branch (`main` or `master`), you can't open a PR from it — there'd be nothing to compare. Create a topic branch first, named after the change (e.g. `feat/twitter-auth`), move the commits onto it, and continue from there. If the user explicitly wants to PR the default branch, surface the problem instead of guessing.

### 2. Make sure everything is committed

Run `git status --porcelain`. If there are uncommitted changes, commit them first by following the **conventional-commits** skill — a PR should contain the work the user means to propose, and leaving changes behind on disk is a silent way to ship an incomplete PR. Once the tree is clean, move on.

### 3. Determine the base branch and repo

- **Base branch**: the branch you're merging *into*. Default to the repo's default branch — detect it with `git symbolic-ref --short refs/remotes/origin/HEAD` (gives e.g. `origin/main`; strip the `origin/`). If that fails, fall back to `main`. Honor an explicit base if the user names one.
- **Remote URL**: `git remote get-url origin`. You'll need it for the fallback URL. Both SSH (`git@github.com:owner/repo.git`) and HTTPS (`https://github.com/owner/repo.git`) forms are fine — the bundled script parses either.

### 4. Push the branch

If the branch has no upstream yet, set it: `git push -u origin <branch>`. If it already tracks a remote branch, a plain `git push` is enough. Push before creating the PR — GitHub needs the commits to exist on the remote.

### 5. Write the title and body

- **Title**: a single line summarizing the whole branch, in the same Conventional Commits style as the commits (e.g. `feat(auth): add Twitter OAuth login`). Derive it from the commits and diff since the base (`git log <base>..HEAD --oneline`, `git diff <base>...HEAD`), not from the branch name verbatim.
- **Body**: generate it with the **pr-description** skill so the format stays consistent with the rest of the team's PRs (its `## What / ## Why / ## Changes / ## Testing` structure). Write the finished body to a temp file — routing multi-line text through a file avoids shell-quoting pain when you pass it to `gh`.

### 6. Create the PR

**If `gh` is installed** (check with `gh --version`), create it directly:

```bash
gh pr create --base <base> --head <branch> --title "<title>" --body-file <body-file>
```

Open it ready for review by default; add `--draft` only if the user asked for a draft. `gh` prints the PR URL — report it.

**If `gh` is not installed**, fall back to a prefilled compare URL the user clicks to finish in the browser. The shape is:

```
https://github.com/<owner>/<repo>/compare/<base>...<head>?expand=1&title=<url-encoded title>
```

Get `<owner>/<repo>` from `git remote get-url origin` (strip a trailing `.git`; works for both `git@github.com:owner/repo.git` and `https://github.com/owner/repo.git`). The title must be URL-encoded — `node` is available, so the reliable way is a one-liner:

```bash
node -p "encodeURIComponent('<title>')"
```

Assemble the URL with that encoded title and give it to the user — it opens GitHub's PR form with the title prefilled. GitHub's compare URL *can* also prefill the body via `&body=<url-encoded body>`, but bodies are often long enough to make the URL flaky, so the dependable move is to also paste the finished body into the conversation for them to drop into the form. (The compare flow always opens a normal, non-draft PR — there's no draft query param — so mention that if they wanted a draft.)

### 7. Report

Tell the user what happened in one or two lines: the branch you pushed, the base it targets, and the PR URL (or the compare URL to click). That link is the whole point of the skill — make it the headline, not a footnote.

## Guardrails

- **Only push and create when asked.** This skill is the ask — but don't also push unrelated branches or force-push. A normal `git push` only; never `--force` unless the user explicitly requests it.
- **Don't skip hooks.** No `--no-verify` on the commit/push steps unless the user says so. If a pre-push hook fails, report it rather than bypassing.
- **Don't invent a base.** If the default branch can't be detected and the user didn't specify one, ask rather than assuming `main` is correct for an unusual repo.
- **Respect required commit trailers** when committing in step 2 (the conventional-commits skill handles this).

## Example

User: *"ok push this and open a PR"* on branch `feat/social-auth` with a clean tree, `gh` not installed.

1. On a topic branch, tree clean → skip commit step.
2. Base = `main`, remote = `git@github.com:andreha24/ai-post-creator.git`.
3. `git push -u origin feat/social-auth`.
4. Title: `feat(auth): add social login buttons`. Body via pr-description → temp file.
5. No `gh` → encode the title (`node -p "encodeURIComponent('feat(auth): add social login buttons')"`) and assemble
   `https://github.com/andreha24/ai-post-creator/compare/main...feat/social-auth?expand=1&title=feat%28auth%29%3A%20add%20social%20login%20buttons`
6. Report: "Pushed `feat/social-auth` → base `main`. Open the PR here: <url> (title is prefilled)." — and paste the body for them to drop into the form.
