(function () {
  const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "::1";

  const STAGING_BACKEND = "https://genco-backend-staging.sajarotunkasim.workers.dev";
  const LOCAL_WRANGLER = "http://127.0.0.1:8787";
  // ?backend=staging → pakai backend deploy meski di localhost (untuk testing sebelum deploy ke GitHub Pages)
  const useStagingFromLocal = typeof URLSearchParams !== "undefined" && new URLSearchParams(location.search).get("backend") === "staging";
  const BACKEND_URL = (isLocal && !useStagingFromLocal)
    ? LOCAL_WRANGLER
    : STAGING_BACKEND;
  window.API_BASE_URL = BACKEND_URL;

  // Backwards-compatible fallbacks: presets & AI pakai backend ini bila user belum set di Settings.
  try {
    window.APP_CONFIG = window.APP_CONFIG || {};
    if (!window.APP_CONFIG.backendURL) window.APP_CONFIG.backendURL = BACKEND_URL;
  } catch (e) {}

  try {
    window.AI = window.AI || {};
    if (!window.AI.backendURL) window.AI.backendURL = BACKEND_URL;
  } catch (e) {}
})();