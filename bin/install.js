#!/usr/bin/env node

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const PACKAGE_NAME = "tekole-theme-generator"
const COMMANDS = new Set(["install", "update", "status", "uninstall"])
const AGENTS = new Set(["codex", "claude", "generic", "all"])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

const sourcePaths = {
  codex: path.join(rootDir, "skill", PACKAGE_NAME),
  generic: path.join(rootDir, "skill", PACKAGE_NAME),
  claude: path.join(rootDir, "skill", PACKAGE_NAME),
}

function parseArgs(argv) {
  const args = [...argv]
  let command = "install"
  if (args[0] && COMMANDS.has(args[0])) command = args.shift()

  const options = {
    agent: "all",
    target: undefined,
    force: false,
    dryRun: false,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--agent") {
      options.agent = args[++i]
    } else if (arg.startsWith("--agent=")) {
      options.agent = arg.slice("--agent=".length)
    } else if (arg === "--target") {
      options.target = args[++i]
    } else if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length)
    } else if (arg === "--force" || arg === "-f") {
      options.force = true
    } else if (arg === "--dry-run") {
      options.dryRun = true
    } else if (arg === "--help" || arg === "-h") {
      options.help = true
    } else {
      fail(`Unknown argument: ${arg}`)
    }
  }

  if (!AGENTS.has(options.agent)) {
    fail(`Invalid --agent "${options.agent}". Use codex, claude, generic, or all.`)
  }

  return { command, options }
}

function selectedAgents(agent) {
  if (agent === "all") return ["codex", "claude"]
  return [agent]
}

function defaultHome(agent) {
  if (agent === "codex") {
    return process.env.CODEX_HOME || path.join(os.homedir(), ".codex")
  }
  if (agent === "claude") {
    return process.env.CLAUDE_HOME || path.join(os.homedir(), ".claude")
  }
  return process.env.AGENTS_HOME || path.join(os.homedir(), ".agents")
}

function targetHome(agent, options, agents) {
  if (!options.target) return defaultHome(agent)
  const target = path.resolve(options.target)
  return agents.length > 1 ? path.join(target, agent) : target
}

function targetPath(agent, options, agents) {
  const home = targetHome(agent, options, agents)
  return path.join(home, "skills", PACKAGE_NAME)
}

function validateSource(agent) {
  const source = sourcePaths[agent]
  if (!fs.existsSync(source)) fail(`Missing installer source: ${source}`)
  if (!fs.existsSync(path.join(source, "SKILL.md"))) {
    fail(`Missing SKILL.md in source: ${source}`)
  }
}

function validateDeleteTarget(target) {
  const normalized = path.normalize(target)
  const base = path.basename(normalized)
  if (base !== PACKAGE_NAME) {
    fail(`Refusing to delete unexpected path: ${target}`)
  }
}

function copySource(agent, source, target, dryRun) {
  log(`Install ${agent}: ${source} -> ${target}`)
  if (dryRun) return
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.cpSync(source, target, { recursive: true })
}


function installOne(agent, command, options, agents) {
  validateSource(agent)
  const source = sourcePaths[agent]
  const target = targetPath(agent, options, agents)
  const exists = fs.existsSync(target)

  if (command === "update") {
    if (!exists) {
      log(`Skip ${agent}: not installed at ${target}`)
      return
    }
  } else {
    if (exists && !options.force) {
      log(`Skip ${agent}: already installed at ${target}`)
      log(`Use "update" or "--force" to overwrite.`)
      return
    }
  }

  copySource(agent, source, target, options.dryRun)
}

function uninstallOne(agent, options, agents) {
  const target = targetPath(agent, options, agents)
  validateDeleteTarget(target)
  if (!fs.existsSync(target)) {
    log(`Not installed for ${agent}: ${target}`)
    return
  }
  log(`Uninstall ${agent}: ${target}`)
  if (!options.dryRun) fs.rmSync(target, { recursive: true, force: true })
}

function statusOne(agent, options, agents) {
  const target = targetPath(agent, options, agents)
  const installed = fs.existsSync(target)
  log(`${agent}: ${installed ? "installed" : "not installed"} - ${target}`)
}

function showHelp() {
  console.log(`Tekole Theme Generator Skill Installer

Usage:
  npx github:USERNAME/tekole-theme-generator install [--agent codex|claude|generic|all]
  npx github:USERNAME/tekole-theme-generator update [--agent codex|claude|generic|all]
  npx github:USERNAME/tekole-theme-generator status [--agent codex|claude|generic|all]
  npx github:USERNAME/tekole-theme-generator uninstall [--agent codex|claude|generic|all]

Options:
  --agent <name>   Target agent: codex, claude, generic, or all. Default: all
  --target <dir>   Custom agent home directory for testing or custom installs
  --force          Overwrite during install
  --dry-run        Print actions without changing files
  --help           Show this help

Default install paths (--agent all installs codex + claude only):
  Codex:   $CODEX_HOME/skills/tekole-theme-generator or ~/.codex/skills/tekole-theme-generator
  Claude:  $CLAUDE_HOME/skills/tekole-theme-generator/ or ~/.claude/skills/tekole-theme-generator/
  Generic: $AGENTS_HOME/skills/tekole-theme-generator or ~/.agents/skills/tekole-theme-generator
           (excluded from "all" to prevent duplicate skill listings — use --agent generic explicitly)
`)
}

function log(message) {
  console.log(message)
}

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function main() {
  const { command, options } = parseArgs(process.argv.slice(2))
  if (options.help) {
    showHelp()
    return
  }

  const agents = selectedAgents(options.agent)
  if (options.dryRun) log("Dry run enabled. No files will be changed.")

  for (const agent of agents) {
    if (command === "status") statusOne(agent, options, agents)
    else if (command === "uninstall") uninstallOne(agent, options, agents)
    else installOne(agent, command, options, agents)
  }

  if (command === "install" || command === "update") {
    log("")
    log("Done. Restart your agent/Codex/Claude session so it can reload skills.")
    log('Example prompt: "Gunakan tekole-theme-generator untuk buat tema wedding garden untuk bulk import."')
  }
}

main()
