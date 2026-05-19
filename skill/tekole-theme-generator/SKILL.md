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
2. Read the relevant bundled references:
   - Always read `references/theme-json-contract.md` before generating JSON.
   - Read `references/enums.md` when choosing event type, blocks, layout, animation, navigation, or ornament values.
   - Read `references/render-behavior.md` when explaining how fields affect rendering or when choosing content/layout.
   - Read `references/validation-checklist.md` before final output.
3. Generate valid JSON:
   - Output either one object or an array of up to 50 theme objects.
   - Include all import-required fields: `name`, `type`, `ornaments`, `blocks`, and `content`.
   - Prefer including `styles`, `openingConfig`, `navigationConfig`, and `sound` when useful.
4. Validate before final response:
   - JSON must parse.
   - `name` must be unique in the target app; duplicate names are skipped during import.
   - `blocks[].id` must be stable and unique.
   - `navigationConfig.items[].targetBlockId` must match an existing block ID.
   - `maps.content.linkedEventId` and `countdown.content.linkedEventId` must match `content.events[].id`.
   - Media fields must use supported media refs: `thumbnailId` is UUID-only or omitted; `imageId`, `backgroundImageId`, and `audioId` accept target-app UUIDs or direct media URLs.

## Important Rules

- Do not invent unsupported fields unless the user explicitly wants forward-compatible notes outside the JSON.
- Do not put bank accounts, e-wallets, gift items, or transfer confirmations inside theme JSON. Donation and gift render from invitation-specific dashboard data.
- Use ISO date strings in JSON for all dates.
- Use a target-app UUID or omit `thumbnailId`. Use media refs for `imageId`, `backgroundImageId`, and `audioId`: either target-app UUIDs or direct `http(s)` URLs.
- If media refs are unknown, use `"REPLACE_WITH_MEDIA_UUID"` for `thumbnailId` and placeholders like `"REPLACE_WITH_MEDIA_UUID_OR_URL"` for render media, then explain they must be replaced before import/render.
- Keep `status` as `"draft"` unless the user explicitly wants `"published"`.
- Keep theme names descriptive and unique, for example `"Rustic Garden Wedding 01"`.

## Output Style

When asked to create a theme, provide:

1. A short note listing assumptions and required media ref replacements.
2. A fenced `json` block containing the import-ready object or array.
3. A brief checklist of what was validated.

When asked to repair or validate a theme JSON, lead with errors or risks, then provide corrected JSON if possible.
