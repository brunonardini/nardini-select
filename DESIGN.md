---
name: Nardini Select
description: Curadoria com assinatura, em uma apresentação calorosa e aberta.
colors:
  ink: "#542e20"
  orange: "#c55523"
  orange-light: "#f4a16e"
  sand: "#f4e9db"
  paper: "#faf5ed"
  line: "#dfc9b5"
  primary-hover: "#9b3b16"
  white: "#fff"
  hero-cream: "#fff0da"
  hero-primary: "#c5501d"
  hero-primary-hover: "#9d3c16"
  outline-border: "#f9e9d3"
  outline-text: "#fff6e9"
  outline-hover: "#fff3df"
  muted-ink: "#714b39"
typography:
  display:
    fontFamily: "'Bricolage Grotesque Variable',sans-serif"
    fontSize: "clamp(3.5rem,5.4vw,5.4rem)"
    fontWeight: 750
    lineHeight: 1.01
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Bricolage Grotesque Variable',sans-serif"
    fontSize: "clamp(2.5rem,4.8vw,4.5rem)"
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: "-.035em"
  title:
    fontFamily: "'Bricolage Grotesque Variable',sans-serif"
    fontSize: "clamp(1.6rem,2.1vw,2rem)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-.035em"
  body:
    fontFamily: "'Manrope Variable',sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  label:
    fontFamily: "'Manrope Variable',sans-serif"
    fontSize: ".875rem"
    fontWeight: 750
    lineHeight: 1.4
rounded:
  pill: "999px"
  menu: "8px"
  photograph: "3px"
spacing:
  container-gutter: "56px"
  tablet-gutter: "36px"
  mobile-gutter: "22px"
  section: "96px"
  mobile-section: "70px"
  button-gap: "14px"
  pillar-gap: "55px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "13px 25px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-hero:
    backgroundColor: "{colors.hero-primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "13px 25px"
  button-hero-hover:
    backgroundColor: "{colors.hero-primary-hover}"
  button-outline:
    textColor: "{colors.outline-text}"
    rounded: "{rounded.pill}"
    padding: "13px 25px"
  button-outline-hover:
    backgroundColor: "{colors.outline-hover}"
    textColor: "{colors.ink}"
  navigation:
    textColor: "{colors.hero-cream}"
  pillar:
    textColor: "{colors.ink}"
  contact-option:
    textColor: "{colors.ink}"
---

# Design System: Nardini Select

## Overview

**Creative North Star: "Curadoria com assinatura"**

The existing brand line anchors a warm, confident world of chocolate ink, burnt orange and generous beige space. Strong, rounded sans-serif typography gives the curated offer clarity; original brand marks and expressive pet illustration carry personality.

The visual system favors open compositions and independent text, imagery and actions. Illustration supports the brand story; documentary photography helps visitors recognize the real shop. This scan records the implemented system and the approved direction in PRODUCT.md and the home surface brief.

**Key Characteristics:**

- Warm brand colors with large, quiet light surfaces.
- Weighty headings and readable, spacious supporting text.
- Open groups, restrained outlines and pill-shaped actions.
- Original identity assets and a silver-gray Weimaraner.

## Colors

### Primary

Burnt Orange (`orange`) identifies actions, highlighted heading words, bullets and small rules. Peach (`orange-light`) emphasizes the hero promise. The hero action uses its observed, slightly deeper `hero-primary` treatment; preserve that distinction when matching the existing hero.

### Neutral

Chocolate (`ink`) carries body copy and headings. Warm Sand (`sand`) and Cream Paper (`paper`) alternate large surfaces. Soft Clay (`line`) supports quiet footer rules; muted ink supports explanatory pillar copy. Cream and white variants provide readable text and outlines over the photographic hero.

**The Brand Continuity Rule.** Preserve the supplied logo and brown, orange and beige identity; do not recolor the brand into an unrelated palette.

## Typography

**Display Font:** Bricolage Grotesque Variable, sans-serif fallback.

**Body Font:** Manrope Variable, sans-serif fallback.

Heavy, compact headings establish confidence while the body face keeps longer Portuguese copy calm. Frontmatter records desktop base roles; section-specific overrides are intentional.

- **Display:** Hero heading; emphasized final line uses weight 800. Mobile uses `clamp(2.6rem,8.7vw,4.1rem)` and the narrowest breakpoint uses `2.45rem`.
- **Headline:** Section headings, with responsive section-specific clamps. The general mobile scale is `clamp(2.2rem,8vw,3.4rem)`.
- **Title:** Pillar headings; contact headings use `1.65rem`, reducing to `1.45rem` on mobile.
- **Body:** Base reading role. Hero supporting copy uses `clamp(1rem,1.4vw,1.18rem)` and a 470px maximum width.
- **Label:** Action text. Navigation uses `.85rem` and weight 600 on desktop, then `1rem` inside the mobile menu.

