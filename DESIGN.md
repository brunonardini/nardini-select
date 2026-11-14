---
name: Nardini Select
description: Curadoria especializada para cães. Uma escolha com assinatura.
colors:
  cafe: "#522e24"
  terracota: "#c1754a"
  argila: "#c8af9a"
  areia: "#e2d1be"
  off-white: "#f7efe6"
typography:
  display:
    fontFamily: "Kanesty, 'Lexend', sans-serif"
    fontSize: "clamp(2.8rem,4.3vw,4.6rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-.02em"
  headline:
    fontFamily: "Kanesty, 'Lexend', sans-serif"
    fontSize: "clamp(2.3rem,4vw,3.8rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-.02em"
  title:
    fontFamily: "Kanesty, 'Lexend', sans-serif"
    fontSize: "clamp(1.4rem,1.8vw,1.75rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-.02em"
  body:
    fontFamily: "Kanesty, 'Lexend', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Kanesty, 'Lexend', sans-serif"
    fontSize: ".875rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: ".01em"
rounded:
  pill: "999px"
  menu: "8px"
spacing:
  container-gutter: "56px"
  tablet-gutter: "36px"
  mobile-gutter: "22px"
  narrow-gutter: "18px"
  section: "96px"
  mobile-section: "72px"
  button-gap: "14px"
  pillar-gap: "56px"
components:
  button-primary:
    backgroundColor: "{colors.cafe}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.pill}"
    padding: "13px 26px"
    typography: "{typography.label}"
    height: "50px"
  button-outline:
    textColor: "{colors.cafe}"
    rounded: "{rounded.pill}"
    padding: "13px 26px"
    typography: "{typography.label}"
    height: "50px"
  button-outline-hover:
    backgroundColor: "{colors.cafe}"
    textColor: "{colors.off-white}"
  navigation:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.cafe}"
  navigation-menu:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.cafe}"
    rounded: "{rounded.menu}"
  brand-section:
    backgroundColor: "{colors.cafe}"
    textColor: "{colors.off-white}"
  location-section:
    backgroundColor: "{colors.areia}"
    textColor: "{colors.cafe}"
---

# Design System: Nardini Select

Source of truth: the brand manual _Nardini Select — Manual da Marca_ (v2, corrected). It stays with the brand sources outside Git. This file translates it to the web; when they disagree, the manual wins, except where web accessibility needs a stricter rule (marked below).

## Overview

**Creative North Star: "Uma escolha com assinatura"**

Nardini is a founder's surname, not a name invented to sound premium: every product is a signed choice. The identity says _mais seleção, menos convencional_. It is natural without being rustic and premium without being cold: earthy colors drawn from clay, ceramics and natural food, one robust contemporary sans-serif with light spacing, and the N monogram, where the founder's initial meets a dog's silhouette.

The page reads like the manual's own spreads: large quiet off-white and areia surfaces, solid Café Profundo blocks, a single terracota accent, and generous breathing room around the mark. Priority, in the manual's words: _leitura, respiro e contraste_.

**Key Characteristics:**

- The five official colors only, with Café as the base and Terracota as the accent.
- One brand family in two weights: ExtraBold for titles, Regular for everything else.
- Graphic blocks and diagonal cuts taken from the N monogram, used as support, never as excess.
- Official logo files, never redrawn, recolored, cropped or distorted.
- A dog shown with presence, confidence and bond: affection without infantilization.

## Colors

The official palette has exactly five colors. Don't add hues, tints from outside the earthy range, or saturated combinations.

| Token | Manual name | Hex | Role |
| --- | --- | --- | --- |
| `cafe` | Café Profundo | `#522E24` | Base: text, logo, primary buttons, dark blocks, browser theme color |
| `terracota` | Terracota | `#C1754A` | Accent: highlighted heading words, short rules, monogram stems, hover rings |
| `argila` | Argila | `#C8AF9A` | Quiet lines (footer rules), scrollbar thumb |
| `areia` | Areia | `#E2D1BE` | Alternate surface; light text on café |
| `off-white` | Off-white | `#F7EFE6` | Main surface; text on café |

**The 70 / 20 / 10 Rule.** The manual sets the chromatic hierarchy: base 70%, accent 20%, breathing room 10%. On screen this applies to the brand color in a composition, not to the page background: Café carries most of the color weight (type, logo, dark blocks), Terracota stays an accent, and Argila/Areia/Off-white keep it breathing. Never let Terracota become the dominant color of a view.

