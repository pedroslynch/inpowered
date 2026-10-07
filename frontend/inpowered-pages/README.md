# inpowered-pages

Copies of https://inpowered.ai/about and https://inpowered.ai/careers (their Gatsby build), shown full screen by the
Angular `/about` and `/careers` routes (`src/app/pages/inpowered-page`) in an iframe of `/inpowered-about.html` and
`/inpowered-careers.html`.

- `angular.json` copies this folder to the root of the build output, so `ng serve` and the Spring Boot jar
  (`classpath:/static`, see `WebConfig`) serve it from the app origin. Gatsby requests its files from root paths
  (`/page-data/…`, `/static/…`, `/app-….js`), which is why they are not in a subfolder.
- Both pages come from the same build of their site: Gatsby reloads a page whose files come from different builds,
  so copy every page again when adding one.
- Only the files these pages use are here. The videos still come from inpowered's CDN (`cdn.inpwrd.net`).
- Each `inpowered-*.html` is their page with a Content-Security-Policy that blocks analytics and trackers, form
  submissions and service workers, plus `inpowered-pages.js` (with `data-path` set to the page), which sends the
  copy's menu links to the matching pages of this app.
- `SecurityConfig` sends `X-Frame-Options: SAMEORIGIN` so the app can frame its own pages.
- For a signed-in user (the app's session in local/session storage, same origin), `inpowered-pages.js` also shows the
  user and a Sign out button after Request a Demo, like the landing page; Sign out posts `{ type: 'signOut' }` to the app.
