# Alem Luxury Transportation (Client Demo)

Demo website for **Alem**, a women-owned luxury chauffeured transportation
company serving Virginia, D.C. & Maryland. Built from the approved Claude Design
mockup (`Alem Limo Website v2`), then revised per owner feedback (per-mile
pricing, route verification map, mobile pass, no owner photo).

**Live site:** hosted on GitHub Pages from this repository.

## What's included

- Full landing page: hero with instant-quote bar, About, Services, Fleet & Rates,
  Reviews (with customer review submission), The Alem Standard, FAQ, and an
  Uber-style booking flow — fully phone-friendly.
- **Pricing model:** every fare is *initial fee + per-mile rate* (no hourly).
  Fleet cards show "from $X" + "$Y per mile"; the estimate becomes an exact
  dollar figure once the route is confirmed on the map.
- **Booking flow (Lyft/Uber pattern):** trip & vehicle → date + free-form time
  (validated against business rules) → structured addresses (street / city /
  state / ZIP) with live location suggestions as you type → **confirm the
  pickup pin** zoomed to street level → **confirm the drop-off pin** → full
  route + total review → Request Ride. Flight number only appears for Airport
  Transfer trips. Phone (10-digit) and a real email are required; name is
  optional. Maps: Esri dark tiles with place labels, Nominatim geocoding, OSRM
  driving distance — all free, no API keys.
- **Dispatcher review:** every request lands as "new" in the console; the
  customer is told the dispatcher accepts each ride by text before it's final.
- **Booking rules** (Console → Availability): dispatch hours, number of cars
  (capacity per 2-hour window), minimum notice in hours (no
  ride-in-10-minutes requests), how far ahead customers can book, and per-hour
  blocking per day.
- **Service area** (Console → Fleet & Rates): central hub + radius; verified
  pickups outside it get an out-of-area notice.
- **Team sign-in:** registered phone number (or email) + one-time 6-digit code,
  Uber-style. The owner invites/removes members in Console → Team. **Demo
  mode:** a static site can't send SMS/email, so the code displays on the
  sign-in screen with a clear notice — production wires Twilio (SMS) or an
  email service. Owner seed account: (240) 595-2259.
- Bookings, reviews, rules, rates, team and the service area persist in the
  visitor's browser (`localStorage`, key `alem_site_v4`) — perfect for demoing
  end-to-end. There is no backend; wiring one up (real SMS, shared bookings)
  is the next step after client approval.

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

## Team Console access

Footer → "Team Login" → enter a registered phone number (or email) → enter the
6-digit one-time code. The seeded owner account is **(240) 595-2259**; invite
or remove team members in Console → Team. In this demo the code displays on
the sign-in screen (no SMS service is connected); the seeded owner account
lives in `team_()` in `index.html` if you need to change it.

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
