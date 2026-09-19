# Alem LLC — Luxury Transportation (Client Demo)

Demo website for **Alem LLC**, a women-owned luxury chauffeured transportation
company serving Virginia, D.C. & Maryland. Built from the approved Claude Design
mockup (`Alem Limo Website v2`) — pixel-identical to the design.

**Live site:** hosted on GitHub Pages from this repository.

## What's included

- Full landing page: hero with instant-quote bar, About, Services, Fleet & Rates,
  Reviews (with customer review submission), The Alem Standard, FAQ, and a
  4-step booking flow with live fare estimates and time-slot availability.
- **Team Console** (button in the footer → "Team Login", demo PIN `2259`):
  today's schedule, booking management, availability blocking, fleet rate
  editing, and review approval.
- Bookings, reviews, blocked slots and rate changes persist in the visitor's
  browser (`localStorage`) — perfect for demoing the flow end-to-end. There is
  no backend; wiring one up is a next step after client approval.

## Swapping photos

All photos live in `images/`. Replace any file (keep the same filename) and the
site picks it up — no code changes needed:

| File | Where it appears |
|---|---|
| `images/hero-limo-night.jpg` | Full-screen hero background |
| `images/fleet-sedan.jpg` | Fleet card — Premium Sedan |
| `images/fleet-suv.jpg` | Fleet card — Luxury SUV |
| `images/fleet-sprinter.jpg` | Fleet card — Executive Sprinter |
| `images/fleet-bus.jpg` | Fleet card — Shuttle & Limo Bus |
| `images/chauffeur-door.jpg` | "Small Details, Done Right" section |

One slot is intentionally left open for the client's own photo: the **About**
section ("Photo, Kidist / owner-operator with vehicle"). Add a photo by giving
the `image-slot` with `id="about-photo"` in `index.html` a
`src="images/..."` attribute, same as the other slots.

Current placeholder photos are free stock from Pexels
([license](https://www.pexels.com/license/)):
[hero](https://www.pexels.com/photo/back-of-a-black-mercedes-at-dawn-11877372/) ·
[sedan](https://www.pexels.com/photo/luxury-car-on-city-street-15535501/) ·
[SUV](https://www.pexels.com/photo/black-cadillac-escalade-parked-under-trees-in-fire-zone-23319054/) ·
[sprinter](https://www.pexels.com/photo/a-2023-black-mercedes-benz-sprinter-parked-among-palm-tree-19871521/) ·
[bus interior](https://www.pexels.com/photo/luxury-interior-of-a-premium-passenger-van-39416592/) ·
[chauffeur](https://www.pexels.com/photo/a-man-in-gray-suit-opening-the-door-of-a-black-car-8425053/)

## Changing the Team Console PIN

In `index.html`, find `data-props` on the `<script type="text/x-dc">` tag and
change the `adminPin` default (currently `2259`).

## Running locally

Any static server works:

```bash
python -m http.server 8000
```

then open http://localhost:8000. (Opening `index.html` directly as a file also
works in most browsers; a server is closer to production.)

## How it's built

- `index.html` — the complete site: markup + a small React component
  (booking/booking-console logic) in a `text/x-dc` script tag.
- `support.js` — the Claude Design runtime (loads React 18 from unpkg CDN and
  renders the page).
- `image-slot.js` — the `<image-slot>` web component used for every photo
  placeholder.

No build step, no dependencies to install.