**The Contrast Rule (web, stricter than print).** Measured WCAG 2.2 ratios decide where each color may carry text:

- Café on Off-white 10.4:1, on Areia 7.9:1, on Argila 5.7:1: any text size.
- Off-white on Café 10.4:1, Areia on Café 7.9:1: any text size.
- Terracota on Off-white 3.1:1 and on Café 3.3:1: **large text only** (≥24px, or ≥18.66px bold), plus non-text graphics.
- Terracota on Areia 2.4:1: **never text**. Headings on Areia have no terracota highlight.
- Off-white or Café text on Terracota (3.1:1 and 3.3:1) is below 4.5:1: **never put small text, buttons or links on a terracota fill.**

This is why buttons are Café, not Terracota, and why focus rings are Café on light surfaces and Off-white on Café.

## Typography

**Brand family: Kanesty.** _Kanesty ExtBd_ for titles, calls and words of impact; _Kanesty Regular_ for supporting text, descriptions and informative copy. No other weights or families.

**Current web font: Lexend (400 and 800), a stand-in.** Kanesty has no web license in the project yet. Lexend is loaded with `next/font/google` in `app/layout.tsx` and exposed as `--font-brand`. To switch to Kanesty, replace that call with `next/font/local` pointing at the licensed files and keep the `--font-brand` variable; the CSS needs no change.

- **Display:** hero heading, 800, the last phrase in Terracota on its own line. Mobile `clamp(2.35rem,10.4vw,3.6rem)`.
- **Headline:** section headings, 800. Mobile `clamp(2.1rem,8.4vw,3.2rem)`.
- **Title:** pillar and contact headings, 800.
- **Body:** 400, 16px base, line height 1.65, `text-wrap: pretty` against orphans.
- **Label:** buttons, the header contact pill, the address street and pillar closing lines, 800.
- **Tracking:** the manual asks for _leveza no espaçamento_. Headings stay at `-0.02em` (the face is already wide); the small uppercase motto uses `0.14em`. Never tighter than `-0.02em`.
- No italics: the brand family is set in roman only.

## Layout

The container is capped at 1240px with 56px gutters, 36px at ≤1100px, 22px at ≤760px and 18px at ≤380px. The home has five sections (hero, brand, selection, location, contact). The desktop hero follows the proportions of the artwork. On mobile, the header and hero together fill at least one viewport. Each following section fills at least one viewport on its own.

Surface sequence on the home: hero (off-white with the monogram and dog) → brand (café) → selection (off-white) → location (areia + storefront photo) → contact and footer (off-white).

- **Hero:** an off-white header above two columns. Copy sits on the left. The dog and full N scale together on the right (46%, capped at 800px, and 48% at ≤1100px). At ≤760px the hero shows the copy and actions, vertically centered.
- **Brand:** the official seal to the left of the three-line heading at every width (215–260px above 1100px, 25% of the heading group below), copy on the right; stacks at ≤760px.
- **Selection:** three open columns; at ≤760px each pillar puts a 125px illustration (95px at ≤380px) beside its heading and concept, and the closing line runs full width below.
- **Location:** copy on areia beside the storefront photo, which fills the right half full-bleed; on mobile the photo comes first at full width.
- **Contact:** two open columns, stacked on mobile. The footer closes this section.

**The Breathing Room Rule.** Keep a clear area around every logo at least the height of the word SELECT in that logo. In code this is padding on `.brand-link` and the footer link; never place text, icons or edges inside it.

## Elevation & Depth

Flat. Depth comes from color blocks (café panels against off-white), photography and the monogram shapes. The only shadow is the structural one under the open navigation menu (`0 14px 30px #522e2433`). No card shadows, glows or glass.

## Shapes

- **Pills** (`999px`) for actions; **8px** for the navigation menu; photographs keep square corners.
- **Monogram graphics:** blocks, curves and diagonal cuts derived from the N. The hero graphic follows the manual's construction sketch, with a Café left stem and diagonal and a Terracota right stem. The manual says _usar como apoio, nunca como excesso_: at most one monogram graphic per view.
- **Short rules:** 40×2px Terracota lines introduce closing lines and the motto. Small round bullets, if used, are Terracota.

