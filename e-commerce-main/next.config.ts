import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'dlcdnwebimgs.asus.com',
      }
    ],
  },
  // External packages for server runtime
  serverExternalPackages: ['mongoose'],
  // Stable build ID to avoid unnecessary rebuilds
  generateBuildId: async () => {
    return 'rog-ecommerce-v1';
  },
};
export default nextConfig;
