#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const EVENT_TYPES = new Set([
  "wedding",
  "engagement",
  "anniversary",
  "birthday",
  "aqiqah",
  "sunatan",
  "wisuda",
  "party",
])
const STATUSES = new Set(["draft", "published", "archived"])
const REQUIRED_BLOCKS = new Set(["hero", "events", "footer"])
const GENERAL_BLOCK_TYPES = [
  "hero",
  "events",
  "gallery",
  "maps",
  "rsvp",
  "donation",
  "gift",
  "video",
  "quotes",
  "countdown",
  "comment",
  "footer",
]
const ALLOWED_BLOCKS = {
  wedding: [...GENERAL_BLOCK_TYPES, "couple", "loveStory", "dresscode"],
  engagement: [...GENERAL_BLOCK_TYPES, "couple", "dresscode"],
  anniversary: [...GENERAL_BLOCK_TYPES, "couple", "loveStory"],
  birthday: [...GENERAL_BLOCK_TYPES, "celebrant", "dresscode"],
  aqiqah: [...GENERAL_BLOCK_TYPES, "celebrant", "dresscode"],
  sunatan: [...GENERAL_BLOCK_TYPES, "celebrant", "dresscode"],
  wisuda: [...GENERAL_BLOCK_TYPES, "celebrant"],
  party: [...GENERAL_BLOCK_TYPES, "host", "dresscode"],
}
const BLOCK_TYPES = new Set([
  "hero",
  "couple",
  "celebrant",
  "host",
  "loveStory",
  "events",
  "gallery",
  "maps",
  "rsvp",
  "donation",
  "gift",
  "video",
  "dresscode",
  "quotes",
  "countdown",
  "comment",
  "footer",
])
const VISIBILITIES = new Set(["always", "public_only", "guests_only"])
const SOSMED_PLATFORMS = new Set([
  "instagram",
  "tiktok",
  "twitter",
  "facebook",
  "youtube",
])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const LAT_LONG_RE = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/
const CSS_VALUE_RE = /^(auto|fit-content|-?\d+(?:\.\d+)?(?:px|rem|em|%|vw|vh)?)$/
const MEDIA_KEYS = new Set(["imageId", "backgroundImageId", "audioId"])
const PLACEHOLDER_RE = /^REPLACE_WITH_[A-Z0-9_]+$/

function main() {
  const args = process.argv.slice(2)
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    showHelp()
    process.exit(args.length === 0 ? 1 : 0)
  }

  const allowPlaceholders = args.includes("--allow-placeholders")
  const strictMedia = args.includes("--strict-media")
  const file = args.find((arg) => !arg.startsWith("-"))
  if (!file) fail("Missing theme JSON file path")

  const absolute = path.resolve(file)
  let parsed
  try {
    parsed = JSON.parse(fs.readFileSync(absolute, "utf8"))
  } catch (error) {
    fail(`Invalid JSON: ${error.message}`)
  }

  const errors = []
  const warnings = []
  const themes = Array.isArray(parsed) ? parsed : [parsed]

  if (Array.isArray(parsed) && (parsed.length < 1 || parsed.length > 50)) {
    errors.push("$: array length must be 1-50")
  }
  if (!Array.isArray(parsed) && !isObject(parsed)) {
    errors.push("$: must be one theme object or array of theme objects")
  }

  themes.forEach((theme, index) => {
    validateTheme(theme, Array.isArray(parsed) ? `$[${index}]` : "$", {
      errors,
      warnings,
      allowPlaceholders,
      strictMedia,
    })
  })

  if (warnings.length > 0) {
    console.error("Warnings:")
    warnings.forEach((warning) => console.error(`- ${warning}`))
  }
  if (errors.length > 0) {
    console.error("Errors:")
    errors.forEach((error) => console.error(`- ${error}`))
    process.exit(1)
  }

  console.log(`OK: ${themes.length} theme(s) valid`)
}