## Layout

The shared desktop container is capped at 1240px with 56px side gutters. At 1100px gutters reduce to 36px; at 760px they become 22px; at 380px they become 18px. Sections use generous vertical space rather than fixed heights.

The current home has five sections: hero, positioning, three commitments, location and contact. Each uses `min-height:max(100vh,100svh)` and may grow with content. This composition is a home-surface contract, not a requirement for every future screen. The footer belongs to contact.

Desktop positioning, location and contact use two columns; pillars use three open columns. At 760px these stack. Mobile pillars place a 125px illustration beside their text; the smallest breakpoint reduces that to 95px. The location photo precedes its copy on mobile.

The hero combines a continuous background and a separate foreground dog. The final cascade positions the dog at right -8%, width `min(66%,940px)` on desktop; the mobile override uses right -10% and width `min(115%,650px)`. Keep text and dog separate and avoid overlap. Do not reintroduce superseded earlier declarations as normative positions.

## Elevation & Depth

Large surfaces and pillar groups are flat. Tonal alternation, photography and illustration create depth. The mobile navigation alone uses a structural shadow (`0 14px 30px #30170e33`); the header logo has a subtle drop-shadow. These exceptions do not authorize card shadows elsewhere.

Buttons rise 2px on hover with a .2s ease transition. The dog enters over 1.1s with `cubic-bezier(.16,1,.3,1)`. Reduced-motion preferences disable animation and transitions, remove hover translation and restore automatic scrolling.

**The Open Surface Rule.** Preserve open content groups; do not wrap the home pillars or contact options in decorative cards.

## Shapes

Actions use full pill corners; the mobile menu has a gently rounded rectangle and the real storefront photo has nearly square corners. The rest of the surface stays open. Small circular bullets and short orange rules organize pillar copy without framing it.

## Components

### Buttons

Confident, compact pills with a 50px minimum height. Primary actions use orange with white text, an orange border and the darker hover token. Hero actions use the observed hero-specific shade. The outline variant is transparent at rest with a cream border, then becomes light cream with chocolate text on hover. Focus-visible uses a 3px orange outline offset by 6px; hero focus uses white. Mobile hero actions stack and have a 48px minimum height.

### Navigation

The original horizontal logo sits opposite simple text links and an outlined contact pill. At 760px a 44px toggle opens a chocolate dropdown. Its two strokes become a cross. The React implementation announces expansion, closes on selection and closes on Escape while returning focus to the toggle.

### Pillar Groups

Three illustrations introduce the commitments. Each open group contains a heading, short concept, category list and italic closing line above which a small orange rule appears. The approved premium illustration follows the Toh-inspired art direction while remaining in the existing warm palette. There are no individual category photographs or boxed pillar containers.

### Contact Options

WhatsApp and Instagram each pair a large line icon with a heading, supporting paragraph and primary action. They are independent open columns on desktop and stack on mobile. No input or form component exists in this build; do not infer a form style from this document.

### Brand and Store Images

Use the supplied horizontal logo and seal. The hero dog is a silver-gray Weimaraner with the reference proportions, dropped ears, long muzzle and elegant neck. Keep the hero background and dog as separate assets. Use the real storefront photograph for recognition; the displayed derivative conceals the printed phone strip without changing the original source.

## Do's and Don'ts

### Responsive refinements

- The header logo has no filter or shadow. Its contact action scrolls to `#contato`; the actual WhatsApp redirect remains in the contact section.
- On large screens, `HeroDog` aligns the nose to the vertical center of the “começa com” line, recalculating after font/image load and resize. Its cropped chest extends through the bottom of the hero. Small-screen composition stays below copy and buttons.
- The transparent seal stays to the left of the title at every breakpoint. Above 1100px it is 215–260px wide and taller than the three-line heading. Below that breakpoint it occupies 25% of the heading group; container-relative title sizing fills the remaining width, including on mobile. Source derivative: `public/images/selo-transparente.png`.
- On mobile each pillar's illustration spans only its heading and concept; categories and closing message span the full width below that group.
- Storefront photography fills the entire right half of the location section on desktop and the full viewport width on mobile.
- WhatsApp uses a consistent outlined chat-bubble and handset symbol, matching the Instagram icon's stroke weight.

### Do:

- **Do** preserve the supplied logo, warm palette and strong sans-serif hierarchy.
- **Do** keep text, links and illustrations independent in implementation.
- **Do** keep the hero dog distinct from the continuous background and clear of text.
- **Do** honor reduced motion and visible keyboard focus.
- **Do** use real storefront photography to help visitors recognize the shop.

### Don't:

- **Don't** turn the home pillars or contact options into decorative cards.
- **Don't** display the phone number in the interface or public storefront image.
- **Don't** replace the silver-gray Weimaraner with a golden or caramel Labrador.
- **Don't** add a feed, prices, product catalog or checkout to the approved institutional home.
