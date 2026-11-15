---
description: Design and implement polished, original, responsive UI for
  the ZENTO electronics ecommerce frontend. Use for frontend pages,
  components, visual refinements, and design-system work. UI only unless
  the owner explicitly requests integration.
name: zento-design
---

# ZENTO Design Skill

## Mission

Build ZENTO into a distinctive, production-quality electronics shopping
experience. The owner handles backend logic and API integration; the
agent focuses on frontend presentation and usable local UI interactions.

The goal is **high-quality pages shipped consistently**, not endless
design-system work. Make sensible decisions, keep the experience
coherent, and avoid unnecessary complexity.

------------------------------------------------------------------------

## 0. Non-negotiable rules

1.  **UI first; do not integrate the backend unless explicitly asked.**
    -   Do not call APIs, use `fetch`/`axios`, change authentication
        flows, or modify backend files.
    -   Do not change API contracts, database schemas, or server logic.
    -   Use clearly named mock data under `frontend/src/mock/` when a
        page needs data.
    -   Keep mock data easy to replace with real API responses later.
2.  **Inspect before editing.** Read the relevant existing
    page/component and its styles. At minimum, inspect:
    -   `frontend/src/index.css`
    -   `frontend/src/App.css`
    -   `frontend/src/pages/home2.jsx`
    -   `frontend/src/pages/home2.css`
    -   `frontend/package.json` Also inspect the route setup and any
        components the new page will reuse. Do not assume paths or
        filenames still match this document.
3.  **Existing code is the source of truth.** Reuse the actual CSS
    variables, fonts, installed dependencies, routing conventions, and
    component patterns. If this document conflicts with the current
    code, report the conflict and follow the owner's latest direction.
4.  **Do not damage existing work.** Do not rename, delete, or rewrite
    existing pages, authentication components, context providers, route
    guards, or working functionality unless explicitly requested.
5.  **One requested page or component at a time.** Do not build every
    page, every shared component, or the entire design system in one
    task.
6.  **Do not invent product requirements.** Check the actual database
    migrations, existing backend features, and owner's instructions
    before assuming a feature, field, status, role, route, or workflow
    exists. If a detail is unknown, use a clearly labelled mock
    assumption or ask one focused question.
7.  **Responsive and accessible by default.** Support 360px, 768px,
    1024px, and 1440px; semantic HTML, keyboard access, visible focus,
    labelled icon buttons, sensible contrast, and
    `prefers-reduced-motion`.
8.  **No unnecessary dependencies.** Check `package.json` first. Prefer
    existing libraries and CSS. Ask before adding a dependency.
9.  **Do not leave fake functionality.** Local-only interactions should
    work when practical (tabs, drawers, accordions, filters, quantity
    controls, modals, sorting, and form feedback). For actions that
    require the backend, show an honest UI state and add a
    `// TODO(wire): ...` comment identifying the future integration
    point. Never pretend a real order, payment, login, or database
    update succeeded.
10. **Keep the owner in control.** Explain important design decisions
    briefly. Do not silently make broad architectural or visual changes.

------------------------------------------------------------------------

## 1. ZENTO visual direction

### Brand character

-   Premium, calm, editorial, and technology-focused.
-   It should feel like a carefully curated electronics store, not a
    generic mass-market marketplace.
-   Voice: concise, confident, honest; avoid exaggerated marketing
    claims.
-   Use whitespace and strong product imagery. Avoid clutter and
    excessive decoration.

### Signature visual language

Use these as recurring design cues, not rigid templates that every
section must contain:

-   Confident serif display headlines, with occasional italic gold
    emphasis.
-   Small uppercase, letter-spaced eyebrow labels.
-   A deliberate rhythm between dark feature panels and warm light
    sections.
-   Rounded pill controls for primary actions, navigation, filters, and
    compact labels.
-   Soft-radius cards, restrained borders, and subtle warm shadows.
-   A gold marquee or announcement strip where it serves a purpose.
-   Product photography should be prominent and consistently cropped.

Do not force every signature onto every page. A page should feel like
ZENTO while still having a layout suited to its task.

### Design tokens