function validateTheme(theme, pathName, ctx) {
  if (!isObject(theme)) return error(ctx, pathName, "must be an object")

  for (const key of ["id", "createdBy", "createdAt", "updatedAt"]) {
    if (key in theme) error(ctx, `${pathName}.${key}`, "DB-managed theme field is not allowed")
  }

  requireString(ctx, theme.name, `${pathName}.name`, { min: 1, max: 255 })
  if (!EVENT_TYPES.has(theme.type)) error(ctx, `${pathName}.type`, "invalid event type")
  if (theme.status !== undefined && !STATUSES.has(theme.status)) error(ctx, `${pathName}.status`, "invalid status")
  if (theme.thumbnailId !== undefined) validateUuid(ctx, theme.thumbnailId, `${pathName}.thumbnailId`, false)
  if (!Array.isArray(theme.ornaments)) error(ctx, `${pathName}.ornaments`, "must be an array")
  if (!Array.isArray(theme.blocks)) error(ctx, `${pathName}.blocks`, "must be an array")
  if (!isObject(theme.content)) error(ctx, `${pathName}.content`, "must be an object")

  if (theme.styles !== undefined) validateStyles(theme.styles, `${pathName}.styles`, ctx)
  if (theme.openingConfig !== undefined) validateOpening(theme.openingConfig, `${pathName}.openingConfig`, ctx)
  if (theme.navigationConfig !== undefined) validateNavigation(theme.navigationConfig, `${pathName}.navigationConfig`, theme.blocks, ctx)
  if (theme.sound !== undefined) validateSound(theme.sound, `${pathName}.sound`, ctx)

  validateOrnaments(theme.ornaments, `${pathName}.ornaments`, ctx)
  validateBlocks(theme.blocks, theme.type, `${pathName}.blocks`, ctx)
  validateContent(theme.content, theme.type, theme.blocks, `${pathName}.content`, ctx)
  validateMediaRefsDeep(theme, pathName, ctx)
}

function validateStyles(styles, pathName, ctx) {
  if (!isObject(styles)) return error(ctx, pathName, "must be an object")
  const typography = styles.typography
  const colors = styles.colors
  const spacing = styles.spacing
  const button = styles.button
  if (!isObject(typography)) error(ctx, `${pathName}.typography`, "must be an object")
  else {
    requireString(ctx, typography.fontHeading, `${pathName}.typography.fontHeading`)
    requireString(ctx, typography.fontBody, `${pathName}.typography.fontBody`)
    if (typography.fontAccent !== undefined) requireString(ctx, typography.fontAccent, `${pathName}.typography.fontAccent`)
    requireNumber(ctx, typography.sizeBase, `${pathName}.typography.sizeBase`, { min: 0, exclusive: true })
    requireNumber(ctx, typography.scaleRatio, `${pathName}.typography.scaleRatio`, { min: 0, exclusive: true })
  }
  if (!isObject(colors)) error(ctx, `${pathName}.colors`, "must be an object")
  else for (const key of ["primary", "accent", "background", "surface", "text", "textMuted", "textInvert", "border"]) requireString(ctx, colors[key], `${pathName}.colors.${key}`)
  if (!isObject(spacing)) error(ctx, `${pathName}.spacing`, "must be an object")
  else requireNumber(ctx, spacing.base, `${pathName}.spacing.base`, { min: 0, exclusive: true })
  if (!isObject(button)) error(ctx, `${pathName}.button`, "must be an object")
  else {
    requireString(ctx, button.borderRadius, `${pathName}.button.borderRadius`)
    requireNumber(ctx, button.paddingX, `${pathName}.button.paddingX`, { min: 0 })
    requireNumber(ctx, button.paddingY, `${pathName}.button.paddingY`, { min: 0 })
    requireNumber(ctx, button.fontWeight, `${pathName}.button.fontWeight`, { min: 1 })
    requireNumber(ctx, button.letterSpacing, `${pathName}.button.letterSpacing`)
    expectEnum(ctx, button.textTransform, `${pathName}.button.textTransform`, ["none", "uppercase", "capitalize"])
    expectEnum(ctx, button.variant, `${pathName}.button.variant`, ["filled", "outline", "ghost"])
  }
  requireNumber(ctx, styles.borderRadius, `${pathName}.borderRadius`, { min: 0 })
}

