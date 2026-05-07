import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/fiber", "@react-three/drei"],
  },
  outputFileTracingRoot: path.resolve(new URL('.', import.meta.url).pathname),
};

export default nextConfig;
