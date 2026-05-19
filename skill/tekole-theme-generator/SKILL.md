---
name: tekole-theme-generator
description: Generate, repair, validate, and explain portable Tekole/Bahagiaku theme JSON for admin /bulk-import, including all theme builder fields, enums, block content formats, and render behavior. Use when a user wants a new invitation theme, a bulk-import JSON file, or help converting visual/theme ideas into Tekole/Bahagiaku theme JSON.
---

# Tekole Theme Generator

This skill creates portable Tekole/Bahagiaku theme JSON that can be uploaded through admin theme bulk import. The skill is self-contained: all contracts, enums, and render notes are bundled in `references/` so this folder can be shared without the source project.

## Quick Workflow

1. Understand the requested theme:
   - Event type: `wedding`, `engagement`, `anniversary`, `birthday`, `aqiqah`, `sunatan`, `wisuda`, or `party`.
   - Visual direction: palette, typography mood, ornament style, layout density, opening screen mood.
   - Blocks to include, but only use blocks allowed for the event type.
   - Media refs available as target-app UUIDs or direct URLs.
2. Consult the reference sections in this skill:
   - **JSON Contract** — always review before generating any JSON.
   - **JSON Schema** — use `assets/theme.schema.json` as the machine-readable portable contract.
   - **Enums** — when choosing event type, blocks, layout, animation, navigation, or ornament values.
   - **Render Behavior** — when explaining how fields affect rendering or choosing content/layout.
   - **Validation Checklist** — run mentally before final output.
3. Generate valid JSON:
   - Output either one object or an array of up to 50 theme objects.
   - Include all import-required fields: `name`, `type`, `ornaments`, `blocks`, and `content`.
   - Prefer including complete `styles`, `openingConfig`, `navigationConfig`, and `sound` when useful.
   - Do not include theme-level database fields: `id`, `createdBy`, `createdAt`, `updatedAt`.
   - Always include required nested IDs for blocks, navigation items, ornaments, celebrants, hosts, events, love story items, gallery items, video items, and dresscode colors.
4. Validate before final response:
   - JSON must parse.
   - `name` must be unique in the target app; duplicate names are skipped during import.
   - Nested IDs must be non-empty strings, stable, unique within their array scope, max 120 chars, and use safe characters like `block-hero`, `event-akad`, or `gallery-1`.
   - `blocks[].id` must be stable and unique.
   - Required blocks `hero`, `events`, and `footer` must exist; only use blocks allowed for the selected event type.
   - `navigationConfig.items[].targetBlockId` must match an existing block ID.
   - `maps.content.linkedEventId` and `countdown.content.linkedEventId` must match `content.events[].id`.
   - `content.celebrant` and `content.host` must always be arrays when present; never emit a single object.
   - Every `content.celebrant[]` and `content.host[]` item must include a non-empty string `id`, for example `"celebrant-1"`.
   - `CelebrantPerson` must not include `age`; use `birthDate` as `YYYY-MM-DD` when age rendering is needed.
   - Event `fromDate` and `toDate` must be ISO datetimes with timezone, for example `2026-06-20T09:00:00.000Z`.
   - Media fields must use supported media refs: `thumbnailId` is UUID-only or omitted; `imageId`, `backgroundImageId`, and `audioId` accept target-app UUIDs or absolute `http(s)` URLs.

## Important Rules

- Do not invent unsupported fields unless the user explicitly wants forward-compatible notes outside the JSON.
- Do not put bank accounts, e-wallets, gift items, or transfer confirmations inside theme JSON. Donation and gift render from invitation-specific dashboard data.
- Use `YYYY-MM-DD` for date-only fields such as `birthDate` and love story dates.
- Use ISO datetime strings with timezone for event `fromDate` and `toDate`.
- Use a target-app UUID or omit `thumbnailId`. Use media refs for `imageId`, `backgroundImageId`, and `audioId`: either target-app UUIDs or direct absolute `http(s)` URLs.
- Direct media URLs must be public, persistent, and appropriate for hotlink/render use; do not use local paths, relative paths, `data:` URLs, or `blob:` URLs.
- You may search the internet for suitable public media URLs when the user asks for media or visual completeness. Prefer stable CDN/media URLs and mention the source/assumption outside JSON.
- If media refs are unknown, omit optional media fields for import-ready JSON, or use placeholders only when the user wants a template and explain they must be replaced before import/render.
- Keep `status` as `"draft"` unless the user explicitly wants `"published"`.
- Keep theme names descriptive and unique, for example `"Rustic Garden Wedding 01"`.
- If validating locally from this package, run `node bin/validate-theme.js <file.json>` or `npm run validate:template`.

## Output Style

When asked to create a theme, provide:

1. A short note listing assumptions and required media ref replacements.
2. A fenced `json` block containing the import-ready object or array.
3. A brief checklist of what was validated.

When asked to repair or validate a theme JSON, lead with errors or risks, then provide corrected JSON if possible.