function validateOpening(opening, pathName, ctx) {
  if (!isObject(opening)) return error(ctx, pathName, "must be an object")
  requireNumber(ctx, opening.overlayOpacity, `${pathName}.overlayOpacity`, { min: 0, max: 1 })
  requireString(ctx, opening.title, `${pathName}.title`)
  requireString(ctx, opening.buttonText, `${pathName}.buttonText`)
  requireBoolean(ctx, opening.invertText, `${pathName}.invertText`)
  if (!isObject(opening.animation)) error(ctx, `${pathName}.animation`, "must be an object")
}

function validateNavigation(nav, pathName, blocks, ctx) {
  if (!isObject(nav)) return error(ctx, pathName, "must be an object")
  requireBoolean(ctx, nav.isEnabled, `${pathName}.isEnabled`)
  expectEnum(ctx, nav.position, `${pathName}.position`, ["top", "bottom", "floating-bottom", "floating-side"])
  expectEnum(ctx, nav.style, `${pathName}.style`, ["bar", "dots", "hamburger"])
  if (!Array.isArray(nav.items)) return error(ctx, `${pathName}.items`, "must be an array")
  if (nav.isEnabled && nav.items.length === 0) error(ctx, `${pathName}.items`, "must not be empty when navigation is enabled")
  const blockIds = new Set(Array.isArray(blocks) ? blocks.map((block) => block?.id) : [])
  validateUniqueIds(nav.items, `${pathName}.items`, ctx)
  nav.items.forEach((item, index) => {
    if (!isObject(item)) return error(ctx, `${pathName}.items[${index}]`, "must be an object")
    validateId(ctx, item.id, `${pathName}.items[${index}].id`)
    requireString(ctx, item.label, `${pathName}.items[${index}].label`)
    validateId(ctx, item.targetBlockId, `${pathName}.items[${index}].targetBlockId`)
    if (!blockIds.has(item.targetBlockId)) error(ctx, `${pathName}.items[${index}].targetBlockId`, "must match an existing blocks[].id")
  })
}

function validateSound(sound, pathName, ctx) {
  if (!isObject(sound)) return error(ctx, pathName, "must be an object")
}

function validateOrnaments(ornaments, pathName, ctx) {
  if (!Array.isArray(ornaments)) return
  validateUniqueIds(ornaments, pathName, ctx)
  ornaments.forEach((ornament, index) => validateOrnament(ornament, `${pathName}[${index}]`, ctx))
}

function validateOrnament(ornament, pathName, ctx) {
  if (!isObject(ornament)) return error(ctx, pathName, "must be an object")
  validateId(ctx, ornament.id, `${pathName}.id`)
  requireBoolean(ctx, ornament.isVisible, `${pathName}.isVisible`)
  expectEnum(ctx, ornament.positionPreset, `${pathName}.positionPreset`, ["top-left", "top-center", "top-right", "left-center", "center", "right-center", "bottom-left", "bottom-center", "bottom-right"])
  validateCssValue(ctx, ornament.width, `${pathName}.width`)
  validateCssValue(ctx, ornament.height, `${pathName}.height`)
  expectEnum(ctx, ornament.zLayer, `${pathName}.zLayer`, ["above", "below"])
  if (ornament.opacity !== undefined) requireNumber(ctx, ornament.opacity, `${pathName}.opacity`, { min: 0, max: 1 })
  if (ornament.speed !== undefined) requireNumber(ctx, ornament.speed, `${pathName}.speed`, { min: 0 })
  if (ornament.delay !== undefined) requireNumber(ctx, ornament.delay, `${pathName}.delay`, { min: 0 })
}

