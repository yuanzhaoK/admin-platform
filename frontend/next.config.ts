import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 启用压缩
  compress: true,

  // 优化图片
  images: {
    domains: ["localhost", "47.111.142.237"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 启用SWC优化
  swcMinify: true,

  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ["lucide-react", "@apollo/client"],

    // 启用TurboPack
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // 开发模式配置
  ...(process.env.NODE_ENV === "development" && {
    webpack: (config, { dev }) => {
      if (dev) {
        config.devtool = "eval-source-map";
        config.optimization = {
          ...config.optimization,
          minimize: false,
        };
      }
      return config;
    },
  }),

  // 生产环境优化
  ...(process.env.NODE_ENV === "production" && {
    // 启用分析
    productionBrowserSourceMaps: false,

    // 优化打包
    webpack: (config) => {
      // 分割chunks
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            priority: 5,
            chunks: "all",
            reuseExistingChunk: true,
          },
        },
      };
      return config;
    },
  }),
};

export default nextConfig;
