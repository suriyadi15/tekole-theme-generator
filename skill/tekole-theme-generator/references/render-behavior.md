# Bahagiaku Theme Render Behavior

This file explains where theme JSON fields are used when rendered.

## Import and Storage

Admin bulk import accepts a single theme object or an array. It validates only the top-level shape loosely, then stores these JSONB fields in the `themes` table:

- `styles`
- `opening_config`
- `navigation_config`
- `ornaments`
- `blocks`
- `sound`
- `content`

`name` has a unique index. Duplicate names are skipped.

## Renderer Overview

The renderer receives a `ThemeInvitationStore`:

- `styles` becomes CSS variables on the root preview element.
- `openingConfig` renders the opening overlay before the invitation.
- top-level `ornaments` render globally.
- `navigationConfig` renders fixed navigation.
- `sound` renders a fixed audio button.
- `blocks` render in `order` ascending.
- `content` provides global person/event/location data consumed by blocks.

If `styles` is missing, a fallback style is used. For import quality, include full `styles`.

## Media Refs

Media fields such as `imageId`, `backgroundImageId`, and `audioId` accept either a target-app media UUID or a direct `http(s)` URL. UUID refs resolve through `/api/media/{id}`; direct URLs are used as-is. `thumbnailId` is UUID-only or omitted.

## Global Style Variables

`styles.colors` becomes:

- `primary` -> `--inv-primary`
- `accent` -> `--inv-accent`
- `background` -> `--inv-bg`
- `surface` -> `--inv-surface`
- `text` -> `--inv-text`
- `textMuted` -> `--inv-text-muted`
- `textInvert` -> `--inv-text-invert`
- `border` -> `--inv-border`

`styles.typography` becomes:

- `fontHeading` -> `--inv-font-heading`
- `fontBody` -> `--inv-font-body`
- `fontAccent` -> `--inv-font-accent`, falling back to heading.
- `sizeBase` and `scaleRatio` compute `--inv-size-sm`, `--inv-size-md`, `--inv-size-lg`, `--inv-size-xl`, `--inv-size-2xl`.

`styles.spacing.base` becomes `--inv-spacing`.

`styles.borderRadius` becomes `--inv-radius`.

`styles.button` becomes button variables:

- `--inv-btn-radius`
- `--inv-btn-px`
- `--inv-btn-py`
- `--inv-btn-fw`
- `--inv-btn-ls`
- `--inv-btn-tt`
- `--inv-btn-bg`
- `--inv-btn-color`
- `--inv-btn-border`

Button variant behavior:

- `filled`: background primary, text invert.
- `outline`: transparent background, primary text/border.
- `ghost`: transparent border, primary text.

## Font Loading

The renderer extracts non-system font family names from:

- `styles.typography.fontHeading`
- `styles.typography.fontBody`
- `styles.typography.fontAccent`
- per-block `styles.headingFont`
- per-block `styles.bodyFont`

It loads them from Google Fonts. Use clean family names like `"Playfair Display"` or `"Plus Jakarta Sans"`.

## Block Rendering Rules

Blocks are filtered and sorted before rendering:

- `isVisible` must be true.
- `visibility: "always"` renders for everyone.
- `visibility: "guests_only"` renders only when guest data exists.
- `visibility: "public_only"` renders only without guest data.
- Render order is ascending `order`.

Every rendered block becomes a `<section>` with:

- `id={block.id}`
- `data-preview-block-id={block.id}`
- section padding from resolved block style.
- inner content container from `containerConfig`.

## Per-Block Style Resolution

For every block, `styles` is merged with global theme defaults:

- `headingColor`: token/CSS value, fallback global `text`.
- `headingFont`: token/font value, fallback `fontHeading`.
- `bodyColor`: token/CSS value, fallback global `text`.
- `bodyFont`: token/font value, fallback `fontBody`.
- `accentColor`: token/CSS value, fallback global `accent`.
- `align`: fallback `center`.
- `paddingTop`: rem value converted to px, fallback `spacing.base * 64`.
- `paddingBottom`: rem value converted to px, fallback `spacing.base * 64`.
- `gap`: rem value converted to px, fallback `spacing.base * 32`.
- `backgroundColor`: token/CSS color/gradient; null/undefined means no section background override.

Use token names for theme-aware overrides, or explicit hex/CSS when needed.

## Container Rendering

`containerConfig` controls the inner container:

- `width` maps to max-width: `none/full` 100%, `xs` 480px, `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.
- `paddingTop`, `paddingBottom`, `paddingX` are px.
- `minHeight` sets minimum inner container height.
- `backgroundColor` applies container background.
- `backgroundImageId` renders an absolutely positioned background image from its media ref.
- `backgroundOverlayColor` and `backgroundOverlayOpacity` render an overlay above the image/background.

## Opening Screen

Rendered only when `openingConfig` exists.

- Locks document scroll while visible.
- `backgroundImageId` renders from its media ref.
- `animation.backgroundEffect` maps to background animation classes.
- `overlayColor` and `overlayOpacity` render a full-screen overlay.
- `eventLabel`, `title`, `subtitle`, guest name, `guestNote`, and `buttonText` render centered.
- Guest note appears only if the invitation is opened with guest data.
- `invertText` switches text between `--inv-text` and `--inv-text-invert`.
- Clicking the button fades out the opening screen.

## Navigation

Rendered only when `navigationConfig.isEnabled` is true and `items.length > 0`.

- `style: "bar"` renders label/icon links.
- `style: "dots"` renders up to 7 dot links, with a `+N` count for extra items.
- `style: "hamburger"` renders a fixed menu button and popover.
- `position` controls fixed placement.
- Navigation links use `href="#{targetBlockId}"`.
- Icons are inferred from the target block type.

## Audio

Rendered only when `sound.audioId` exists.

- Audio source uses the `audioId` media ref.
- It loops and attempts autoplay with fade-in.
- A fixed play/pause button appears near bottom right.
- Audio is muted when page/tab loses active focus.

## Ornaments

Global ornaments render under the root. Block ornaments render inside the block section.

- `isVisible` filters ornament rendering.
- `positionMode: "fixed"` makes it viewport fixed; `"absolute"` makes it absolute in current layout context.
- `positionPreset` maps to placement classes.
- `positionX`/`positionY`, `rotation`, `flipX`, and `flipY` become CSS transform.
- `zLayer: "above"` gives z-index 10; `"below"` gives z-index -1.
- `animation`, `animationOrigin`, `speed`, and `delay` map to ornament animation CSS variables.
- Images render from their `imageId` media refs.

## Block-Specific Behavior

### hero

Uses `block.content` and `theme.content.events`.

- `imageId` renders as full background image from its media ref.
- `title` and `description` render as hero text.
- `showEventDate` shows primary event date. Primary event is `events.find(isPrimary)` or first event.
- `showCountdown` shows a simple days-left badge to primary/first event.

### couple

Uses `block.content` and `theme.content.couple`.

- `layout` controls pair layout.
- `imageShape` controls portrait shape.
- `dividerType` controls middle divider for side-by-side style.
- `dividerText` used when `dividerType` is `text`.
- `showNickname`, `showParent`, and `showSosmed` control optional person fields.
- `showCard` wraps each person in a surface card.

### celebrant

Uses `block.content` and `theme.content.celebrant`.

- `caption` renders as heading/caption above list.
- `layout` controls centered/card/split presentation.
- `showAge` derives age from `birthDate`.
- `showBirthDate` prints the birth date.
- `showParent` prints parent names.
- `sosmed` links render if present.

### host

Uses `block.content` and `theme.content.host`.

- `layout` controls centered/card/list presentation.
- `showDescription` toggles host descriptions.
- Host `title`, `name`, and `imageId` render if provided.

### loveStory

Uses only `block.content`.

- `title` and `description` render section heading.
- `layout: "timeline"` renders chronological timeline.
- `layout: "cards"` renders cards with optional images.
- `layout: "minimal"` renders compact text list.
- `items[].date`, `title`, `description`, and `imageId` are rendered.

### events

Uses `block.content`, `theme.content.events`, and global/effective location.

- `title` and `description` render section heading.
- `layout` controls card/timeline/list layout.
- Each event renders title, description, date/time, location title/address.
- `showAddToCalendar` creates a Google Calendar URL.
- `showMapsButton` creates a maps button when effective location has `latLong`.
- `event.isPrimary` affects card border/accent.

### gallery

Uses only `block.content`.

- Filters items without `imageId`.
- Images render from their `imageId` media refs.
- `layout: "grid"` renders responsive grid.
- `layout: "masonry"` renders masonry style.
- `layout: "slider"` renders an auto-advancing slider.
- `layout: "polaroid"` renders tilted card images.
- `aspectRatio` defaults to `1:1`.
- `objectFit` defaults to `cover`.
- Captions render where supported by the layout.

### maps

Uses `block.content` and `theme.content.events`.

- Finds event by `linkedEventId`, falling back to first event.
- Resolves location from event or `content.globalLocation` when event uses global location.
- Renders title, description, location name/address.
- Renders map view when location has `latLong`.
- `showDirectionButton` and `buttonText` control direction button.

### rsvp

Uses `block.content`, guest context, and public invitation APIs at runtime.

- Renders `title` and `description`.
- Shows RSVP controls and message input.
- Uses guest data when available.
- Content shape intentionally only includes display text.

### donation

Uses `block.content` and runtime gift/donation public data.

- Renders `title` and `description`.
- Shows donation payment accounts from invitation-specific data.
- `showCopyButton` toggles copy action.
- Do not store account numbers in theme JSON.

### gift

Uses `block.content` and runtime gift/donation public data.

- Renders `title` and `description`.
- Shows gift items from invitation-specific data.
- `showProgress` toggles progress bar.
- `showPurchaseLink` toggles purchase link display.
- Payment confirmation flow uses runtime data, not theme JSON.

### video

Uses only `block.content`.

- Filters items that have `title` or `youtubeUrl`.
- `layout: "featured"` renders first video prominently and secondary videos below.
- `layout: "grid"` renders all videos in a grid.
- `layout: "carousel"` renders horizontally scrollable videos.
- YouTube URLs are embedded when recognizable; otherwise fallback text renders.

### dresscode

Uses only `block.content`.

- Renders `title`, `description`, color swatches, optional `imageId`, and `notes`.
- Color swatches use `colorPalette[].colorHex` and labels.

### quotes

Uses only `block.content`.

- `style: "card"` renders a bordered surface card.
- `style: "minimal"` renders compact text.
- `style: "blockquote"` renders quoted block with accent border.
- `showDivider` toggles divider elements.
- `source` renders below quote when provided.

### countdown

Uses `block.content` and `theme.content.events`.

- Finds event by `linkedEventId`, falling back to first event.
- Renders remaining days/hours/minutes/seconds.
- `style` changes unit appearance: boxed/flip/circle/minimal.
- `title` renders if present.

### comment

Uses `block.content` and public comment APIs at runtime.

- Renders `title` and `description`.
- Provides comment form and displays comments.
- Content shape intentionally only includes display text.

### footer

Uses only `block.content`.

- Renders optional `backgroundImageId` as background from its media ref.
- If background image exists, foreground text uses `textInvert`.
- `text` supports line breaks.
- `showSosmed` and `sosmedLinks` render social links.