## Components

### Buttons

Pill, 50px minimum height (48px in the mobile hero), 800 weight label, 1.5px Café border.

- **Primary:** Café fill, Off-white text. Hover adds an inset 2px Terracota ring and a 2px lift.
- **Outline:** transparent, Café text. Hover fills with Café and turns the text Off-white.
- Press scales to 0.98. Focus-visible: 2px Café outline offset 4px (Off-white on Café surfaces).
- Hover effects are gated behind `(hover: hover) and (pointer: fine)`.

### Navigation

The off-white header holds the official horizontal logo on the left (210px, 180px at ≤1100px, 160px at ≤760px) and Café links on the right, with a Terracota underline on hover and a Café outlined contact pill that scrolls to `#contato`. At ≤760px, a 44px toggle (two strokes that become a cross) opens an Off-white menu with Café links (Base UI `NavigationMenu`, `components/site-header/`). The menu opens on press, announces expansion, closes on selection, on Escape, and on a click outside, and returns focus to the toggle.

### Brand Marks

Use the files exported from the official artwork; never rebuild, redraw, recolor, crop or distort them. The dots of the “i” in Nardini are part of the drawing and must not be redrawn or rounded.

| Version | File | Use |
| --- | --- | --- |
| Horizontal (preferred) | `public/images/logo-horizontal.png` | Header and footer, on light surfaces only |
| Seal | `public/images/selo.png` | Brand section, on Café; labels and seals in print |
| Symbol (N + dog) | `app/icon.png`, `app/apple-icon.png` | Favicon and avatar, cut from the official horizontal file on Off-white |

The horizontal logo has no reversed version: never place it on Café or Terracota. The vertical version exists in the brand sources but isn't used on the site.

### Pillar Groups

Three open groups, each with an illustration, a heading, a short concept and a closing line in 800 weight under a short Terracota rule. No cards or boxed containers.

### Contact Options

WhatsApp and Instagram each pair a 52px line icon (1.6 stroke) with a heading, a short paragraph and a primary button. No form exists on this build.

### Imagery

- **The brand dog** is the approved illustration in the logo, symbol and seal, drawn from Bacon, a real dog: sober, attentive and imposing. Never alter it.
- **The hero dog** is a photographic silver-gray Weimaraner that follows that reference (proportions, dropped ears, long muzzle, elegant neck). Keep it as its own transparent asset over the full N. It is not shown at ≤760px.
- **The storefront** (`loja-frente.jpg`) is the real shop with the printed phone strip concealed.

### Motion

The one authored moment is the hero dog rising 24px into place over 0.9s (`cubic-bezier(.16,1,.3,1)`), from an already visible state. Buttons fade color and lift 2px over 0.2s. Under `prefers-reduced-motion: reduce` all movement is removed (dog, lift, press, menu stroke rotation); color fades stay.

## Do's and Don'ts

### Do:

- **Do** check every piece against the manual's approval checklist: right logo version, enough contrast, official palette, readable type, unaltered dog, breathing room around the mark.
- **Do** write in the brand voice: specialist but close, secure without sounding technical, affectionate without infantilizing. Say _cão_ and _cães_; say “Curadoria especializada para cães” and “Escolhas melhores também são cuidado.”
- **Do** keep Café as the base and Terracota as the accent, and only on the surfaces the Contrast Rule allows.
- **Do** keep text, links and images independent in code; never rasterize text.
- **Do** use real storefront photography to help visitors recognize the shop.

### Don't:

- **Don't** use colors outside the five-color palette, or saturated combinations.
- **Don't** redraw, recolor, crop, distort or regenerate any brand mark, including with AI (the earlier regenerated transparent seal was removed for this reason).
- **Don't** put the horizontal logo on Café or Terracota, or put buttons and small text on a Terracota fill.
- **Don't** combine a giant dog, the seal and text in the same panel.
- **Don't** call the store a pet shop, or write “Tudo para o seu pet em um só lugar” or “Mimos fofinhos para seu doguinho.” The brand is _seleção com critério_.
- **Don't** turn the pillars or contact options into decorative cards.
- **Don't** display the phone number in the interface or the storefront image.
- **Don't** replace the silver-gray Weimaraner with a golden or caramel Labrador.
- **Don't** add a feed, prices, a product catalog or checkout to the institutional home.
