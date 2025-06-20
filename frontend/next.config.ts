import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 开发模式下启用源码映射，方便调试
  ...(process.env.NODE_ENV === "development" && {
    webpack: (config, { dev }) => {
      if (dev) {
        // 确保源码映射在开发模式下可用
        config.devtool = "eval-source-map";

        // 优化调试体验
        config.optimization = {
          ...config.optimization,
          minimize: false,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;