First inspect the real tokens in `index.css`. The following are
**reference intentions**, not permission to overwrite existing values
blindly.

  -------------------------------------------------------------------------
  Token                   Intended role           Approximate reference
  ----------------------- ----------------------- -------------------------
  `--ink`                 Dark backgrounds and    `#0f0d0a`
                          primary text            

  `--ink-soft`            Dark panels and         `#1b1610` to `#24190f`
                          elevated dark surfaces  

  `--cream`               Main light background   `#f7f5f0`

  `--white`               Card surfaces           `#ffffff`

  `--gold`                Accent, selected        `#b5832f`
                          controls, prices        

  `--gold-light`          Highlights and          `#e3c796`
                          dark-surface emphasis   

  `--muted`               Secondary text on light `#6b6560`

  `--muted-on-dark`       Secondary text on dark  `#a9a39a`

  `--line`                Subtle light-surface    `rgba(15,13,10,.08)`
                          borders                 

  `--line-on-dark`        Subtle dark-surface     `rgba(255,255,255,.08)`
                          borders                 
  -------------------------------------------------------------------------

Rules: - Reuse existing tokens. If a token is missing and genuinely
needed, add it centrally rather than scattering hardcoded hex values. -
Avoid highly saturated status colors. Use restrained success, warning,
and danger tones. - Ensure gold text on cream has sufficient contrast;
use a darker gold or reserve lighter gold for larger text and decorative
accents. - Do not introduce a new accent color for an individual page.

### Typography

-   Display/headings: Playfair Display or the serif already used by the
    project.
-   Body and interface: Inter or the existing sans-serif.
-   Headings: compact line-height, deliberate hierarchy, and responsive
    sizing.
-   Eyebrows: small uppercase labels with restrained letter spacing.
-   Prices: clear and easy to compare; decorative typography must not
    reduce readability.
-   Logo: preserve the existing ZENTO wordmark treatment.

Do not load duplicate fonts or add external font dependencies without
checking the existing setup.

### Shape, spacing, and motion

-   Pills: fully rounded.
-   Cards: approximately 16--20px radius.
-   Large feature panels: approximately 24--28px radius.
-   Inputs: approximately 12px radius or pill-shaped when consistent
    with the design.
-   Use a consistent spacing scale around 4 / 8 / 12 / 16 / 24 / 32 / 48
    / 72 / 96px.
-   Main content width: around 1200px unless the existing layout
    establishes another standard.
-   Use soft, restrained shadows. On dark surfaces, prefer subtle
    borders or inner highlights.
-   Keep motion purposeful: quick hover feedback, modest transitions,
    and restrained entrance animation. Respect reduced-motion
    preferences.

------------------------------------------------------------------------

## 2. Design process: ship one page at a time

For each requested page or component, follow this loop:

### A. Inspect

-   Read the existing page, styles, routing, shared components, and
    tokens relevant to the task.
-   Check whether a similar component already exists before creating
    another.
-   Check the real feature/schema context if the page depends on backend
    data.
-   Identify what must remain untouched.

### B. Plan briefly

Before coding, state: - What files you expect to create or edit. - Which
existing components/tokens you will reuse. - The proposed page structure
and one distinctive design idea. - Any assumptions caused by missing
data or requirements.

Do not write a long design essay. If the task is clear, make reasonable
decisions and proceed without asking unnecessary questions.

### C. Implement

-   Build the complete page experience, not just a static hero or a
    collection of empty cards.
-   Reuse existing components where appropriate.
-   Create a new shared component only when it is genuinely reusable and
    needed now.
-   Keep page-specific styles close to the page/component.
-   Use mock data in `src/mock/` only where needed.
-   Make local interactions functional where practical.
-   Keep code readable and consistent with the repository.

### D. Verify

-   Run the frontend using the project's existing scripts.
-   Check the page at 360px, 768px, 1024px, and 1440px.
-   Check empty, populated, loading, and error states when relevant to
    the page.
-   Check hover, focus, active, disabled, and validation states for
    controls that use them.
-   Check keyboard navigation, reduced motion, image sizing, and
    horizontal overflow.
-   Run the available lint/build checks. Do not claim a check passed if
    it was not run.

### E. Report and record

