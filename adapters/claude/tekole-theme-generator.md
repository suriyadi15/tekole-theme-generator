---
description: Generate, repair, validate, and explain Tekole/Bahagiaku theme JSON for admin /bulk-import, including all theme builder fields, enums, block content formats, render behavior, and validation rules.
---

# Tekole Theme Generator

Use this skill when the user asks to create, repair, validate, or explain a Tekole/Bahagiaku invitation theme JSON for admin `/bulk-import`.

## Workflow

1. Gather the requested event type, visual direction, block list, media availability, and text tone.
2. Generate a JSON object or JSON array that can be uploaded to `/bulk-import`.
3. Use only the supported event types, block types, enums, and field shapes described below.
4. Validate JSON before returning it.
5. Tell the user which media placeholders must be replaced: `thumbnailId` needs a media UUID, while render media can use a media UUID or direct URL.

## Critical Rules

- Output valid JSON only inside fenced `json` blocks when providing import data.
- Theme `name` must be unique. Duplicate names are skipped on import.
- `thumbnailId` must be omitted/undefined or a UUID media ID from the target app; direct URLs are not supported for thumbnails.
- `imageId`, `backgroundImageId`, and `audioId` must be media refs: either UUID media IDs from the target app or direct `http(s)` URLs.
- Do not put bank accounts, e-wallets, gift items, or transfer confirmations in theme JSON. `donation` and `gift` blocks use runtime invitation dashboard data.
- Dates must be ISO strings.
- Required top-level fields: `name`, `type`, `ornaments`, `blocks`, `content`.
- Recommended top-level fields: `description`, `status`, `thumbnailId`, `styles`, `openingConfig`, `navigationConfig`, `sound`.

## Event Types

- `wedding`: allowed `hero`, `couple`, `loveStory`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`
- `engagement`: allowed `hero`, `couple`, `events`, `gallery`, `maps`, `rsvp`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`
- `anniversary`: allowed `hero`, `couple`, `loveStory`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`
- `birthday`: allowed `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`
- `aqiqah`: allowed `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`
- `sunatan`: allowed `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`
- `wisuda`: allowed `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`
- `party`: allowed `hero`, `host`, `events`, `gallery`, `maps`, `rsvp`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`

Every event type should include required blocks: `hero`, `events`, `footer`.

## Top-Level Theme Shape

```json
{
  "name": "Unique Theme Name",
  "description": "Short description",
  "type": "wedding",
  "status": "draft",
  "thumbnailId": "REPLACE_WITH_MEDIA_UUID",
  "styles": {},
  "openingConfig": {},
  "navigationConfig": {},
  "sound": { "audioId": "REPLACE_WITH_AUDIO_MEDIA_UUID_OR_URL" },
  "ornaments": [],
  "blocks": [],
  "content": { "events": [] }
}
```

## Global Styles

`styles` contains:

- `typography.fontHeading`, `fontBody`, `fontAccent`, `sizeBase`, `scaleRatio`
- `colors.primary`, `accent`, `background`, `surface`, `text`, `textMuted`, `textInvert`, `border`
- `spacing.base`
- `button.borderRadius`, `paddingX`, `paddingY`, `fontWeight`, `letterSpacing`, `textTransform`, `variant`
- `borderRadius`

Enums:

- `button.textTransform`: `none`, `uppercase`, `capitalize`
- `button.variant`: `filled`, `outline`, `ghost`
- color token values: `primary`, `accent`, `background`, `surface`, `text`, `textMuted`, `textInvert`, `border`
- font token values: `fontHeading`, `fontBody`, `fontAccent`

## Blocks

Every block has:

- `id`
- `type`
- `order`
- `isVisible`
- `visibility`: `always`, `public_only`, `guests_only`
- `content`
- optional `styles`, `containerConfig`, `ornaments`, `entranceAnimation`

### Shared block style

Optional `styles`:

- `headingColor`, `headingFont`, `bodyColor`, `bodyFont`, `accentColor`
- `align`: `left`, `center`, `right`
- `paddingTop`, `paddingBottom`, `gap`
- `backgroundColor`

Optional `containerConfig`:

- `width`: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `full`
- `paddingTop`, `paddingBottom`, `paddingX`
- `backgroundImageId`, `backgroundColor`, `backgroundOverlayColor`, `backgroundOverlayOpacity`, `minHeight`

