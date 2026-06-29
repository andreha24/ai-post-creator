---
name: create-pr
description: >-
  Generate the complete text of a GitHub pull request — a Conventional-Commits
  title plus a full description — ready to copy and paste, without pushing the
  branch, running gh, committing, or creating anything on the remote. Use this
  whenever the user wants to create or open a PR, raise/submit a pull request,
  draft PR text, write up a branch for review, or "put this up for review" —
  even if they don't say the exact words "pull request." Trigger on phrases like
  "open a PR," "create a PR," "write the PR for this branch," "draft the PR
  text," "PR description for this branch," or "submit this for review." This
  skill only reads git state and produces text; it delegates the body to the
  pr-description skill.
---

# Create PR (text)

Turn the work on the current branch into copy-paste-ready pull-request text: a one-line title and a full description, derived from what actually changed since the base branch. The deliverable is the text in the conversation — the user takes it from here and opens the PR themselves.

This skill never touches the remote. It doesn't push, commit, run `gh`, or build a URL — it only reads git state to understand the diff, then writes. That separation is the point: the user wants to review and place the text by hand, not have a PR created for them.

## Workflow

Work through these in order. Don't narrate each step — gather what you need, then present the finished text.

### 1. Pick the base branch

The base is the branch you'd merge *into*; you need it to compute the diff the title and body describe. Detect the repo's default branch with `git symbolic-ref --short refs/remotes/origin/HEAD` (gives e.g. `origin/main` — strip the `origin/`). If that fails, fall back to `main`. Honor an explicit base if the user names one. If you genuinely can't determine it and the user didn't say, ask rather than guessing — describing a diff against the wrong base produces a wrong description.

Also check the current branch with `git branch --show-current`. If it *is* the base (e.g. you're sitting on `main`), there's nothing to compare and nothing to describe — say so and ask which branch or commit range to write up, instead of producing an empty PR description.

### 2. Read what changed

Look at both the commit list and the diff since the base:

```
git log <base>..HEAD --oneline
git diff <base>...HEAD
```

This is the raw material for the title and body. Note that this range only covers *committed* work. If `git status --porcelain` shows uncommitted changes that belong in the PR, they won't appear in the diff — flag that to the user (they may want to commit first) rather than silently writing a description that omits them.

### 3. Write the title

A single line summarizing the whole branch, in the same Conventional Commits style as the commits (e.g. `feat(auth): add Twitter OAuth login`). Derive it from the commits and the diff, not from the branch name verbatim — the branch name is often a shorthand, while the title should read as a clear summary of the change.

### 4. Write the body

Generate the body with the **pr-description** skill, so the format stays consistent with the rest of the team's PRs (its `## What / ## Why / ## Changes / ## Testing` structure). Keeping a single source of truth for the body format is why this skill delegates rather than reinventing the sections.

### 5. Present the text

Output the title and body together as plain text the user can drop straight into GitHub's new-PR form. The whole deliverable is this text — so make it easy to copy in one go. Put the title on its own line and the body right below it; a single fenced block around the lot keeps the markdown verbatim (so the `##` headers paste as headers, not as rendered text).

Don't write it to a temp file, don't run any git or `gh` command, and don't assemble a compare URL. If, after seeing the text, the user wants the branch actually pushed and the PR opened, that's a separate step they can ask for.

## Guardrails

- **Text only, no side effects.** This skill reads git state and writes text — nothing else. Never push, commit, run `gh`, or open a URL, even as a convenience. The user chose a text-only flow on purpose.
- **Don't invent a base.** If the default branch can't be detected and the user didn't specify one, ask.
- **Don't describe work that isn't there.** Flag an empty range or uncommitted changes instead of producing a description that's misleading about what the PR contains.

## Example

User on branch `feat/social-auth`: *"write the PR for this branch."*

1. Base = `main` (detected via `origin/HEAD`). Current branch is `feat/social-auth` — good, there's a diff to describe.
2. `git log main..HEAD --oneline` and `git diff main...HEAD` to see the change.
3. Title: `feat(auth): add social login buttons`.
4. Body via the pr-description skill.
5. Present it as one copyable block:

````
feat(auth): add social login buttons

## What
Add Google and Twitter login buttons to the sign-in screen.

## Why
Users asked for one-click sign-in; password-only onboarding was dropping off.

## Changes
- New `SocialAuthButtons` component wired into the login form
- OAuth callback routes for Google and Twitter
- DB migration adding `provider` and `provider_id` to `users`

## Testing
`npm test`, then sign in with each provider locally and confirm a user row is created.
````

Then: "That's the full PR text — copy it into GitHub's new-PR form. Want me to push the branch and open the PR for you too?"