At the end, give a concise summary: - Files created/modified. - What was
implemented. - Local interactions and states supported. - Tests/checks
actually run and their results. - Any assumptions, TODOs, or owner
decisions still needed. - One or two meaningful design improvements
made.

Append a progress-log entry. Do not rewrite previous entries or mark
work complete if it has not been verified.

------------------------------------------------------------------------

## 3. Shared component strategy

Build shared UI progressively. Do **not** create the entire component
inventory before building pages.

Potential shared components, only when needed:

-   Layout: `Navbar`, `Footer`, `PageShell`, `Breadcrumbs`,
    `PageHeader`.
-   Form: `Input`, `Select`, `Textarea`, `Checkbox`, `RadioCard`.
-   Feedback: `Badge`, `Toast`, `Skeleton`, `EmptyState`.
-   Interaction: `Modal`, `Drawer`, `Tabs`, `Accordion`, `Dropdown`.
-   Commerce: `QuantityStepper`, `RatingStars`, `ProductCard`,
    `Pagination`.
-   Account/admin: `Avatar`, `SectionCard`, `Table`, `Stepper/Timeline`.

Before creating one: 1. Search for an existing equivalent. 2. Decide
whether it will be reused by more than one page. 3. Keep its API small
and avoid speculative props. 4. Do not generalize a one-off design just
to make it reusable.

Use PascalCase for React components. Keep CSS co-located where that
matches the repository. Use feature-prefixed class names to avoid
collisions. Avoid inline style objects except for genuinely dynamic
values.

------------------------------------------------------------------------

## 4. Existing home page

The current home page is recorded as `home2.jsx` in the progress log.
Inspect the actual files before making changes.

Known items to inspect if the home page is touched: - Footer social
icons may render as default-blue text; use consistent icons and on-brand
hover states. - Product and hero image areas may still contain
placeholders; use available assets where possible and provide a
deliberate fallback. - `Home.jsx` and `home2.jsx` naming may be
inconsistent. Do not rename either without permission.

Do not use these known issues as a reason to modify the home page during
unrelated work.

------------------------------------------------------------------------

## 5. Frontend structure

The following is a suggested organization, not a mandate to restructure
the repository:

``` text
frontend/src/
  components/
    ui/          # shared primitives, added progressively
    layout/      # navbar, footer, page shell, route layout
    auth/        # existing authentication UI
    products/
    cart/
    wishlist/
    orders/
    addresses/
    reviews/
    account/
    delivery/
    admin/
  pages/
  mock/
  styles/
```

Follow the structure that already exists. Do not move files just to
match this diagram.

------------------------------------------------------------------------

## 6. Page briefs

These are design starting points, not immutable wireframes. Adapt the
layout to the real requirements, actual data, and existing visual
system. Only build the page the owner requests.

For every page, include the relevant states: loading, empty, error, and
populated. Do not force irrelevant states onto simple informational
pages.

### 6.1 Shop (`/shop`)

-   Clear page heading, eyebrow, and product result count.
-   Category and brand filters; price and availability filters only if
    supported by the product data.
-   Desktop filter sidebar; mobile filter drawer or sheet.
-   Sort control and responsive product grid.
-   Reuse the shared product card if one exists.
-   Active filter chips and a clear-filters action.
-   Consider a compact brand strip, comparison tray, or sticky filter
    summary only if it improves shopping.

### 6.2 Product detail (`/products/:id`)

-   Breadcrumbs and a clear product identity.
-   Product gallery and thumbnails; use real available product assets or
    a deliberate fallback.
-   Buy panel with brand, title, price, stock, quantity, and primary
    action.
-   Show variants, ratings, warranty, shipping, or returns only when
    those features/data are actually supported.
-   Product information and specifications in readable sections.
-   Related products only if the app has a meaningful way to supply
    them.
-   Mobile layout should keep the main purchase action easy to reach.

### 6.3 Cart (`/cart`)

-   Clear item list and order summary.
-   Product image, name, unit price, quantity, line total, and remove
    action.
-   Show shipping/discount calculations only when their rules are
    defined; otherwise label values as mock examples.
-   Useful empty-cart state and a route back to shopping.
-   Mini-cart drawer can be added to the navbar when the cart UI is
    built.

