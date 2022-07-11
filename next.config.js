/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  //webpack5: true,
  webpack: function (config, options) {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.stream = false;
      config.resolve.fallback.crypto = false;
      config.resolve.fallback.os = false;
      config.resolve.fallback.readline = false;
      config.resolve.fallback.ejs = false;
      config.resolve.fallback.assert = require.resolve("assert");
      config.resolve.fallback.path = false;
    }
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

module.exports = nextConfig;
