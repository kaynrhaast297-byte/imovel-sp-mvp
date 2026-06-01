/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'components', 'lib'],
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}

export default nextConfig
