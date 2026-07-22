import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@sentry/nextjs"],
  serverExternalPackages: ["pino", "pino-pretty"],
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  allowedDevOrigins: ["likhaverse"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  ...(process.env.SENTRY_DSN
    ? {
        sentry: {
          hideSourceMaps: false,
          widenClientFileUpload: true,
          tunnelRoute: "/monitoring",
        },
      }
    : {}),
}

export default nextConfig