function validateBlocks(blocks, eventType, pathName, ctx) {
  if (!Array.isArray(blocks)) return
  validateUniqueIds(blocks, pathName, ctx)
  const blockTypes = new Set(blocks.map((block) => block?.type))
  for (const required of REQUIRED_BLOCKS) if (!blockTypes.has(required)) error(ctx, pathName, `missing required block type "${required}"`)
  const allowed = new Set(ALLOWED_BLOCKS[eventType] ?? [])

  blocks.forEach((block, index) => {
    const blockPath = `${pathName}[${index}]`
    if (!isObject(block)) return error(ctx, blockPath, "must be an object")
    validateId(ctx, block.id, `${blockPath}.id`)
    if (!BLOCK_TYPES.has(block.type)) error(ctx, `${blockPath}.type`, "invalid block type")
    if (allowed.size && !allowed.has(block.type)) error(ctx, `${blockPath}.type`, `not allowed for event type "${eventType}"`)
    requireNumber(ctx, block.order, `${blockPath}.order`)
    requireBoolean(ctx, block.isVisible, `${blockPath}.isVisible`)
    if (!VISIBILITIES.has(block.visibility)) error(ctx, `${blockPath}.visibility`, "invalid visibility")
    if (!isObject(block.content)) error(ctx, `${blockPath}.content`, "must be an object")
    validateBlockContent(block, blockPath, ctx)
    if (block.ornaments !== undefined) validateOrnaments(block.ornaments, `${blockPath}.ornaments`, ctx)
    if (block.containerConfig !== undefined) validateContainer(block.containerConfig, `${blockPath}.containerConfig`, ctx)
  })
}

function validateBlockContent(block, blockPath, ctx) {
  const content = block.content
  const pathName = `${blockPath}.content`
  if (!isObject(content)) return
  if (block.type === "donation" && ("items" in content || "accounts" in content || "bankAccounts" in content)) error(ctx, pathName, "must not include payment account data")
  if (block.type === "gift" && ("items" in content || "gifts" in content)) error(ctx, pathName, "must not include gift item data")
  if (block.type === "loveStory") validateUniqueIds(content.items, `${pathName}.items`, ctx)
  if (block.type === "gallery") validateUniqueIds(content.items, `${pathName}.items`, ctx)
  if (block.type === "video") {
    validateUniqueIds(content.items, `${pathName}.items`, ctx)
    if (Array.isArray(content.items)) content.items.forEach((item, index) => {
      if (!isHttpUrl(item?.youtubeUrl) || !/(^|\/\/)(www\.)?(youtube\.com|youtu\.be)\//.test(item.youtubeUrl)) error(ctx, `${pathName}.items[${index}].youtubeUrl`, "must be a YouTube http(s) URL")
    })
  }
  if (block.type === "dresscode") {
    validateUniqueIds(content.colorPalette, `${pathName}.colorPalette`, ctx)
    if (Array.isArray(content.colorPalette)) content.colorPalette.forEach((item, index) => {
      if (typeof item?.colorHex !== "string" || !HEX_RE.test(item.colorHex)) error(ctx, `${pathName}.colorPalette[${index}].colorHex`, "must be a hex color")
    })
  }
}

function validateContainer(container, pathName, ctx) {
  if (!isObject(container)) return error(ctx, pathName, "must be an object")
  expectEnum(ctx, container.width, `${pathName}.width`, ["none", "xs", "sm", "md", "lg", "xl", "full"])
  requireNumber(ctx, container.paddingTop, `${pathName}.paddingTop`)
  requireNumber(ctx, container.paddingBottom, `${pathName}.paddingBottom`)
  requireNumber(ctx, container.paddingX, `${pathName}.paddingX`)
  requireNumber(ctx, container.backgroundOverlayOpacity, `${pathName}.backgroundOverlayOpacity`, { min: 0, max: 1 })
}

function validateContent(content, eventType, blocks, pathName, ctx) {
  if (!isObject(content)) return
  if (!Array.isArray(content.events) || content.events.length === 0) error(ctx, `${pathName}.events`, "must be a non-empty array")
  else {
    validateUniqueIds(content.events, `${pathName}.events`, ctx)
    content.events.forEach((event, index) => {
      const eventPath = `${pathName}.events[${index}]`
      if (!isObject(event)) return error(ctx, eventPath, "must be an object")
      validateId(ctx, event.id, `${eventPath}.id`)
      requireString(ctx, event.title, `${eventPath}.title`)
      validateDateTime(ctx, event.fromDate, `${eventPath}.fromDate`)
      validateDateTime(ctx, event.toDate, `${eventPath}.toDate`)
      requireBoolean(ctx, event.isPrimary, `${eventPath}.isPrimary`)
      if (event.useGlobalLocation === true && !content.globalLocation) error(ctx, eventPath, "useGlobalLocation requires content.globalLocation")
      if (event.location) validateLocation(event.location, `${eventPath}.location`, ctx)
    })
  }

  if (content.globalLocation) validateLocation(content.globalLocation, `${pathName}.globalLocation`, ctx)
  if (content.celebrant !== undefined && !Array.isArray(content.celebrant)) error(ctx, `${pathName}.celebrant`, "must be an array")
  if (Array.isArray(content.celebrant)) {
    validateUniqueIds(content.celebrant, `${pathName}.celebrant`, ctx)
    content.celebrant.forEach((person, index) => {
      if (person?.age !== undefined) error(ctx, `${pathName}.celebrant[${index}].age`, "unsupported; use birthDate")
      validateId(ctx, person?.id, `${pathName}.celebrant[${index}].id`)
      if (person?.birthDate !== undefined) validateDate(ctx, person.birthDate, `${pathName}.celebrant[${index}].birthDate`)
    })
  }
  if (content.host !== undefined && !Array.isArray(content.host)) error(ctx, `${pathName}.host`, "must be an array")
  if (Array.isArray(content.host)) validateUniqueIds(content.host, `${pathName}.host`, ctx)

  validateSosmedDeep(content, pathName, ctx)
  const eventIds = new Set(Array.isArray(content.events) ? content.events.map((event) => event?.id) : [])
  if (Array.isArray(blocks)) blocks.forEach((block, index) => {
    const contentPath = `blocks[${index}].content`
    if ((block?.type === "maps" || block?.type === "countdown") && !eventIds.has(block.content?.linkedEventId)) error(ctx, `${contentPath}.linkedEventId`, "must match content.events[].id")
  })

  const blockTypes = new Set(Array.isArray(blocks) ? blocks.map((block) => block?.type) : [])
  if (["wedding", "engagement", "anniversary"].includes(eventType) && blockTypes.has("couple") && !content.couple) warn(ctx, `${pathName}.couple`, "recommended when couple block is used")
  if (["birthday", "aqiqah", "sunatan", "wisuda"].includes(eventType) && blockTypes.has("celebrant") && !Array.isArray(content.celebrant)) error(ctx, `${pathName}.celebrant`, "required as array when celebrant block is used")
  if (eventType === "party" && blockTypes.has("host") && !Array.isArray(content.host)) error(ctx, `${pathName}.host`, "required as array when host block is used")
}

function validateLocation(location, pathName, ctx) {
  if (!isObject(location)) return error(ctx, pathName, "must be an object")
  if (location.latLong !== undefined) {
    if (typeof location.latLong !== "string" || !LAT_LONG_RE.test(location.latLong)) error(ctx, `${pathName}.latLong`, "must be 'lat,lng'")
    else {
      const [lat, lng] = location.latLong.split(",").map((value) => Number(value.trim()))
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) error(ctx, `${pathName}.latLong`, "latitude/longitude out of range")
    }
  }
}

