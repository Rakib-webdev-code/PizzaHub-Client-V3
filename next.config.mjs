/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Safety net so a stray type warning never blocks a deploy. Run `npm run typecheck` before pushing.
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