Optional `entranceAnimation`:

- `type`: `none`, `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `zoomIn`, `slideIn`
- `duration`, `delay`
- `easing`: `ease`, `ease-out`, `spring`, `bounce`

## Block Content Shapes

Any field named `imageId`, `backgroundImageId`, or `audioId` is a media ref: either a target-app media UUID or direct `http(s)` URL. `thumbnailId` is UUID-only or omitted.

- `hero`: `imageId?`, `title`, `description?`, `showEventDate`, `showCountdown`
- `couple`: `layout`, `showNickname`, `showSosmed`, `showParent`, `imageShape`, `dividerType`, `dividerText?`, `showCard`
- `celebrant`: `layout`, `showAge`, `showBirthDate`, `showParent`, `caption?`
- `host`: `layout`, `showDescription`
- `loveStory`: `title`, `description?`, `layout`, `items[]` with `id`, `date`, `title`, `description`, `imageId?`
- `events`: `title`, `description?`, `layout`, `showAddToCalendar`, `showMapsButton`
- `gallery`: `title`, `description?`, `layout`, `aspectRatio?`, `objectFit?`, `items[]` with `id`, `imageId?`, `caption?`
- `maps`: `title`, `description?`, `linkedEventId`, `showDirectionButton`, `buttonText`
- `rsvp`: `title`, `description?`
- `donation`: `title`, `description?`, `showCopyButton`
- `gift`: `title`, `description?`, `showProgress`, `showPurchaseLink`
- `video`: `title`, `description?`, `layout`, `items[]` with `id`, `title`, `youtubeUrl`
- `dresscode`: `title`, `description?`, `colorPalette[]`, `imageId?`, `notes?`
- `quotes`: `text`, `source?`, `style`, `showDivider`
- `countdown`: `title?`, `linkedEventId`, `style`
- `comment`: `title`, `description?`
- `footer`: `text?`, `showSosmed`, `sosmedLinks[]`, `backgroundImageId?`

Key enum values:

- Couple layout: `sideBySide`, `stacked`, `overlap`, `centered`
- Image shape: `circle`, `square`, `rounded`, `diamond`
- Couple divider: `ampersand`, `line`, `text`, `none`
- Celebrant layout: `centered`, `card`, `split`
- Host layout: `centered`, `card`, `list`
- Love story layout: `timeline`, `cards`, `minimal`
- Events layout: `card`, `timeline`, `list`
- Gallery layout: `grid`, `masonry`, `slider`, `polaroid`
- Gallery aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `free`
- Gallery object fit: `cover`, `contain`, `fill`
- Quote style: `blockquote`, `card`, `minimal`
- Countdown style: `flip`, `minimal`, `circle`, `boxed`
- Video layout: `featured`, `grid`, `carousel`

## Content

Global `content` must include `events`.

For wedding/engagement/anniversary, include `couple` when using the couple block:

- `person1`, `person2`: `fullName`, `nickname`, `imageId?`, `fatherName?`, `motherName?`, `childOrder?`, `sosmed[]`

For birthday/aqiqah/sunatan/wisuda, include `celebrant[]`:

- `id`, `fullName`, `nickname`, `imageId?`, `birthDate?`, `fatherName?`, `motherName?`, `sosmed[]`

For party, include `host[]`:

- `id`, `name`, `title?`, `imageId?`, `description?`

Events:

- `id`, `title`, `description?`, `fromDate`, `toDate`, `isPrimary`, `useGlobalLocation?`, `location?`
- `maps.linkedEventId` and `countdown.linkedEventId` must match an event ID.

## Render Behavior Highlights

- Blocks render by ascending `order`.
- `visibility` filters public vs guest views.
- Navigation links scroll to block IDs.
- Opening screen renders if `openingConfig` exists.
- Audio renders if `sound.audioId` exists.
- Images/audio use media refs: UUIDs resolve through `/api/media/{id}`, and direct URLs are used as-is.
- `donation`, `gift`, `rsvp`, and `comment` use runtime invitation APIs/data beyond the theme JSON.

## Final Checklist

- JSON parses.
- No comments/trailing commas.
- Required top-level fields are present.
- Event type and block list are compatible.
- Required blocks exist.
- Navigation target block IDs exist.
- Linked event IDs exist.
- Media placeholders are clearly marked.
- No payment/gift runtime data is stored inside theme JSON.
