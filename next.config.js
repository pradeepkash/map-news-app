/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack caching in development to avoid ENOENT errors on Windows
      config.cache = false;
    }
    return config;
  }
}

module.exports = nextConfig
