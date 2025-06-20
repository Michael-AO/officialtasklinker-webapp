/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this to ensure we're using App Router consistently
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

export default nextConfig
