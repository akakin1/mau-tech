const pageRoutes = new Set(__PAGE_ROUTES__);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const legacy = /^\/blog\/(?:web|gadget|camera|other)\/([^/]+)\/?$/.exec(url.pathname);
    if (legacy) {
      url.pathname = '/blog/' + legacy[1];
      return Response.redirect(url.toString(), 301);
    }
    if (/^\/works\/?$/.test(url.pathname)) {
      url.pathname = '/';
      return Response.redirect(url.toString(), 307);
    }
    // Keep original clean URLs while serving their unchanged Next.js export.
    let pathname = url.pathname;
    try { pathname = decodeURIComponent(pathname); } catch {}
    if (pathname !== '/' && pathname.endsWith('/') && pageRoutes.has(pathname.slice(0,-1))) {
      url.pathname = pathname.slice(0,-1);
      return Response.redirect(url.toString(), 308);
    }
    if (pageRoutes.has(pathname)) {
      // Store HTML behind a non-HTML asset key so the host cannot impose its
      // own 307 canonicalization before the original 301/308 routing runs.
      url.pathname = pathname === '/' ? '/_pages/index.txt' : '/_pages' + pathname + '.txt';
      const response = await env.ASSETS.fetch(new Request(url.toString(), request));
      const headers = new Headers(response.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      return new Response(response.body, {status:response.status,headers});
    }
    return env.ASSETS.fetch(new Request(url.toString(), request));
  }
};
