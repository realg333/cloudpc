# Checkpoint / Sleep / Resume System

Safe pause and resume for development sessions. Zero context loss between sessions.

---

## Quick Start

### Pause (end of work session)

```powershell
.\sleep.ps1
```

Optional: push to remote before closing:

```powershell
.\sleep.ps1 -Push
```

### Resume (next day / new chat)

1. Open Cursor and start a **new chat**.
2. Open `.checkpoint/RESUME_PROMPT.md`.
3. Copy its full contents.
4. Paste into the chat and send.
5. The AI loads context from `.checkpoint/HANDOFF.md` and continues work.

---

## Commands

| Command | Purpose |
|---------|---------|
| `.\sleep.ps1` | Checkpoint with message "checkpoint before sleep" |
| `.\sleep.ps1 -Push` | Same + `git push` |
| `.\checkpoint.ps1` | Checkpoint with default message "checkpoint" |
| `.\checkpoint.ps1 -Message "your message"` | Custom commit message |
| `.\checkpoint.ps1 -Message "wip" -Push` | Custom message + push |

---

## What Gets Created

- **`.checkpoint/HANDOFF.md`** — Snapshot with timestamp, git state (branch, commit, status, diff), project progress, and session notes.
- **`.checkpoint/RESUME_PROMPT.md`** — Reusable prompt to paste into a new chat for resuming.

---

## Workflow

### How to pause safely

1. Finish or pause your current task at a sensible point.
2. Run `.\sleep.ps1` (or `.\sleep.ps1 -Push` if you use a remote).
3. Confirm the script reports success.
4. Close Cursor or start a new chat later.

### How to resume safely

1. Open the project in Cursor.
2. Start a **new chat** (fresh context).
3. Copy `.checkpoint/RESUME_PROMPT.md` and paste into the chat.
4. Send. The AI will read HANDOFF.md and project files, then continue from "Next up" or ask what to focus on.

### When to run checkpoint

- End of day / end of work session
- Before switching to another project
- Before a long break
- After completing a meaningful chunk of work

---

## Notes

- **Git optional:** If git is not installed or the folder is not a repo, the script still creates HANDOFF.md and RESUME_PROMPT.md. No commit is made.
- **Session notes:** Edit `.checkpoint/HANDOFF.md` before closing if you want to add notes about decisions, blockers, or next steps.
- **No architecture changes:** The system only adds tooling. It does not modify project structure or business logic.
