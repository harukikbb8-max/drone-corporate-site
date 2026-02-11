export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};

export default function middleware(req) {
  const auth = req.headers.get('authorization');

  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(':');
      if (user === 'skyscope' && pass === 'drone2025') {
        return;
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="SkyScope Drone Services"',
    },
  });
}
