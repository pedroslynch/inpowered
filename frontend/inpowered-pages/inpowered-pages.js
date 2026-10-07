// Runs in the copies of inpowered.ai pages (inpowered-*.html), before Gatsby starts.
// The page it belongs to comes from its script tag: <script src="/inpowered-pages.js" data-path="/about">.
(() => {
  const pagePath = document.currentScript.dataset.path;

  // Gatsby only renders a page whose URL matches the page it was built for.
  if (location.pathname !== pagePath) {
    history.replaceState(history.state, "", pagePath + location.search + location.hash);
  }

  // Always open at the top: Gatsby restores the scroll position it saved in sessionStorage,
  // which the copies share with the app, on the previous visit to the page.
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith("@@scroll|")) sessionStorage.removeItem(key);
  }

  // Copy path -> app path: the other copied pages, then the same mapping as the landing page menu.
  const APP_PATHS = [
    [/^\/about/, "/about"],
    [/^\/careers/, "/careers"],
    [/^\/$/, "/"],
    [/^\/decisioningos/, "/#top"],
    [/^\/solutions|^\/#solutions-section/, "/#outcomes"],
    [/^\/case-studies/, "/#case-studies"],
    [/^\/press/, "/#results"],
    [/^\/#request-demo/, "/#demo"],
  ];

  const framed = window.top !== window;

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
})();
