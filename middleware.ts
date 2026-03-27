export default function middleware(request: Request) {
  const url = new URL(request.url);

  // Don't protect the login page, login API, or static assets
  if (
    url.pathname === '/login' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.\w+$/)
  ) {
    return;
  }

  // Allow through if auth cookie is set
  const cookie = request.headers.get('cookie') || '';
  if (cookie.includes('__site_auth=1')) {
    return;
  }

  // Redirect to login, preserving the original URL
  const login = new URL('/login', url.origin);
  if (url.pathname !== '/') {
    login.searchParams.set('next', url.pathname + url.search);
  }
  return Response.redirect(login, 302);
}