### 6.4 Checkout (`/checkout`)

-   Make the steps obvious without making the process feel long.
-   Address selection and add-address form.
-   Delivery choices and payment methods must reflect the actual
    supported options; inspect migrations/backend before naming them.
-   Order review with a clear total and place-order action.
-   Include a success screen as a visual state, but never claim a real
    order was placed in a UI-only implementation.

### 6.5 Wishlist (`/wishlist`)

-   Product grid with clear remove and add-to-cart affordances.
-   Item count and useful empty state.
-   Share-list or price-drop features only if they are in scope.

### 6.6 Orders list (`/account/orders`)

-   Readable order cards or table, with order reference, date, status,
    total, and details action.
-   Status filters must use actual status values.
-   Include search/date filters only if useful and supported by the
    intended experience.

### 6.7 Order detail (`/account/orders/:id`)

-   Order reference, date, and current status.
-   Status timeline based on actual status-history values.
-   Items, totals, delivery details, payment details, and address where
    supported.
-   Invoice, cancel, return, or support actions only if those workflows
    exist or are explicitly planned.

### 6.8 Addresses (`/account/addresses`)

-   Address cards with title, recipient/contact details, address lines,
    and default indicator.
-   Add/edit form in a modal or dedicated panel.
-   Make the default-address action understandable.
-   Include empty, validation, and delete-confirmation states.

### 6.9 Account / profile (`/account`)

-   Account navigation that adapts to mobile.
-   Profile details and edit form.
-   Security UI only for actual planned account-security capabilities.
-   Avoid a large dashboard of meaningless statistics.

### 6.10 Notifications (`/account/notifications`)

-   Build only if notifications are in the actual product scope.
-   Grouped list, unread treatment, and empty state.
-   Use actual notification types if defined; do not invent backend
    enums.

### 6.11 Brands and categories

-   Brand directory with logo/wordmark treatment and product count only
    if count data is available.
-   Category cards that help users navigate the catalog.
-   Brand/category filtered shop views should feel connected to the shop
    page.

### 6.12 Delivery dashboard (`/delivery`)

-   Build only for the actual delivery role and workflow.
-   Show assigned deliveries, customer/address information, and
    available status actions.
-   Use large touch targets and a mobile-first layout.
-   Status names and transitions must come from the real application
    rules.

### 6.13 Admin (`/admin`)

-   Build only when requested.
-   Prioritize operational clarity: navigation, useful KPIs, searchable
    tables, and clear forms.
-   Use actual roles, product/order fields, and statuses. Avoid invented
    metrics.

### 6.14 System pages

-   404, 500, access denied, offline, or maintenance pages when needed.
-   Keep them visually related to ZENTO, concise, and helpful.
-   Do not create all system pages pre-emptively.

------------------------------------------------------------------------

## 7. Navbar and shared layout

Inspect the current navbar before changing it.

Possible elements, depending on the actual app scope: - Logo and primary
navigation. - Search, wishlist, and cart icons. - Guest actions: sign in
/ sign up. - Authenticated variant: account/avatar menu. - Notification
icon only if notifications are part of the product. - Mobile navigation
drawer with keyboard-friendly open/close behavior.

Create or reuse a shared page shell only if the current app structure
benefits from it. Avoid duplicating navbar/footer markup across pages.

------------------------------------------------------------------------

## 8. Quality checklist

Before calling a page done:

-   [ ] Reuses existing design tokens and components where appropriate.
-   [ ] Has a clear visual hierarchy and a layout suited to the page's
    task.
-   [ ] Has one memorable, purposeful design detail---not decoration for
    decoration's sake.
-   [ ] Works at 360 / 768 / 1024 / 1440px.
-   [ ] No unintended horizontal overflow or major layout shift.
-   [ ] Interactive controls have hover, focus, active, and disabled
    states where relevant.
-   [ ] Keyboard navigation and accessible labels are present.
-   [ ] Text and controls have sufficient contrast.
-   [ ] Reduced-motion preferences are respected.
-   [ ] Relevant loading, empty, error, and populated states are
    covered.
-   [ ] Mock data is clearly separated from application logic.
-   [ ] Backend-dependent actions are not falsely represented as
    completed.
