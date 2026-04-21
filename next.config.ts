import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ufs.sh", // uploads (ex: uploadthing)
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // imagens públicas
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com", // imagens de user/teste
      },
      {
        protocol: "https",
        hostname: "placehold.co", // placeholder
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org", // imagens públicas
      },
    ],
  },
};

export default nextConfig;