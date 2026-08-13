import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin uses native/optional deps that must not be bundled by Next.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
