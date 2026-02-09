import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

  // Stub Node-only modules in client bundle so @supabase/realtime-js doesn't throw .call on undefined
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const stub = path.resolve(__dirname, 'lib/browser-stub.js')
      config.resolve.fallback = {
        ...config.resolve?.fallback,
        net: stub,
        tls: stub,
        ws: stub,
      }
    }
    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.dojah.io https://widget.dojah.io https://identity.dojah.io https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://cdn.dojah.io https://widget.dojah.io https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://*.dojah.io",
              "connect-src 'self' https://api.dojah.io https://identity.dojah.io https://*.dojah.io https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com https://api.sandbox.youverify.co https://api.youverify.co",
              "img-src 'self' data: blob: https: https://*.dojah.io",
              "frame-src 'self' https://*.dojah.io https://widget.dojah.io https://*.youverify.co",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
