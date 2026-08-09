/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to prevent Leaflet double-init issues
  reactStrictMode: false,
  // Turbopack config (Next.js 16+)
  turbopack: {},
};

module.exports = nextConfig;
