import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets other devices on the local network reach the dev server via its
  // LAN IP (e.g. http://192.168.0.19:3000) without Next.js's dev-mode
  // cross-origin guard rejecting the requests. Update this if the machine's
  // local IP changes (check with `ipconfig`).
  allowedDevOrigins: ["192.168.0.19"],
  // pdf-parse (via pdfjs-dist) resolves its worker file relative to its own
  // module path at runtime; bundling it into Turbopack's server chunks
  // breaks that resolution ("Setting up fake worker failed: Cannot find
  // module .../pdf.worker.mjs"). Excluding it from bundling makes Next.js
  // `require`/`import` it natively instead, so the worker path stays intact.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  // Prisma's client is generated to a custom path (src/generated/prisma,
  // not node_modules), so Next.js's automatic file tracer doesn't reliably
  // pick up its native query-engine binary for the serverless function
  // bundle on Vercel — without this, every route touching the database
  // fails at runtime with "could not locate the Query Engine".
  outputFileTracingIncludes: {
    // "/*" only matches single-segment routes (e.g. /login), not nested
    // ones like /api/auth/register — "/**" is needed to match at any depth.
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