function validateMediaRefsDeep(value, pathName, ctx) {
  if (Array.isArray(value)) return value.forEach((item, index) => validateMediaRefsDeep(item, `${pathName}[${index}]`, ctx))
  if (!isObject(value)) return
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${pathName}.${key}`
    if (MEDIA_KEYS.has(key)) validateMediaRef(ctx, child, childPath)
    validateMediaRefsDeep(child, childPath, ctx)
  }
}

function validateSosmedDeep(value, pathName, ctx) {
  if (Array.isArray(value)) return value.forEach((item, index) => validateSosmedDeep(item, `${pathName}[${index}]`, ctx))
  if (!isObject(value)) return
  if ("platform" in value && "url" in value) {
    if (!SOSMED_PLATFORMS.has(value.platform)) error(ctx, `${pathName}.platform`, "invalid social platform")
    if (!isHttpUrl(value.url)) error(ctx, `${pathName}.url`, "must be an absolute http(s) URL")
  }
  for (const [key, child] of Object.entries(value)) validateSosmedDeep(child, `${pathName}.${key}`, ctx)
}

function validateUniqueIds(items, pathName, ctx) {
  if (!Array.isArray(items)) return
  const seen = new Map()
  items.forEach((item, index) => {
    if (!isObject(item)) return
    if (typeof item.id !== "string") return
    if (seen.has(item.id)) error(ctx, `${pathName}[${index}].id`, `duplicate id also used at ${seen.get(item.id)}`)
    else seen.set(item.id, `${pathName}[${index}].id`)
  })
}

function validateMediaRef(ctx, value, pathName) {
  if (typeof value !== "string" || value.length === 0) return error(ctx, pathName, "must be a non-empty media ref string")
  if (PLACEHOLDER_RE.test(value)) {
    if (ctx.allowPlaceholders) return warn(ctx, pathName, "placeholder must be replaced before real import/render")
    return error(ctx, pathName, "placeholder is not valid without --allow-placeholders")
  }
  if (UUID_RE.test(value)) return
  if (isHttpUrl(value)) {
    if (ctx.strictMedia && value.startsWith("http://")) warn(ctx, pathName, "https is preferred for public media URLs")
    return
  }
  error(ctx, pathName, "must be a target-app UUID or absolute http(s) URL")
}

function validateUuid(ctx, value, pathName, allowPlaceholder) {
  if (typeof value !== "string") return error(ctx, pathName, "must be a UUID string")
  if (PLACEHOLDER_RE.test(value)) {
    if (allowPlaceholder || ctx.allowPlaceholders) return warn(ctx, pathName, "placeholder must be replaced before import")
    return error(ctx, pathName, "placeholder is not valid without --allow-placeholders")
  }
  if (!UUID_RE.test(value)) error(ctx, pathName, "must be a UUID")
}

function validateId(ctx, value, pathName) {
  if (typeof value !== "string" || value.length < 1 || value.length > 120 || !ID_RE.test(value)) error(ctx, pathName, "must be a non-empty stable id string up to 120 chars")
}

function validateDate(ctx, value, pathName) {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) return error(ctx, pathName, "must be YYYY-MM-DD")
  if (Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) error(ctx, pathName, "must be a valid date")
}

function validateDateTime(ctx, value, pathName) {
  if (typeof value !== "string" || !ISO_DATETIME_RE.test(value)) return error(ctx, pathName, "must be ISO datetime with timezone")
  if (Number.isNaN(Date.parse(value))) error(ctx, pathName, "must be a valid datetime")
}

function validateCssValue(ctx, value, pathName) {
  if (typeof value !== "string" || !CSS_VALUE_RE.test(value)) error(ctx, pathName, "must be a CSS value such as 120px, 20%, 8rem, auto, or fit-content")
}

function requireString(ctx, value, pathName, options = {}) {
  if (typeof value !== "string") return error(ctx, pathName, "must be a string")
  if (options.min !== undefined && value.length < options.min) error(ctx, pathName, `must be at least ${options.min} chars`)
  if (options.max !== undefined && value.length > options.max) error(ctx, pathName, `must be at most ${options.max} chars`)
  if (options.min === undefined && value.length === 0) error(ctx, pathName, "must be non-empty")
}

function requireNumber(ctx, value, pathName, options = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return error(ctx, pathName, "must be a number")
  if (options.min !== undefined && (options.exclusive ? value <= options.min : value < options.min)) error(ctx, pathName, `must be ${options.exclusive ? "greater than" : "at least"} ${options.min}`)
  if (options.max !== undefined && value > options.max) error(ctx, pathName, `must be at most ${options.max}`)
}

function requireBoolean(ctx, value, pathName) {
  if (typeof value !== "boolean") error(ctx, pathName, "must be a boolean")
}

function expectEnum(ctx, value, pathName, values) {
  if (!values.includes(value)) error(ctx, pathName, `must be one of: ${values.join(", ")}`)
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isHttpUrl(value) {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function error(ctx, pathName, message) {
  ctx.errors.push(`${pathName}: ${message}`)
}

function warn(ctx, pathName, message) {
  ctx.warnings.push(`${pathName}: ${message}`)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

function showHelp() {
  console.log(`Usage: node bin/validate-theme.js <theme.json> [--allow-placeholders] [--strict-media]

Validates Bahagiaku/Tekole theme bulk-import JSON without external dependencies.

Options:
  --allow-placeholders  Allow REPLACE_WITH_* placeholders with warnings.
  --strict-media        Reserved for future remote media checks.
`)
}

main()
