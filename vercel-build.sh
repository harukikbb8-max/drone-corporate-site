#!/bin/bash
# Build script for Vercel Build Output API v3
# Adds basic auth edge middleware to static site

set -e

OUT=".vercel/output"

# Clean previous output
rm -rf "$OUT"

# Create static output directory
mkdir -p "$OUT/static"

# Copy all static files (exclude build artifacts)
for item in index.html pages assets; do
  if [ -e "$item" ]; then
    cp -r "$item" "$OUT/static/"
  fi
done

# Create edge middleware function
mkdir -p "$OUT/functions/_middleware.func"

cat > "$OUT/functions/_middleware.func/index.js" << 'MIDDLEWARE'
export default function middleware(request) {
  const basicAuth = request.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    if (authValue) {
      try {
        const [user, pass] = atob(authValue).split(":");
        if (user === "admin" && pass === "admin") {
          return;
        }
      } catch {}
    }
  }

  return new Response("Authentication Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
MIDDLEWARE

cat > "$OUT/functions/_middleware.func/.vc-config.json" << 'CONFIG'
{
  "runtime": "edge",
  "entrypoint": "index.js"
}
CONFIG

# Create build output config
cat > "$OUT/config.json" << 'CONFIG'
{
  "version": 3,
  "routes": [
    { "src": "/(.*)", "middlewarePath": "_middleware", "continue": true }
  ]
}
CONFIG

echo "Build complete: static files + edge middleware"
