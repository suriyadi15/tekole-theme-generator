# Bahagiaku Theme JSON Contract

This is the portable contract for admin theme bulk import. The import endpoint accepts either a single theme object or an array of theme objects. Maximum batch size is 50.

## Top-Level Theme Object

Required by import validation:

- `name: string` - required, 1-255 chars, unique. Duplicate names are skipped.
- `type: EventTypeKey` - required event type.
- `ornaments: OrnamentConfig[]` - required array; use `[]` if none.
- `blocks: ThemeInvitationBlock[]` - required array.
- `content: InvitationContent` - required global event/person content.

Optional:

- `description?: string`
- `thumbnailId?: string` - target-app media UUID only; omit when unavailable. Direct URLs and placeholders are not supported for real import thumbnails.
- `status?: "draft" | "published" | "archived"` - defaults to `draft`.
- `styles?: ThemeStyle`
- `openingConfig?: OpeningConfig`
- `navigationConfig?: NavigationConfig`
- `sound?: { audioId?: string }`

Do not include theme-level DB-managed fields in import JSON: `id`, `createdBy`, `createdAt`, `updatedAt`. This does not apply to nested IDs: `blocks[].id`, `ornaments[].id`, `navigationConfig.items[].id`, `content.events[].id`, `content.celebrant[].id`, `content.host[].id`, and item IDs inside block content are required when their objects are present.

## Machine-Readable Schema

Use `assets/theme.schema.json` as the portable JSON Schema for static validation. Use `bin/validate-theme.js` for semantic checks such as unique IDs, allowed blocks per event type, linked event IDs, and media placeholder policy.

## ID Rules

Nested IDs are stable UI/render identifiers, not database IDs. Use non-empty strings up to 120 chars with safe characters `[A-Za-z0-9._:-]`, for example `block-hero`, `event-akad`, `nav-events`, `celebrant-1`, `gallery-1`. IDs must be unique inside their array scope. Block IDs must be globally unique within `blocks[]` because navigation and anchors reference them.

## ThemeStyle

`styles` controls global CSS variables used by all invitation renderers.

```json
{
  "typography": {
    "fontHeading": "Playfair Display",
    "fontBody": "Plus Jakarta Sans",
    "fontAccent": "Great Vibes",
    "sizeBase": 1,
    "scaleRatio": 1.25
  },
  "colors": {
    "primary": "#8B5E3C",
    "accent": "#C9A96E",
    "background": "#FDFAF6",
    "surface": "#F5EFE7",
    "text": "#3D2B1F",
    "textMuted": "#8A7060",
    "textInvert": "#FDFAF6",
    "border": "#E8DDD3"
  },
  "spacing": { "base": 1 },
  "button": {
    "borderRadius": "9999px",
    "paddingX": 2,
    "paddingY": 0.625,
    "fontWeight": 500,
    "letterSpacing": 0.05,
    "textTransform": "uppercase",
    "variant": "filled"
  },
  "borderRadius": 0.5
}
```

Field notes:

- `fontHeading`, `fontBody`, `fontAccent`: font family names. Non-system fonts are loaded from Google Fonts by family name.
- `sizeBase`: rem number; typical `0.9` to `1.15`.
- `scaleRatio`: typography scale; typical `1.15` to `1.35`.
- Color fields: hex or valid CSS color strings.
- `spacing.base`: rem number used to calculate default block spacing.
- `button.borderRadius`: `"9999px"` for pill or a CSS value like `"0.5rem"`.
- `button.paddingX`, `button.paddingY`: rem numbers.
- `button.fontWeight`: number, typically 400-700.
- `button.letterSpacing`: em number.
- `button.textTransform`: `none`, `uppercase`, or `capitalize`.
- `button.variant`: `filled`, `outline`, or `ghost`.
- `borderRadius`: rem number used by cards/containers.

## OpeningConfig

Opening screen appears before the invitation content when `openingConfig` exists.

```json
{
  "backgroundImageId": "REPLACE_WITH_MEDIA_UUID_OR_URL",
  "overlayColor": "#000000",
  "overlayOpacity": 0.45,
  "eventLabel": "Undangan Pernikahan",
  "title": "Budi & Sari",
  "subtitle": "Kami mengundang kehadiran Anda",
  "guestNote": "*Mohon maaf jika ada kesalahan penulisan nama",
  "buttonText": "Buka Undangan",
  "animation": {
    "backgroundEffect": "kenburns-in",
    "textEffect": "fade-in",
    "duration": 800
  },
  "invertText": true
}
```

