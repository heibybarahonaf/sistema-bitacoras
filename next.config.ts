import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['nodemailer']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('nodemailer');
    }
    return config;
  },
};

export default nextConfig;