-   [ ] No unnecessary dependencies or unrelated refactors.
-   [ ] Available lint/build checks were run and results reported.
-   [ ] Progress log was appended accurately.

------------------------------------------------------------------------

## 9. Progress log

Append new entries; preserve previous history. Update status only after
implementation and verification.

  -----------------------------------------------------------------------------
  Date           Author         Page/component   Status         Notes / next
                                                                action
  -------------- -------------- ---------------- -------------- ---------------
  2026-11-09     Owner          Home             Done           Hero, marquee,
                                (`home2.jsx`)                   collection
                                                                grid,
                                                                members-only,
                                                                testimonials,
                                                                newsletter,
                                                                footer.
                                                                Inspect/fix
                                                                footer social
                                                                icons and image
                                                                placeholders if
                                                                the home page
                                                                is revisited.

                                Shop             Done           Responsive
                                                                database catalog,
                                                                local filters,
                                                                sort, saved
                                                                pieces, and bag
                                                                feedback.

                                Product detail   Todo           

                                Cart + mini-cart Todo           

                                Checkout         Todo           

                                Wishlist         Todo           

                                Orders list /    Todo           
                                detail                          

                                Addresses        Todo           

                                Account /        Todo           
                                profile                         

                                Notifications    Todo           

                                Brands /         Todo           
                                categories                      

                                Delivery         Todo           
                                dashboard                       

                                Admin            Todo           

                                System pages     Todo           
  -----------------------------------------------------------------------------

### Progress entry — 2026-11-15

- **Addresses (`/account/addresses`) — Done:** Added a protected, responsive
  customer address book with schema-aligned local fixtures, saved-address
  overview, account contact details, default-address treatment, add/edit
  validation, delete confirmation, and local default selection. The address
  form uses only `title`, `street`, `city`, `postal_code`, `country`,
  `phone_number`, and `is_default`; recipient name and email are read from
  the signed-in account because they are not address columns. Existing account
  navigation and cart control patterns are preserved, and all address
  mutations are identified as preview-only. Responsive browser verification
  and frontend checks are recorded after completion. TODO: wire the existing
  authenticated GET/POST/PATCH/DELETE address endpoints when requested.

------------------------------------------------------------------------

## 10. Starting a new agent session

1.  Read this skill file.
2.  Read the current progress log.
3.  Inspect the relevant source files, tokens, routes, and reusable
    components.
4.  Confirm the exact page/component the owner wants to work on.
5.  Check actual schemas and existing feature support before assuming
    data or workflows.
6.  Briefly state the plan and then implement that one task.
7.  Run the app and the available checks; inspect responsive layouts.
8.  Append the progress log and report files, results, assumptions, and
    remaining wiring work.

**Default behavior:** be decisive, practical, and design-focused. Ask
only when a missing decision would materially change the result. Ship a
polished page, then move to the next one.

### Progress entry — 2026-11-11

- **Account / Profile (`/account`) — Done:** Added a protected, responsive
  personal account dashboard using schema-aligned sample profile values
  (first name, last name, email, phone number, and role). Profile editing
  validates locally and clearly reports that changes are a preview only;
  no profile API is called. Reused the existing auth context's logout
  action and cart button, added an Account entry in the signed-in Shop
  header, and kept Orders/Addresses navigation on valid in-page anchors
  with honest notices because those customer frontend pages do not exist.
  Omitted account creation date and active status because the current
  session response does not expose them. Browser checks verified local
  edit/validation, anchors, sign-out navigation, and no horizontal overflow
  at 360/768/1024/1440px. Targeted ESLint and production build passed. The
  build retains the existing `LoginForm.css` LightningCSS `:global(svg)`
  warning. TODOs: wire profile updates and build customer Orders and
  Addresses pages only when requested.

### Progress entry — 2026-11-09

- **Shop (`/shop`) — Done:** Added a responsive, mock-data catalog with a
  dark editorial collection feature, filters, sorting, search, saved-piece
  toggles, and local bag feedback. Product/category/brand/status fields
  follow the inspected PostgreSQL schema. At 360/768/1024/1440px there was no
  horizontal overflow and all eight original mock product images loaded.
  Shop/route targeted ESLint and production build passed. Full lint still
  reports two existing `AuthContext.jsx` errors.
