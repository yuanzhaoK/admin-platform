import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /* 基础配置 */

  // 启用压缩
  compress: true,

  // 性能优化
  poweredByHeader: false, // 隐藏 X-Powered-By 头
  generateEtags: true, // 启用 ETag

  // 优化图片
  images: {
    domains: ["localhost", "47.111.142.237", "cdn.example.com"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1年
    dangerouslyAllowSVG: false, // 安全配置
    contentDispositionType: "attachment",
  },

  // 输出配置
  output: isProduction ? "standalone" : undefined,

  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: [
      "lucide-react",
      "@apollo/client",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "clsx",
      "tailwind-merge",
    ],

    // 启用更多优化
    optimizeCss: true,
    optimizeServerReact: true,

    // 启用 React 编译器
    reactCompiler: true,
  },

  // TurboPack 配置 (已从experimental移出，因为它现在是稳定功能)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // 编译器选项
  compiler: {
    // 移除 console.log（仅生产环境）
    removeConsole: isProduction
      ? {
        exclude: ["error", "warn"],
      }
      : false,
  },

  // React 严格模式
  reactStrictMode: true,

  // 头部配置
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // 缓存静态资源
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // 重定向配置
  async redirects() {
    return [
      // 示例重定向
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true
      // }
    ];
  },

  // 环境特定配置
  ...(isDevelopment && {
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        config.devtool = "eval-source-map";
        config.optimization = {
          ...config.optimization,
          minimize: false,
        };

        // 开发环境下的热更新优化
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },

    // 开发环境下启用更详细的错误信息
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  // 生产环境优化
  ...(isProduction && {
    // 禁用源码映射以提高构建速度
    productionBrowserSourceMaps: false,

    // 优化打包
    webpack: (
      config,
      { dev, isServer },
    ) => {
      // 分割chunks - 更细粒度的代码分割
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          // React 相关库
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: "react",
            priority: 30,
            chunks: "all",
            enforce: true,
          },
          // UI 组件库
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: "ui",
            priority: 25,
            chunks: "all",
          },
          // GraphQL 相关
          graphql: {
            test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
            name: "graphql",
            priority: 20,
            chunks: "all",
          },
          // 其他第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            chunks: "all",
            minSize: 30000,
          },
          // 公共代码
          common: {
            name: "common",
            minChunks: 2,
            priority: 5,
            chunks: "all",
            reuseExistingChunk: true,
            minSize: 10000,
          },
        },
      };

      // 生产环境下的优化
      if (!dev && !isServer) {
        // Bundle 分析 - 仅在 ANALYZE 模式下启用
        if (process.env.ANALYZE === "true") {
          // 忽略类型检查，仅在 ANALYZE 模式下使用
          // @ts-expect-error - bundle analyzer 可能未安装
          import("@next/bundle-analyzer").then(
            ({ default: BundleAnalyzerPlugin }) => {
              config.plugins.push(new BundleAnalyzerPlugin({ enabled: true }));
            },
          ).catch(() => {
            console.warn(
              "Bundle analyzer not available - install with: npm install --save-dev @next/bundle-analyzer",
            );
          });
        }

        // 压缩优化
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;

        // 模块连接
        config.optimization.concatenateModules = true;
      }

      return config;
    },

    // 输出文件哈希优化
    generateBuildId: async () => {
      // 你可以使用 git commit hash 或时间戳
      return process.env.BUILD_ID || `build-${Date.now()}`;
    },
  }),
};

export default nextConfig;
