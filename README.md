# Tekole Theme Generator Skill

Portable installer for the Tekole/Bahagiaku theme generator skill.

The skill helps AI agents generate, repair, validate, and explain theme JSON for admin `/bulk-import`.

## Install

Install to Codex, Claude, and generic agent skill folders:

```bash
npx github:USERNAME/tekole-theme-generator install
```

Replace `USERNAME` with the GitHub username or organization that hosts this repository.

After install, restart your Codex/Claude/agent session so it reloads skills.

## Install One Agent

Codex only:

```bash
npx github:USERNAME/tekole-theme-generator install --agent codex
```

Claude only:

```bash
npx github:USERNAME/tekole-theme-generator install --agent claude
```

Generic agent folder only:

```bash
npx github:USERNAME/tekole-theme-generator install --agent generic
```

## Update

```bash
npx github:USERNAME/tekole-theme-generator update
```

The installer creates a timestamped backup before overwriting an existing install.

## Check Status

```bash
npx github:USERNAME/tekole-theme-generator status
```

## Uninstall

```bash
npx github:USERNAME/tekole-theme-generator uninstall
```

## Default Install Paths

Codex:

```text
$CODEX_HOME/skills/tekole-theme-generator
```

Fallback:

```text
~/.codex/skills/tekole-theme-generator
```

Claude:

```text
$CLAUDE_HOME/skills/tekole-theme-generator.md
```

Fallback:

```text
~/.claude/skills/tekole-theme-generator.md
```

Generic agents:

```text
$AGENTS_HOME/skills/tekole-theme-generator
```

Fallback:

```text
~/.agents/skills/tekole-theme-generator
```

## Usage Prompt

After installing and restarting your agent, use a prompt like:

```text
Gunakan tekole-theme-generator untuk buat tema wedding garden untuk bulk import.
```

or:

```text
Pakai skill tekole-theme-generator untuk validasi JSON tema ini.
```

## Requirements

- Node.js installed.
- Internet access for `npx github:...` installation.
- A target AI agent that can read skills from its local skills folder.

The installer uses only Node.js built-in modules and is intended to work on Windows, macOS, and Linux.
