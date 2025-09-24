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
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.dojah.io https://widget.dojah.io https://identity.dojah.io",
              "style-src 'self' 'unsafe-inline' https://cdn.dojah.io https://widget.dojah.io",
              "connect-src 'self' https://api.dojah.io https://identity.dojah.io https://*.dojah.io https://*.supabase.co",
              "img-src 'self' data: blob: https: https://*.dojah.io",
              "font-src 'self' https://*.dojah.io",
              "frame-src 'self' https://*.dojah.io https://widget.dojah.io",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