Fields:

- `backgroundImageId?: string` - `MediaRef`.
- `overlayColor?: string | null` - null/no value means no overlay.
- `overlayOpacity: number` - 0 to 1.
- `eventLabel?: string`
- `title: string`
- `subtitle?: string`
- `guestNote?: string` - shown only when opened with guest data.
- `buttonText: string`
- `animation.backgroundEffect?: BackgroundEffectId | null`
- `animation.textEffect?: AnimationId | null`
- `animation.duration?: number | null` - ms.
- `invertText: boolean` - use `textInvert` color on opening screen.

## NavigationConfig

```json
{
  "isEnabled": true,
  "position": "bottom",
  "style": "bar",
  "items": [
    { "id": "nav-hero", "label": "Home", "targetBlockId": "block-hero" }
  ]
}
```

Fields:

- `isEnabled: boolean`
- `position: "top" | "bottom" | "floating-bottom" | "floating-side"`
- `style: "bar" | "dots" | "hamburger"`
- `items: NavigationItem[]`
- `items[].id: string`
- `items[].label: string`
- `items[].targetBlockId: string` - must match a block `id`.

## MediaRef

Media fields except `thumbnailId` use a string `MediaRef`: either a media UUID from the target app or an absolute direct `http://` or `https://` URL. When a UUID is used, the target app resolves it through `/api/media/{id}`; when a direct URL is used, the target app proxies/redirects through `/api/media/{encodedUrl}`. `thumbnailId` is UUID-only or omitted.

Direct media URLs must be public and persistent. Do not use local paths, relative paths, `data:` URLs, `blob:` URLs, or private/authenticated URLs. For generated import-ready JSON, omit unknown optional media fields instead of inserting placeholders. Use placeholders only for template output and clearly mark that they must be replaced before real import/render.

## Sound

```json
{ "audioId": "REPLACE_WITH_AUDIO_MEDIA_UUID_OR_URL" }
```

If `audioId` is omitted or empty, audio controls do not render.

## OrnamentConfig

Used by both top-level `ornaments` and `blocks[].ornaments`.

```json
{
  "id": "orn-top-left",
  "isVisible": true,
  "imageId": "REPLACE_WITH_MEDIA_UUID_OR_URL",
  "positionMode": "fixed",
  "positionPreset": "top-left",
  "positionX": "0px",
  "positionY": "0px",
  "width": "140px",
  "height": "140px",
  "zLayer": "above",
  "opacity": 0.8,
  "rotation": 0,
  "flipX": false,
  "flipY": false,
  "animation": "float",
  "animationOrigin": "center center",
  "speed": 4000,
  "delay": 0
}
```

Fields:

- `id: string`
- `isVisible: boolean`
- `imageId?: string` - `MediaRef`.
- `positionMode?: "fixed" | "absolute"` - fixed follows viewport, absolute follows page/block.
- `positionPreset: PositionId`
- `positionX?: CSSValue`
- `positionY?: CSSValue`
- `width: CSSValue`
- `height: CSSValue`
- `zLayer: "above" | "below"`
- `opacity?: number` - 0 to 1.
- `rotation?: number` - degrees.
- `flipX?: boolean`
- `flipY?: boolean`
- `animation?: OrnamentAnimationId`
- `animationOrigin?: AnimationOriginPosition`
- `speed?: number` - ms per cycle.
- `delay?: number` - ms.

`CSSValue` examples: `"120px"`, `"20%"`, `"8rem"`, `"10vw"`, `"auto"`, `"fit-content"`.

## Block Base Fields

Every block object has:

- `id: string` - unique and stable; used as section anchor.
- `type: BlockType`
- `order: number` - sorted ascending.
- `isVisible: boolean`
- `visibility: "always" | "public_only" | "guests_only"`
- `content: object` - shape depends on `type`.
- `styles?: ThemeInvitationBlockStyle`
- `containerConfig?: ContainerConfig`
- `ornaments?: OrnamentConfig[]`
- `entranceAnimation?: EntranceAnimation`

Example:

```json
{
  "id": "block-events",
  "type": "events",
  "order": 3,
  "isVisible": true,
  "visibility": "always",
  "content": {
    "title": "Rangkaian Acara",
    "description": "Kami menantikan kehadiran Anda",
    "layout": "card",
    "showAddToCalendar": true,
    "showMapsButton": true
  }
}
```

