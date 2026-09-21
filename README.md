# Alem Luxury Transportation (Client Demo)

Demo website for **Alem**, a women-owned luxury chauffeured transportation
company serving Virginia, D.C. & Maryland. Built from the approved Claude Design
mockup (`Alem Limo Website v2`), then revised per owner feedback (per-mile
pricing, route verification map, mobile pass, no owner photo).

**Live site:** hosted on GitHub Pages from this repository.

## What's included

- Full landing page: hero with instant-quote bar, About, Services, Fleet & Rates,
  Reviews (with customer review submission), The Alem Standard, FAQ, and a
  4-step booking flow — fully phone-friendly.
- **Pricing model:** every fare is *initial fee + per-mile rate* (no hourly).
  Fleet cards show "from $X" + "$Y per mile"; the booking estimate becomes an
  exact dollar figure once the route is verified.
- **Route verification map** (booking step 3): customer addresses are geocoded
  (OpenStreetMap Nominatim), driving distance comes from OSRM, and the route
  draws on a dark Esri map with two draggable gold pins — drag to fine-tune the
  exact pickup/drop-off spot, Uber-style. Free services, no API keys.
- **Service area:** the owner sets a central hub + radius (miles) in the Team
  Console → Fleet & Rates. A verified pickup outside the radius shows an
  out-of-area notice (booking still submits; the team confirms by phone).
- **Team Console** (footer → "Team Login", demo PIN `2259`): today's schedule,
  booking management, availability blocking, per-vehicle Initial $ / $-per-mile
  editing, service-area settings, and review approval.
- Bookings, reviews, blocked slots, rates and the service area persist in the
  visitor's browser (`localStorage`, key `alem_site_v3`) — perfect for demoing
  end-to-end. There is no backend; wiring one up is a next step after client
  approval.

## Swapping photos

All photos live in `images/`. Replace any file (keep the same filename) and the
site picks it up — no code changes needed:

| File | Where it appears |
|---|---|
| `images/hero-limo-night.jpg` | Full-screen hero background |
| `images/about-interior.jpg` | About section ("What Makes Us Special") |
| `images/fleet-sedan.jpg` | Fleet card — Premium Sedan |
| `images/fleet-suv.jpg` | Fleet card — Luxury SUV |
| `images/fleet-sprinter.jpg` | Fleet card — Executive Sprinter |
| `images/fleet-bus.jpg` | Fleet card — Shuttle & Limo Bus |
| `images/chauffeur-door.jpg` | "Small Details, Done Right" section |

All photos are free stock from Pexels
([license](https://www.pexels.com/license/)):
[hero](https://www.pexels.com/photo/back-of-a-black-mercedes-at-dawn-11877372/) ·
[about interior](https://www.pexels.com/photo/black-limousine-interior-9151813/) ·
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
