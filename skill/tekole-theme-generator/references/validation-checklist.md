# Bahagiaku Theme Validation Checklist

Use this before returning generated or repaired theme JSON.

## JSON and Import

- JSON parses without comments or trailing commas.
- Output is either one object or an array.
- If array, length is 1-50.
- Each theme has `name`, `type`, `ornaments`, `blocks`, and `content`.
- `name` is 1-255 chars and likely unique in the target app.
- `status` is omitted or one of `draft`, `published`, `archived`.
- Do not include theme-level DB-managed fields: `id`, `createdBy`, `createdAt`, `updatedAt`.
- Do include required nested IDs: blocks, ornaments, navigation items, events, celebrants, hosts, love story items, gallery items, video items, and dresscode colors.
- Nested IDs are non-empty stable strings, unique within their array scope, max 120 chars, safe chars `[A-Za-z0-9._:-]`.
- Static JSON should satisfy `assets/theme.schema.json`; semantic validation should satisfy `bin/validate-theme.js`.

## Media

- `thumbnailId` is omitted/undefined or a UUID media ID from the target app; direct URLs and placeholders are not supported for real import thumbnails.
- `imageId`, `backgroundImageId`, and `audioId` are media refs: UUID media IDs from the target app or direct `http(s)` URLs.
- For import-ready JSON, omit unknown optional media fields instead of using placeholders.
- For template JSON only, placeholders like `REPLACE_WITH_MEDIA_UUID_OR_URL` are allowed if clearly explained and validated with `--allow-placeholders`.
- Direct image/audio URLs must be absolute `http://` or `https://` URLs, public, persistent, and not local/relative/data/blob/private URLs.

## Event Type and Blocks

- `type` is one of the event types.
- Blocks are allowed for the selected event type.
- Required blocks are present: `hero`, `events`, `footer`.
- `blocks[].id` values are present, unique, stable, and safe for anchors.
- Each array of nested objects with `id` has unique IDs in that array scope.
- `blocks[].order` values are numeric and sorted intentionally.
- `blocks[].type` matches the shape of `blocks[].content`.
- `blocks[].visibility` is `always`, `public_only`, or `guests_only`.
- `isVisible` is set explicitly.

## Navigation

- If navigation is enabled, `items` is not empty.
- Every `targetBlockId` exists in `blocks[].id`.
- Navigation labels are short enough for mobile.
- Dots navigation has fewer than or around 7 important items, or accepts extra `+N` display.

## Linked Events

- `content.events` is present and non-empty.
- Exactly one event should usually have `isPrimary: true`.
- Every event has `id`, `title`, `fromDate`, `toDate`, and `isPrimary`.
- Event dates are ISO datetime strings with timezone.
- Date-only fields such as `birthDate` and love story `date` use `YYYY-MM-DD`.
- `maps.content.linkedEventId` matches an existing event ID.
- `countdown.content.linkedEventId` matches an existing event ID.
- If `useGlobalLocation` is true, `content.globalLocation` is present.
- Direction buttons need `latLong` in `lat,lng` format with valid coordinate ranges.

## Person Content

- For `wedding`, `engagement`, `anniversary`: include `content.couple` when using `couple` block.
- For `birthday`, `aqiqah`, `sunatan`, `wisuda`: include `content.celebrant` as `CelebrantPerson[]` when using `celebrant` block; reject single objects.
- Every item in `content.celebrant[]` must include a non-empty string `id`, for example `"celebrant-1"`; reject output if any celebrant item has no `id`.
- Each `CelebrantPerson` has `fullName`, `nickname`, and `sosmed`; do not use unsupported `age`, use `birthDate` for age rendering.
- For `party`: include `content.host` as `HostPerson[]` when using `host` block; reject single objects.
- Social platform values are valid.

## Styles

- Full `styles` object is present for high-quality theme output.
- Colors have enough contrast, especially text vs background/surface.
- `button.variant`, `textTransform`, and color/font token values are valid.
- `sizeBase`, `scaleRatio`, `spacing.base`, and radius values are reasonable.
- Avoid one-note palettes unless requested; create a distinct primary/accent/background/surface relationship.

## Blocks

- `hero`: has `title`; has `imageId` or container background if visual hero desired.
- `couple`: content flags align with available person data.
- `celebrant`: age/birth date toggles align with `birthDate` availability.
- `host`: descriptions exist if `showDescription` is true.
- `loveStory`: items have ISO dates and meaningful titles.
- `events`: buttons align with location data.
- `gallery`: items with images have valid media refs; `aspectRatio` and `objectFit` are valid.
- `maps`: linked event has usable location.
- `rsvp`: only title/description in JSON.
- `donation`: only display fields in JSON; no account data.
- `gift`: only display fields in JSON; no gift item data.
- `video`: YouTube URLs are valid enough to embed.
- `dresscode`: palette has valid hex colors and labels.
- `quotes`: text is not too long for chosen style.
- `countdown`: linked event is in the future for real invitations when possible.
- `comment`: only title/description in JSON.
- `footer`: social links are valid when `showSosmed` is true.

## Final Response

- Mention media placeholders that must be replaced.
- Mention duplicate theme names will be skipped.
- Provide the JSON in a fenced `json` block.
- Do not include prose inside the JSON.
