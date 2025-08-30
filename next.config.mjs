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
  
  // Add CSP headers to allow Dojah's Cloudflare analytics and iframe content
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.dojah.io https://static.cloudflareinsights.com https://widget.dojah.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.dojah.io https://fonts.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.dojah.io https://*.dojah.io https://static.cloudflareinsights.com https://*.supabase.co https://widget.dojah.io",
              "frame-src 'self' https://*.dojah.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