- **Shop API wiring — Done:** Replaced product/category/brand mock imports
  with the existing public catalog endpoints and primary product-image
  endpoint. Added loading, error/retry, empty, currency-agnostic price, and
  unavailable-image states. Verified the live API data, filters, retry, and
  responsive layouts at 360/768/1024/1440px. Bag and saved-piece actions
  remain local UI only.
- **Product Detail (`/products/:id`) — Done:** Added a responsive mock-only
  detail page for seeded product IDs 1–4, with image switching/lightbox,
  stock-limited quantity, local wishlist/bag feedback, price treatment,
  labeled sample specifications, not-found UI, and related product links.
  Added Shop product-title links and category breadcrumb filtering. Verified
  gallery/lightbox, wishlist/bag, quantity cap, unknown ID, Shop/related
  navigation, and no horizontal overflow at 360/768/1024/1440px. Targeted
  ESLint and production build passed. Full lint still reports the two
  pre-existing `AuthContext.jsx` errors; build retains the existing
  `LoginForm.css` LightningCSS `:global(svg)` warning.
- **Product Detail API wiring — Done:** Replaced product fixtures with
  requests to the existing product, product-image, category, brand, and
  related-products endpoints. The Shop card image and title now navigate to
  the detail route. Removed unsupported mock discount/specification values;
  loading, retry, API error, missing product, and unavailable-image states
  use the live response. Verified with the local API and browser navigation.
- **Cart page and mini-cart — Done:** Added a shared cart provider and hook
  with `localStorage` persistence, stock-limited quantity controls, item
  removal, clear-cart confirmation, and synchronized subtotal/counts across
  Shop, Product Detail, the header, `/cart`, and the mini-cart drawer. The
  drawer closes by button, backdrop, or Escape and locks background scrolling.
  The cart page includes populated and empty states, order summary, and a
  clear checkout placeholder; no backend or payment flow was added. Browser
  checks covered adding live Shop data, totals, quantity changes, removing
  and clearing items, refresh persistence, drawer close behavior, and
  responsive layouts at 360/768/1024/1440px with no horizontal overflow.
  Targeted ESLint, production build, and `git diff --check` passed. Full lint
  still reports the two pre-existing `AuthContext.jsx` errors; the production
  build retains the existing `LoginForm.css` LightningCSS `:global(svg)`
  warning.
- **Cart database wiring — Done:** Connected signed-in cart reads, additions,
  quantity changes, removals, and clear-cart actions to the existing
  authenticated PostgreSQL cart endpoints. Guest carts remain local and are
  merged idempotently into the account cart on sign-in; sync/API errors are
  shown with a retry action. The cart response now includes brand, category,
  and primary image data, and the backend has an authenticated clear-items
  route. Verified the local database connection, cart query syntax, backend
  route authentication gate (401 without a session in a fresh Express
  instance), guest add-to-cart UI, targeted ESLint, production build, and
  backend syntax. The already-running backend process predates the new clear
  endpoint and must be restarted before that endpoint is available.
  Authenticated cart writes could not be exercised because no logged-in
  session was available.
- **Checkout (`/checkout`) — Done:** Added a responsive three-step flow for
  delivery address, payment selection, and order review. Reuses the existing
  cart context and bag button; address fixtures and the $8 delivery estimate
  are explicitly mock-only. Payment choices match the schema enum
  (`CASH_ON_DELIVERY`, `CREDIT_CARD`, `PAYPAL`); no customer-selectable
  delivery service or payment endpoint exists, so neither is represented as
  operational. Address selection/creation, schema-aligned form validation,
  payment selection, step navigation, and a no-order/no-payment preview notice
  work locally. Verified at 360/768/1024/1440px with no horizontal overflow,
  including address validation and the review flow. Targeted ESLint and
  production build passed. Full lint still reports the two pre-existing
  `AuthContext.jsx` errors; build retains the existing `LoginForm.css`
  LightningCSS `:global(svg)` warning. TODOs: wire address reads/writes,
  define customer delivery pricing/options, and connect order/payment flows
  only when their backend support is ready.
