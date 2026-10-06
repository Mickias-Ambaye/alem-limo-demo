# Hosting & Data Guide — Alem Luxury Transportation

How to put this site on a real domain for free, and exactly what its limits
are. Written for whoever operates the site.

> **Update:** the site now has a real database mode. Follow **[SETUP.md](SETUP.md)**
> to run it on the client's own Supabase + Vercel accounts with the Squarespace
> domain. The "data constraints" section below describes **demo mode only**
> (what runs until `config.js` is filled in).

## What this site is, technically

A static website: one `index.html`, a few JavaScript files, and an `images/`
folder — no server to run. In **demo mode** there is no database: anything a
visitor or the dispatcher "saves" is stored in that person's own browser
(`localStorage`). In **live mode** the same files talk to a Supabase
database, and every constraint in the next section disappears.

---

## Going live for free

### Option A — GitHub Pages + custom domain (already running)

The site is already served from GitHub Pages at
`https://mickias-ambaye.github.io/alem-limo-demo/`. To put it on a real domain:

1. Buy the domain anywhere (Namecheap, Cloudflare, Porkbun — ~$10–15/year;
   this is the only unavoidable cost).
2. In the GitHub repo: **Settings → Pages → Custom domain** → enter
   `www.alemluxury.com` (whatever you buy) and save.
3. At your registrar, add a DNS record: **CNAME** for `www` pointing to
   `mickias-ambaye.github.io`. (For the bare domain, add the four GitHub
   Pages A records: 185.199.108.153 / 109.153 / 110.153 / 111.153.)
4. Back in GitHub Pages settings, tick **Enforce HTTPS** once the certificate
   appears (a few minutes to an hour).

Done. Every `git push` updates the live site within ~1 minute (plus up to
10 minutes of CDN cache).

**GitHub Pages free limits:** 1 GB site size (this site is ~4 MB), 100 GB
bandwidth/month soft limit (≈ several hundred thousand visits for this site),
10 builds/hour. A local limo company will never touch these.

### Option B — Vercel + custom domain

Same result with a nicer dashboard and instant cache invalidation:

1. vercel.com → sign in with GitHub → **Add New Project** → import
   `alem-limo-demo`. No build settings needed (it's static) — Deploy.
2. Project → **Settings → Domains** → add your domain → follow the DNS
   instructions it shows (one CNAME or A record).
3. Every git push auto-deploys. Preview deployments for branches are free.

**Vercel free (Hobby) limits:** 100 GB bandwidth/month, 100 deployments/day,
non-commercial-use clause on the Hobby plan — for a client's commercial site
Vercel expects the $20/month Pro plan by the letter of their terms. GitHub
Pages has no such clause, which is why **Option A is the recommendation for
this client** until there's a backend anyway.

Either way: HTTPS is automatic and free (Let's Encrypt), no server to patch,
nothing to maintain.

---

## Data constraints — read this before selling it as "done"

### 1. Every browser is its own island
Bookings, reviews, rate changes, team accounts, availability blocks, archived
trips, recorded revenue — all of it lives in the **visitor's own browser**
under localStorage key `alem_site_v5`.

- A customer's booking on their phone is **not visible** on the dispatcher's
  laptop. The dispatcher console only shows bookings made in that same
  browser.
- Two dispatchers on two computers see two different consoles.
- Nothing syncs, ever. This is the demo's fundamental limit — everything
  else is cosmetic by comparison.

### 2. The data is as durable as the browser profile
localStorage survives reloads and browser restarts, but it is erased by
"Clear browsing data", private/incognito windows discard it on close, and
iOS Safari may evict it after ~7 days of not visiting the site. Capacity is
~5 MB — roughly 10,000+ trips, so size is never the problem; *location* of
the data is.

### 3. The console login is demo-grade
Usernames and passwords (owner seed `admin` / `alem2259`) are readable in the
page source by anyone who looks. It gates the UI, not the data. Fine for a
demo; not security.

### 4. No notifications exist
"The dispatcher confirms by text" is workflow language — nothing is actually
sent. The dispatcher must open the console to see new requests (and, per #1,
only requests made in that browser).

### 5. Free community services power addresses & miles
- **Address suggestions / geocoding:** OpenStreetMap Nominatim — fair-use,
  ~1 request/second, no uptime guarantee.
- **Driving distance:** OSRM demo server — same story.
- **Email domain verification:** Cloudflare DNS-over-HTTPS — generous & free.
- **React runtime:** unpkg.com CDN.

For a demo and early real traffic these are fine; if any is briefly down the
site degrades gracefully (distance falls back to "quoted", email check fails
open). At real volume, swap geocoding/routing to a keyed provider (Google
Places / Mapbox / LocationIQ — all have free tiers that cover a limo company).

### 6. Photos
All current photos are free-license (Pexels) or generated; no attribution or
fees owed. Swap any by replacing the file in `images/` with the same name.

---

## Live mode removes constraints #1–#4 (built)

The shared database, real bcrypt-hashed team logins and shared settings are
implemented — `supabase/schema.sql` + `config.js`, see **SETUP.md**. What
remains optional:

| Piece | Service | Cost |
|---|---|---|
| SMS/email alerts to the dispatcher | Twilio (+ a small edge function) | ~$1.15/mo number + ~$0.008/SMS |
| Keyed geocoding/routing at volume | Google or Mapbox free tier | $0 at this volume |
| Daily database backups | Supabase Pro | $25/mo (free tier: export CSV weekly instead) |

---

## Go-live checklist (today, free)

- [ ] Buy domain (~$12/yr)
- [ ] GitHub repo → Settings → Pages → add custom domain
- [ ] Registrar → add CNAME (and A records for bare domain)
- [ ] Tick Enforce HTTPS
- [ ] Change the console owner password in `index.html` (`team_()` seed)
- [ ] Walk the client through constraint #1 so expectations are right
