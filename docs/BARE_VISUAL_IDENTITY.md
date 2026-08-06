# Bare Visual Identity

## Brand Concept

Bare is an Arabic RTL classifieds marketplace for the Syrian market. The identity communicates simplicity, transparency, trust, local discovery, fast buying and selling, practical everyday use, and modern global product quality.

## Logo

The Bare mark is a minimal geometric "B" constructed from two rounded card-like shapes connected by a vertical stroke. It is recognizable at small sizes and works as app icon, favicon, header mark, and profile placeholder.

### Usage Rules

- Always use the SVG source at `src/assets/bare-logo.svg`
- Minimum clear space: 4px around the mark
- Do not stretch, rotate, or add effects
- Do not use emoji or raster art as the logo

### Variants

| Variant | Usage |
|---------|-------|
| Monochrome light (#F5F7F8) | Dark backgrounds |
| Monochrome dark (#111315) | Light backgrounds |
| Green accent (#4ADE80) | Active/selected states |

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| --bare-bg | #111315 | Page background |
| --bare-surface | #191C1E | Primary surface (cards, header) |
| --bare-elevated | #202426 | Elevated surface |
| --bare-elevated-strong | #272C2F | Strong elevated surface |
| --bare-border | #30363A | Default border |
| --bare-border-strong | #41484D | Strong/hover border |
| --bare-text | #F5F7F8 | Primary text |
| --bare-text-secondary | #B3BBC0 | Secondary text |
| --bare-text-muted | #7F898F | Muted/metadata text |
| --bare-green | #4ADE80 | Primary accent |
| --bare-green-hover | #35C76C | Hover/strong accent |
| --bare-green-bg | rgba(74,222,128,0.12) | Subtle green background |
| --bare-green-text | #071A0F | Text on solid green |
| --bare-error | #F97066 | Error states |
| --bare-warning | #F5B942 | Warning states |
| --bare-info | #6AAEFF | Information states |

### Green Usage Rules

Green is an accent only. Use for: primary actions, active nav, selected state, price emphasis, focus indicators, success feedback. Do NOT use on every heading, icon, border, or card.

## Typography

**Font:** IBM Plex Sans Arabic

**Hierarchy:**

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Page title | 22px | 800 | Main page headings |
| Section title | 15-18px | 700 | Section headings |
| Listing title | 14px | 600 | Card titles (max 2 lines) |
| Price | 15px | 700 | Prominent price display |
| Body | 14px | 400 | Regular content |
| Metadata | 11-12px | 400 | Location, time, views |
| Button | 14px | 500 | Button labels |
| Nav label | 10px | 400-600 | Bottom nav labels |

## Icon System

- Monochrome outline SVG
- 2px stroke width
- Rounded line endings (stroke-linecap: round, stroke-linejoin: round)
- 20-24px standard size
- Neutral muted color when inactive
- Bare Green when active/selected
- No emoji
- No multicolored icons

## Spacing Scale

4px → 8px → 12px → 16px → 24px → 32px

## Border Radii

| Size | Value | Usage |
|------|-------|-------|
| Small | 8px | Badges, small controls |
| Medium | 12px | Inputs, buttons |
| Large | 14px | Cards, sheets |
| XL | 16px | Large dialogs |
| Full | 9999px | Pills, filter chips |

## Component Rules

### Listing Card (Mobile)
- Horizontal layout: image left, content right
- Image: 120-140px width, full card height
- Title: max 2 lines, truncate
- Price: prominent, Bare Green
- Metadata: muted, compact

### Listing Card (Desktop)
- Vertical layout in responsive grid
- Consistent image ratio (4:3)
- Same information hierarchy

### Empty States
- One clean SVG icon
- One concise title
- One short description
- Optional action button
- No oversized emoji

### Navigation
- 5 items: الرئيسية, المفضلة, إضافة, الرسائل, حسابي
- Monochrome SVG icons
- Muted inactive, Green active
- 44px minimum touch targets

## Transitions

- Duration: 120-180ms
- Easing: ease
- CSS only, no JS animation libraries
- Respect prefers-reduced-motion

## Prohibited Patterns

- Emoji as UI icons
- Purple visited link colors
- Text underlines on non-link content
- Inline styles (use CSS classes)
- Heavy shadows
- Neon/glassmorphism effects
- 3D decoration
- Excessive gradients
- Cultural/heritage themes
- Copied marketplace branding
