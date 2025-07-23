# 使用Deno官方镜像
FROM denoland/deno:1.45.0

# 设置工作目录
WORKDIR /app

# 复制配置文件
COPY deno.json deno.lock ./

# 安装依赖
RUN deno cache --reload deno.json

# 复制源代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S deno && \
    adduser -S deno -u 1001

# 设置权限
RUN chown -R deno:deno /app

# 切换到非root用户
USER deno

# 暴露端口
EXPOSE 8082

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD deno run --allow-net scripts/health-check.ts || exit 1

# 启动命令
CMD ["deno", "run", "--allow-all", "server.ts"]
