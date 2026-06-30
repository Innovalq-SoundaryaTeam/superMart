# SuperMart — Weekly Offers Website

A static, front-end-only website for a supermarket, built around weekly
deals, store locator, loyalty card sign-up, and a blog.

## Tech Stack
- HTML5 (semantic tags)
- CSS3 + Bootstrap 5.3.3 (via CDN)
- CSS variables for theming (light/dark + RTL)
- Google Fonts: Nunito (headings) + Open Sans (body)
- Font Awesome 6.5.2 icons (via CDN)
- Vanilla JavaScript (ES6+) — dark mode toggle, offer filtering,
  sorting, pagination demo, form validation, countdown timer
- No backend / no build step required

## Folder Structure
```
supermarket/
├── assets/
│   ├── css/
│   │   ├── style.css       (base styles + layout + responsive)
│   │   ├── dark-mode.css   (dark theme overrides)
│   │   └── rtl.css         (right-to-left layout support)
│   ├── js/
│   │   ├── main.js
│   │   └── plugins/        (reserved for future third-party scripts)
│   ├── images/             (reserved for local image assets)
│   └── fonts/              (reserved for self-hosted fonts)
├── pages/
│   ├── index.html
│   ├── offers.html
│   ├── categories.html
│   ├── store-locator.html
│   ├── loyalty-card.html
│   ├── about.html
│   ├── blog.html
│   ├── contact.html
│   ├── 404.html
│   └── coming-soon.html
├── documentation/
│   ├── installation-guide.txt
│   ├── customization-guide.txt
│   └── credits.txt
├── robots.txt
├── sitemap.xml
└── README.md
```

## Running the Site
No build tools needed. Open `pages/index.html` directly in a browser, or
serve the project root with any static server, e.g.:

```
python3 -m http.server 8000
```
then visit `http://localhost:8000/pages/index.html`.

## Key Features
- **Dark / Light Mode** — toggle button in the navbar; choice is saved in
  `localStorage` and respects the OS `prefers-color-scheme` on first visit.
- **RTL Support** — add `dir="rtl"` to the `<html>` tag to mirror layout
  (rtl.css handles spacing, alignment, and icon direction).
- **Responsive** — mobile (<640px), tablet (640–1024px), desktop
  (1024–1280px), large (>1280px) breakpoints.
- **Accessibility** — semantic landmarks, skip-to-content link, visible
  focus states, labelled form fields, `aria-pressed` states on toggles.
- **Form Validation** — client-side validation with inline error messages
  on the contact form, loyalty sign-up form, newsletter forms, and store
  search.
- **SEO** — unique title/description per page, one `<h1>` per page, image
  `alt` text, `GroceryStore` JSON-LD on the homepage, `sitemap.xml` and
  `robots.txt` at the project root.

See `documentation/installation-guide.txt` and
`documentation/customization-guide.txt` for setup and theming details.
