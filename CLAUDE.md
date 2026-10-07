# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`inpowered` is a sales platform inspired by the inPowered website. Backend: Spring Boot 4.1.1 (Java 17, Maven), package root `com.sales.ai.inpowered`. Frontend: Angular 22 in `frontend/`. The visual source of truth is the design system in `src/main/design/inpowered.pen` (see below).

**All UI text is in English**, on every screen, even though the team talks in Portuguese.

## Commands

```bash
docker compose up -d                       # PostgreSQL 17 on localhost:5432 (db/user/password: inpowered)
./mvnw spring-boot:run                     # API on http://localhost:8080 (needs Postgres running)
./mvnw test                                # backend tests (Testcontainers starts its own Postgres; needs Docker)
./mvnw test -Dtest=SaleApiIntegrationTests # one test class

cd frontend
npm start                                  # http://localhost:4200, proxies /api to :8080 (proxy.conf.json)
npm test -- --watch=false                  # frontend unit tests (Vitest)
npm run build
```

Demo image (Angular + API + PostgreSQL in one container, sample data recreated on every start; deployed to Render's free plan via `render.yaml`):

```bash
docker build -t inpowered-demo .
docker run --rm -p 8080:8080 --memory=512m inpowered-demo   # http://localhost:8080
```

Sample logins (from `db/seed`): `fernando.sonegheti@inpowered.ai` / `Admin@123` (ADMIN), `maria.silva@inpowered.ai` and `john.carter@inpowered.ai` / `Seller@123` (SELLER).

## Architecture

Layered backend: **controller → model → data**.
- `controller`: REST endpoints only (`/api/auth/login`, `/api/sales`, `/api/customers`, `/api/products`, `/api/sellers`, plus public `GET /api/hello`, used as health check).
- `model.entity` (JPA entities), `model.dto` (request/response records), `model.service` (business rules, transactions).
- `data`: Spring Data repositories.
- `config` (security, JWT properties, `WebConfig` serving the bundled Angular build from `classpath:/static` with an `index.html` fallback for client routes), `security` (token issuing, `AuthenticatedUser` read from the JWT), `exception` (`GlobalExceptionHandler` returns RFC 9457 `ProblemDetail`, with an `errors` map for validation failures).

- **Database**: PostgreSQL, schema owned by **Flyway** (`src/main/resources/db/migration`); Hibernate only validates (`ddl-auto: validate`). Sample data lives in `db/seed` (also a Flyway location; remove it from `spring.flyway.locations` in production). Never edit an applied migration; add a new `V<n>__*.sql`.
- **Model**: `sale` N:1 `seller`, N:1 `customer`; `sale` N:N `product` through `sale_item` (quantity + unit price at sale time). `seller.user_id` links a seller to its `app_user` login. Sale totals are computed by the service.
- **Security**: stateless JWT (HS256, Spring Security resource server). Roles `ADMIN` (everything) and `SELLER` (sales, customers, products only; sees and changes only own sales, other sellers' sales answer 404). Rules are in `SecurityConfig` (everything outside `/api/**` is public: it is the Angular app); the secret comes from `JWT_SECRET` (dev default in `application.yaml`).
- `open-in-view` is disabled: load lazy associations in the service layer (`SaleRepository` uses fetch joins).
- **Tests**: Spring Boot 4 test slices live in separate modules (`org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`, etc.); don't use Boot 3 package names. Integration tests import `TestcontainersConfiguration`.
- **Docker** (`Dockerfile`, `docker/entrypoint.sh`): builds the frontend, copies it into `static/`, builds the jar, and runs it on top of the `postgres:17` image. The entrypoint starts Postgres on localhost, waits for it, then starts the API; the server port comes from `PORT` (default 8080).
- **Frontend**: standalone components with signals, functional guards/interceptor in `frontend/src/app/core`, pages in `pages/`. Design tokens are CSS custom properties in `frontend/src/styles.scss` (same names as the `.pen` variables), shared component classes (`.btn`, `.control`, `.card`, `.table`) live there too. The public landing page (`pages/landing`, route `/`) implements `src/main/design/paginainicial.pen`; its logos and hero diagram are SVGs exported from that file into `frontend/public/landing`. Its "About Us" and "Careers" links open `/about` and `/careers` (`pages/inpowered-page`, the copy to show comes from the route data), which frame copies of inpowered.ai/about and /careers bundled from `frontend/inpowered-pages` (see its README; `angular.json` copies it to the build root, and `SecurityConfig` allows same-origin frames). The login page sits entirely on the inverse (dark) surface and overrides the semantic tokens with their dark-mode values. After sign-in (`/home`) the `Shell` (navbar + menu) wraps every page; menu items are defined in `pages/shell/shell.ts`. The signed-in app follows the inpowered.ai site look: the shell sets `--font` to Outfit, and pages use the global `.hero-band` / `.hero-inner` (night band with the site glow, title, main action), `.page-body` + `.surface` (white content rising over the band), `.line-field` (bottom-rule fields with a sky-blue label) and the `--site-*` tokens in `styles.scss`.
- **Code style**: tab indentation in Java sources and `pom.xml`; 2 spaces in the frontend.

## Design files

- `src/main/design/inpowered.pen`: the design system (below).
- `src/main/design/paginainicial.pen` (~500 KB): a capture of the inpowered.ai home page, used for the landing page. Single frame "inpowered.ai", no variables; its text uses the Outfit font, and so does the landing page (it overrides `--font`); the rest of the app keeps Lexend. Logos are vector paths whose `geometry` is scaled into each node's `width`/`height`.

## Design system (`src/main/design/inpowered.pen`)

This is a Pencil design file in JSON format, about 300 KB. Query it instead of reading it whole, e.g.:

```bash
python3 -c "import json; d=json.load(open('src/main/design/inpowered.pen')); print([c['name'] for c in d['children']])"
```

Structure:
- **`variables`** holds the design tokens. Use these names when building UI (e.g. as CSS custom properties) instead of hard-coding values.
  - Primitive colors: `indigo-*` (brand, `#0B0420`–`#6B5FD6`), `blue-*` (action, primary `blue-500` `#1E6EFF`), `violet-*`, `cyan-*`, `neutral-*`.
  - Semantic colors (`bg-page`, `bg-subtle`, `bg-inverse`, `text-heading`, `text-body`, `text-muted`, `text-placeholder`, `action-primary[-hover]`, `action-secondary-border`, `border-subtle`, `border-strong`, `card-from/via/to` gradient, `accent-glow`) take a list of values keyed by theme, `{"theme": {"mode": "light"|"dark"}}`. They reference primitives as `$name`. Both light and dark modes are defined (`themes.mode`).
  - Scales: `space-1…20` (4px base: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80), `radius-sm/md/lg/pill` (8/12/24/999), `text-xs…3xl` (13, 14, 16, 19, 24, 36, 48). The font is **Lexend** for both headings and body.
- **Top-level frames (`children`):**
  - "Design System — Components": Foundations, Buttons, Navigation, Section Heading, Partner Logo, Outcome Card, Form Controls.
  - "Page — Home": the landing page. Navbar, hero glow, Agencies (partner logos), Proven Outcomes (outcome cards), CTA, Footer.
  - "1. Login — Variants A" and "2. Login — Variants B": alternative login screen designs, e.g. split brand panel, centered card, dark glass + mosaic. The app uses "Login A — Split". The second set includes its own "Login Kit" of components.
- **Reusable components** are nodes with `"reusable": true`, used elsewhere via `"type": "ref"`. They include Button / Primary, Button / Secondary, Button / Social, Logo, Nav Link, Navbar, Section Heading, Partner Logo, Outcome Card, Input Field, Checkbox, Divider / Or, and SSO Button. Input Field and Divider / Or each exist twice: once in the main kit and once in the Login Kit.

When implementing a screen, find its frame, map every `$token` it uses to the token values, and reuse the matching component for repeated elements.
