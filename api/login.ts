export default function handler(
  req: { method: string; body?: Record<string, string> },
  res: {
    status: (code: number) => { end: () => void };
    setHeader: (name: string, value: string) => void;
    redirect: (status: number, url: string) => void;
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const password = req.body?.password;
  const next = req.body?.next || '/';
  const expected = process.env.SITE_PASSWORD;

  if (!expected || password !== expected) {
    const errorUrl = next !== '/' ? `/login.html?error=1&next=${encodeURIComponent(next)}` : '/login.html?error=1';
    return res.redirect(302, errorUrl);
  }

  // Only allow relative redirects to prevent open redirect
  const destination = next.startsWith('/') ? next : '/';

  res.setHeader(
    'Set-Cookie',
    '__site_auth=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000'
  );
  return res.redirect(302, destination);
}
