(function () {
  const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "::1";

  const PRODUCTION_BACKEND = "https://genco-backend.sajarotunkasim.workers.dev";
  const STAGING_BACKEND = "https://genco-backend-staging.sajarotunkasim.workers.dev";
  const LOCAL_WRANGLER = "http://127.0.0.1:8787";
  // Query override:
  // ?backend=local   -> force local wrangler
  // ?backend=staging -> force staging worker
  // ?backend=prod    -> force production worker
  const backendParam = typeof URLSearchParams !== "undefined"
    ? String(new URLSearchParams(location.search).get("backend") || "").toLowerCase()
    : "";
  const forcedBackend = backendParam === "local"
    ? LOCAL_WRANGLER
    : backendParam === "staging"
      ? STAGING_BACKEND
      : backendParam === "prod" || backendParam === "production"
        ? PRODUCTION_BACKEND
        : "";

  const BACKEND_URL = forcedBackend || (isLocal ? LOCAL_WRANGLER : PRODUCTION_BACKEND);
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
