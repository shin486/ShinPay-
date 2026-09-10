/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    // node:sqlite is a built-in module; don't bundle it
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        'node:sqlite': 'commonjs node:sqlite',
      });
    }
    return config;
  },
};

module.exports = nextConfig;