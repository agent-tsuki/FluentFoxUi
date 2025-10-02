import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from specific IPs during development
  allowedDevOrigins: [
    '192.168.31.123', // Add the specific IP from the warning
    '192.168.31.*',   // Or allow entire subnet (optional)
    // Add other IPs/patterns as needed
  ],
};

export default nextConfig;
