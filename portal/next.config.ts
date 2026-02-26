import { config } from "dotenv"
import { resolve } from "node:path"
import type { NextConfig } from "next"

config({ path: resolve(__dirname, "../.env") })

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: resolve(__dirname, ".."),
  transpilePackages: ["@edgeos/utils", "@edgeos/api-client"],
  images: {
    remotePatterns: [
      {
        hostname: "simplefi.s3.us-east-2.amazonaws.com",
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
