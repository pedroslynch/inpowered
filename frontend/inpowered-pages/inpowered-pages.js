// Runs in the copies of inpowered.ai pages (inpowered-*.html), before Gatsby starts.
// The page it belongs to comes from its script tag: <script src="/inpowered-pages.js" data-path="/about">.
(() => {
  const pagePath = document.currentScript.dataset.path;
  const framed = window.top !== window;
  const SESSION_KEY = "inpowered.session"; // AuthService's storage key

  // Gatsby only renders a page whose URL matches the page it was built for.
  if (location.pathname !== pagePath) {
    history.replaceState(history.state, "", pagePath + location.search + location.hash);
  }

  // Always open at the top: Gatsby restores the scroll position it saved in sessionStorage,
  // which the copies share with the app, on the previous visit to the page.
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith("@@scroll|")) sessionStorage.removeItem(key);
  }

  // Like the landing page menu: Solutions is a plain link (no dropdown) and there is no Press item.
  const style = document.createElement("style");
  style.textContent =
    ".solutions-item > :not(a) { display: none !important; }" +
    ".navbar .navbar-item:has(> a[href='/press']), .mobile-overlay-menu--nav a[href='/press'] { display: none !important; }";
  document.head.appendChild(style);

  // Signed-in user (the app's session, same origin), shown after Request a Demo like on the landing page.
  const user = signedInUser();
  if (user) {
    style.textContent +=
      ".navbar .navbar-item:has(> a[href^='https://app.inpwrd.com']), .mobile-overlay-menu--nav a[href^='https://app.inpwrd.com'] { display: none !important; }" +
      ".ip-account { display: flex; align-items: center; gap: 8px; margin-left: 12px; }" +
      ".ip-account a { display: flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; }" +
      ".ip-avatar { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%;" +
      " background: #1e6eff; color: #fff; font-size: 12px; font-weight: 600; }" +
      ".ip-who { display: flex; flex-direction: column; line-height: 1.25; }" +
      ".ip-name { font-size: 13px; font-weight: inherit; }" +
      ".ip-role { color: #eef0fc; font-size: 12px; }" +
      ".ip-account button { padding: 6px 14px; border: 1px solid rgb(255 255 255 / 0.4); border-radius: 999px;" +
      " background: transparent; color: #fff; font: inherit; font-size: 14px; cursor: pointer; }" +
      ".ip-account button:hover { background: rgb(255 255 255 / 0.1); }" +
      "@media (max-width: 1100px) { .navbar .ip-who { display: none; } }" +
      ".mobile-overlay-menu--nav .ip-account { justify-content: space-between; margin: 24px 0 0; }";

    // One account block for the desktop navbar, one for the phone menu (shown by the burger button).
    const makeAccount = () => {
      const account = document.createElement("div");
      account.className = "ip-account";
      account.innerHTML =
        '<a href="/home" aria-label="Open the sales platform"><span class="ip-avatar" aria-hidden="true"></span>' +
        '<span class="ip-who"><span class="ip-name"></span><span class="ip-role"></span></span></a>' +
        '<button type="button">Sign out</button>';
      account.querySelector(".ip-avatar").textContent = initials(user.fullName);
      account.querySelector(".ip-name").textContent = user.fullName;
      account.querySelector(".ip-role").textContent = user.role === "ADMIN" ? "Administrator" : "Seller";
      account.querySelector("button").addEventListener("click", () => {
        if (framed) {
          window.parent.postMessage({ type: "signOut" }, location.origin);
        } else {
          clearSession();
          location.assign("/login");
        }
      });
      return account;
    };
    const account = makeAccount();
    const mobileAccount = makeAccount();

    // Gatsby re-renders the navbar, so the account is added again whenever it goes missing.
    const place = () => {
      if (!account.isConnected) {
        const demo = document.querySelector(".navbar a[href='/#request-demo']");
        const item = demo && demo.closest(".navbar-item");
        if (item) item.after(account);
      }
      if (!mobileAccount.isConnected) {
        const demo = document.querySelector(".mobile-overlay-menu--nav a[href='/#request-demo']");
        if (demo) demo.after(mobileAccount);
      }
    };
    new MutationObserver(place).observe(document.documentElement, { childList: true, subtree: true });
  }

  // Copy path -> app path: the other copied pages, then the same mapping as the landing page menu.
  const APP_PATHS = [
    [/^\/about/, "/about"],
    [/^\/careers/, "/careers"],
    [/^\/home/, "/home"],
    [/^\/$/, "/"],
    [/^\/decisioningos/, "/#top"],
    [/^\/solutions|^\/#solutions-section/, "/#outcomes"],
    [/^\/case-studies/, "/#case-studies"],
    [/^\/press/, "/#results"],
    [/^\/#request-demo/, "/#demo"],
  ];


  // Menu links open the matching page of the app instead of pages that are not in the copies.
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest && event.target.closest("a[href]");
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

      const url = new URL(link.href, location.href);
      let appPath = null;
      if (url.host === "app.inpwrd.com") {
        appPath = "/login";
      } else if (url.origin === location.origin) {
        if (url.pathname.replace(/\/$/, "") === pagePath) return; // links within this page
        const match = APP_PATHS.find(([pattern]) => pattern.test(url.pathname + url.hash));
        if (!match) return; // the legal pages stay in the copy
        appPath = match[1];
      }

      event.preventDefault();
      event.stopPropagation();
      if (!appPath) {
        window.open(url.href, "_blank", "noopener"); // other sites never open inside the frame
      } else if (framed) {
        window.parent.postMessage({ type: "navigate", url: appPath }, location.origin);
      } else {
        location.assign(appPath);
      }
    },
    true,
  );

  function signedInUser() {
    for (const store of [localStorage, sessionStorage]) {
      try {
        const session = JSON.parse(store.getItem(SESSION_KEY));
        if (session && session.token && new Date(session.expiresAt).getTime() > Date.now()) return session.user;
      } catch {
        // No session in this storage.
      }
    }
    return null;
  }

  function clearSession() {
    for (const store of [localStorage, sessionStorage]) {
      try {
        store.removeItem(SESSION_KEY);
      } catch {
        // Nothing to clear.
      }
    }
  }

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  }
})();