## ThemeInvitationBlockStyle

Per-block visual override. All fields optional.

- `headingColor?: ThemeColorValue`
- `headingFont?: ThemeFontValue`
- `bodyColor?: ThemeColorValue`
- `bodyFont?: ThemeFontValue`
- `accentColor?: ThemeColorValue`
- `align?: "left" | "center" | "right"`
- `paddingTop?: number` - rem; resolved to px.
- `paddingBottom?: number` - rem; resolved to px.
- `gap?: number` - rem; resolved to px.
- `backgroundColor?: ThemeColorValue | null` - token, CSS color, or CSS gradient.

`ThemeColorValue` can be a color token (`primary`, `accent`, `background`, `surface`, `text`, `textMuted`, `textInvert`, `border`) or any CSS color/gradient string.

`ThemeFontValue` can be a font token (`fontHeading`, `fontBody`, `fontAccent`) or a font family string.

## ContainerConfig

Controls the inner content container inside a block section.

```json
{
  "width": "md",
  "paddingTop": 64,
  "paddingBottom": 64,
  "paddingX": 24,
  "backgroundImageId": "REPLACE_WITH_MEDIA_UUID_OR_URL",
  "backgroundColor": null,
  "backgroundOverlayColor": "#000000",
  "backgroundOverlayOpacity": 0.25,
  "minHeight": 520
}
```

Fields:

- `width: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full"`
- `paddingTop: number` - px.
- `paddingBottom: number` - px.
- `paddingX: number` - px.
- `backgroundImageId?: string` - `MediaRef`.
- `backgroundColor?: string | null`
- `backgroundOverlayColor?: string | null`
- `backgroundOverlayOpacity: number` - 0 to 1.
- `minHeight?: number` - px.

Defaults if omitted: width `full`, `paddingTop` 64, `paddingBottom` 64, `paddingX` 24, overlay opacity 0.

## EntranceAnimation

- `type: "none" | "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "zoomIn" | "slideIn"`
- `duration: number` - ms.
- `delay: number` - ms.
- `easing: "ease" | "ease-out" | "spring" | "bounce"`

Default if omitted: `fadeInUp`, 600 ms, delay 0, `ease-out`.

## InvitationContent

Global content shared by blocks.

```json
{
  "couple": {
    "person1": {
      "fullName": "Budi Santoso",
      "nickname": "Budi",
      "imageId": "REPLACE_WITH_MEDIA_UUID_OR_URL",
      "fatherName": "H. Santoso",
      "motherName": "Hj. Rahayu",
      "childOrder": 1,
      "sosmed": [
        { "platform": "instagram", "url": "https://instagram.com/example", "username": "@example" }
      ]
    },
    "person2": {}
  },
  "celebrant": [
    {
      "id": "celebrant-1",
      "fullName": "Santika Rahayu",
      "nickname": "Santika",
      "imageId": "REPLACE_WITH_MEDIA_UUID_OR_URL",
      "birthDate": "1996-03-15",
      "sosmed": []
    }
  ],
  "host": [
    {
      "id": "host-1",
      "name": "Keluarga Besar",
      "title": "Tuan Rumah"
    }
  ],
  "events": []
}
```

Fields:

- `couple?: { person1?: CouplePerson, person2?: CouplePerson }` - used by wedding, engagement, anniversary.
- `celebrant?: CelebrantPerson[]` - used by birthday, aqiqah, sunatan, wisuda. Always an array, even for one person.
- `host?: HostPerson[]` - used by party/gathering. Always an array, even for one host.
- `events: EventItem[]` - required for all event types.
- `globalLocation?: EventLocation`

`CouplePerson`:

- `fullName: string`
- `nickname: string`
- `imageId?: string`
- `fatherName?: string`
- `motherName?: string`
- `childOrder?: number`
- `sosmed: PersonSosmed[]`

`CelebrantPerson`:

- `id: string` - required non-empty stable item ID, for example `"celebrant-1"`.
- `fullName: string`
- `nickname: string`
- `imageId?: string`
- `birthDate?: string` - date-only string `YYYY-MM-DD`.
- `fatherName?: string`
- `motherName?: string`
- `sosmed: PersonSosmed[]`

`HostPerson`:

- `id: string`
- `name: string`
- `title?: string`
- `imageId?: string`
- `description?: string`

`PersonSosmed`:

- `platform: "instagram" | "tiktok" | "twitter" | "facebook" | "youtube"`
- `url: string`
- `username: string`

`EventLocation`:

- `locationName?: string`
- `address?: string`
- `latLong?: string` - `lat,lng` decimal coordinates, latitude -90..90 and longitude -180..180, for example `"-6.210357,106.852341"`.
- `city?: string`

`EventItem`:

- `id: string`
- `title: string`
- `description?: string`
- `fromDate: string` - ISO datetime string with timezone, for example `2026-06-20T09:00:00.000Z`.
- `toDate: string` - ISO datetime string with timezone, for example `2026-06-20T11:00:00.000Z`.
- `isPrimary: boolean`
- `useGlobalLocation?: boolean`
- `location?: EventLocation`

If `useGlobalLocation` is true, event location resolves from `content.globalLocation`.

## Block Content Shapes

Any block or content field named `imageId`, `backgroundImageId`, or `audioId` uses `MediaRef`.

### hero

- `imageId?: string`
- `title: string`
- `description?: string`
- `showEventDate: boolean`
- `showCountdown: boolean`

### couple

- `layout: "sideBySide" | "stacked" | "overlap" | "centered"`
- `showNickname: boolean`
- `showSosmed: boolean`
- `showParent: boolean`
- `imageShape: "circle" | "square" | "rounded" | "diamond"`
- `dividerType: "ampersand" | "line" | "text" | "none"`
- `dividerText?: string`
- `showCard: boolean`

### celebrant

- `layout: "centered" | "card" | "split"`
- `showAge: boolean`
- `showBirthDate: boolean`
- `showParent: boolean`
- `caption?: string`

### host

- `layout: "centered" | "card" | "list"`
- `showDescription: boolean`

### loveStory

- `title: string`
- `description?: string`
- `layout: "timeline" | "cards" | "minimal"`
- `items: LoveStoryItem[]`

`LoveStoryItem`:

- `id: string`
- `date: string` - date-only string `YYYY-MM-DD`.
- `title: string`
- `description: string`
- `imageId?: string`

### events

- `title: string`
- `description?: string`
- `layout: "card" | "timeline" | "list"`
- `showAddToCalendar: boolean`
- `showMapsButton: boolean`

### gallery

- `title: string`
- `description?: string`
- `layout: "grid" | "masonry" | "slider" | "polaroid"`
- `aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "free"`
- `objectFit?: "cover" | "contain" | "fill"`
- `items: GalleryItem[]`

`GalleryItem`:

- `id: string`
- `imageId?: string`
- `caption?: string`

### maps

- `title: string`
- `description?: string`
- `linkedEventId: string`
- `showDirectionButton: boolean`
- `buttonText: string`

### rsvp

- `title: string`
- `description?: string`

### donation

- `title: string`
- `description?: string`
- `showCopyButton: boolean`

Do not include payment accounts in theme JSON.

### gift

- `title: string`
- `description?: string`
- `showProgress: boolean`
- `showPurchaseLink: boolean`

Do not include gift items in theme JSON.

### video

- `title: string`
- `description?: string`
- `layout: "featured" | "grid" | "carousel"`
- `items: VideoItem[]`

`VideoItem`:

- `id: string`
- `title: string`
- `youtubeUrl: string` - absolute YouTube URL from `youtube.com` or `youtu.be`.

### dresscode

- `title: string`
- `description?: string`
- `colorPalette: DresscodeColor[]`
- `imageId?: string`
- `notes?: string`

`DresscodeColor`:

- `id: string`
- `colorHex: string` - hex color string such as `#D4AF37`.
- `label: string`

### quotes

- `text: string`
- `source?: string`
- `style: "blockquote" | "card" | "minimal"`
- `showDivider: boolean`

### countdown

- `title?: string`
- `linkedEventId: string`
- `style: "flip" | "minimal" | "circle" | "boxed"`

### comment

- `title: string`
- `description?: string`

### footer

- `text?: string`
- `showSosmed: boolean`
- `sosmedLinks: FooterSosmedLink[]`
- `backgroundImageId?: string`

`FooterSosmedLink`:

- `platform: "instagram" | "tiktok" | "twitter" | "facebook" | "youtube"`
- `url: string`
