import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If your repo is NOT at the root domain (e.g. username.github.io/my-repo),
  // uncomment the following line and replace 'my-repo' with your repository name:
  basePath: '/table-ui',
};

export default nextConfig;
