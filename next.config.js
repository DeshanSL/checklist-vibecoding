/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to enable Firebase functionality
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
