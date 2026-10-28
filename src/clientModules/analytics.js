// Plausible analytics wiring for open-control-plane.io, aligned with gardener.cloud.
// Cookieless: no per-user session chaining, no persistent identifiers, no PII.
// Registered via `clientModules` in docusaurus.config.ts; 404s are reported from src/theme/NotFound/Content.
import { init } from '@plausible-analytics/tracker';

/**
 * Unify page URLs sent to Plausible to the gardener convention (always a trailing slash),
 * so `/docs`, `/docs/`, `/docs.html` and `/docs/index.html` do not split metrics.
 * Docusaurus leaves `trailingSlash` unset here, so GitHub Pages serves both variants.
 */
export function normalizeEventUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    parsed.pathname = parsed.pathname.replace(/(\/index)?\.html$/, '');
    if (!parsed.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(parsed.pathname)) {
      parsed.pathname += '/';
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

// Client modules are also evaluated during SSR; the tracker is browser-only.
if (typeof window !== 'undefined') {
  init({
    domain: 'open-control-plane.io',
    // GitHub Pages has no proxy, so events go to the default https://plausible.io/api/event
    autoCapturePageviews: true,
    outboundLinks: true,
    transformRequest: (payload) => ({
      ...payload,
      u: normalizeEventUrl(payload.u),
    }),
  });
}
