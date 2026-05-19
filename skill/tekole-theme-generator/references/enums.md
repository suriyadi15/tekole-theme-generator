# Bahagiaku Theme Enums

Use only these values in generated theme JSON.

## Status

- Theme status: `draft`, `published`, `archived`
- Invitation status, for runtime context only: `draft`, `active`, `expired`

## Event Types

- `wedding` - Pernikahan, person group `couple`
- `engagement` - Tunangan, person group `couple`
- `anniversary` - Anniversary, person group `couple`
- `birthday` - Ulang Tahun, person group `celebrant`
- `aqiqah` - Aqiqah, person group `celebrant`
- `sunatan` - Sunatan, person group `celebrant`
- `wisuda` - Wisuda, person group `celebrant`
- `party` - Pesta / Gathering, person group `host`

## Allowed and Required Blocks by Event Type

Required blocks are blocks that should always be present. The builder treats them as non-removable.

### wedding

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `couple`, `loveStory`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`

### engagement

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`, `couple`, `dresscode`

### anniversary

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `couple`, `loveStory`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`

### birthday

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`

### aqiqah

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `dresscode`, `quotes`, `countdown`, `comment`, `footer`

### sunatan

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`, `celebrant`, `dresscode`

### wisuda

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `celebrant`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`

### party

- Required: `hero`, `events`, `footer`
- Allowed: `hero`, `events`, `gallery`, `maps`, `rsvp`, `donation`, `gift`, `video`, `quotes`, `countdown`, `comment`, `footer`, `host`, `dresscode`

## Block Types

- `hero`
- `couple`
- `celebrant`
- `host`
- `loveStory`
- `events`
- `gallery`
- `maps`
- `rsvp`
- `donation`
- `gift`
- `video`
- `dresscode`
- `quotes`
- `countdown`
- `comment`
- `footer`

## Visibility

- `always`
- `public_only`
- `guests_only`

## Navigation

Positions:

- `top`
- `bottom`
- `floating-bottom`
- `floating-side`

Styles:

- `bar`
- `dots`
- `hamburger`

## Style Tokens

Text align:

- `left`
- `center`
- `right`

Button variants:

- `filled`
- `outline`
- `ghost`

Text transforms:

- `none`
- `uppercase`
- `capitalize`

Color token keys:

- `primary`
- `accent`
- `background`
- `surface`
- `text`
- `textMuted`
- `textInvert`
- `border`

Typography font token keys:

- `fontHeading`
- `fontBody`
- `fontAccent`

## Container Width

- `none` - full bleed, max-width 100%.
- `xs` - 480px.
- `sm` - 640px.
- `md` - 768px.
- `lg` - 1024px.
- `xl` - 1280px.
- `full` - 100%.

## Block Layout Enums

Countdown styles:

- `flip`
- `minimal`
- `circle`
- `boxed`

Gallery layouts:

- `grid`
- `masonry`
- `slider`
- `polaroid`

Gallery aspect ratios:

- `1:1`
- `16:9`
- `9:16`
- `4:3`
- `3:4`
- `free`

Gallery object fit:

- `cover`
- `contain`
- `fill`

Quote styles:

- `blockquote`
- `card`
- `minimal`

Events layouts:

- `card`
- `timeline`
- `list`

Love story layouts:

- `timeline`
- `cards`
- `minimal`

Couple layouts:

- `sideBySide`
- `stacked`
- `overlap`
- `centered`

Image shapes:

- `circle`
- `square`
- `rounded`
- `diamond`

Couple divider types:

- `ampersand`
- `line`
- `text`
- `none`

Celebrant layouts:

- `centered`
- `card`
- `split`

Host layouts:

- `centered`
- `card`
- `list`

Video layouts:

- `featured`
- `grid`
- `carousel`

Social media platforms:

- `instagram`
- `tiktok`
- `twitter`
- `facebook`
- `youtube`

## Entrance Animation

Types:

- `none`
- `fadeIn`
- `fadeInUp`
- `fadeInDown`
- `fadeInLeft`
- `fadeInRight`
- `zoomIn`
- `slideIn`

Easing:

- `ease`
- `ease-out`
- `spring`
- `bounce`

## Opening Text Animations

- `fade-in`
- `fade-out`
- `zoom-in`
- `zoom-out`
- `slide-in-top`
- `slide-in-bottom`
- `slide-in-left`
- `slide-in-right`
- `float`
- `bounce-soft`
- `blur-in`
- `fade-in-spring`
- `zoom-in-spring`
- `slide-in-right-spring`
- `slide-in-left-spring`
- `zoom-in-bounce`
- `slide-up-bounce`

## Opening Background Effects

- `kenburns-in`
- `kenburns-out`
- `kenburns-left`
- `kenburns-right`
- `floating`
- `breathing`
- `cinematic-pan`
- `warp-speed`
- `glow-motion`
- `aurora`
- `mesh-gradient`
- `gradient-pulse`
- `shimmer`
- `scanlines`
- `vhs-flicker`
- `noise`
- `spotlight`
- `frosted-glass`
- `overlay-dark`
- `overlay-gradient`
- `cyberpunk`
- `nebula`
- `fire`
- `ocean`
- `forest`

## Ornament

Position modes:

- `fixed`
- `absolute`

Position presets:

- `top-left`
- `top-center`
- `top-right`
- `left-center`
- `center`
- `right-center`
- `bottom-left`
- `bottom-center`
- `bottom-right`

Layer:

- `above`
- `below`

Animations:

- `sway`
- `float`
- `jiggle`
- `rotate`
- `pulse`
- `falling`
- `bounce`

Animation origins:

- `center center`
- `left center`
- `right center`
- `top center`
- `bottom center`
- `top left`
- `top right`
- `bottom left`
- `bottom right`

CSS value units:

- `px`
- `rem`
- `em`
- `%`
- `vw`
- `vh`
- `auto`
- `fit-content`
