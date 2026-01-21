/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ignore data-gr-ext-installed hydration mismatches from Grammarly
    reactStrictMode: true,
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Allows all paths from this domain
      },
      {
        protocol: 'https',
        hostname: 'www.tachpae.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tachpae-planner-upload.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  };
  
export default nextConfig;
