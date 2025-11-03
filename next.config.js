/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable type checking during build for faster testing
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
