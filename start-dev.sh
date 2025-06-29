#!/bin/bash

# 管理平台开发环境启动脚本 - 外部PocketBase版本
# 使用外部PocketBase服务器 + GraphQL 架构

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 管理平台 - 开发环境启动器 (外部PocketBase)${NC}"
echo -e "${CYAN}======================================${NC}"

# 外部PocketBase配置
POCKETBASE_URL="http://47.111.142.237:8090"
GRAPHQL_PORT="8082"
FRONTEND_PORT="3000"

# 检查参数
FRONTEND_ONLY=${1:-"false"}

echo -e "${BLUE}📋 配置信息:${NC}"
echo -e "   架构: 外部PocketBase + GraphQL + Next.js"
echo -e "   PocketBase服务器: ${POCKETBASE_URL}"
echo -e "   GraphQL端口: ${GRAPHQL_PORT}"
echo -e "   仅启动前端: ${FRONTEND_ONLY}"
echo

# 检查 Deno 是否安装
check_deno() {
    if ! command -v deno &> /dev/null; then
        echo -e "${RED}❌ Deno 未安装${NC}"
        echo -e "${YELLOW}💡 请访问 https://deno.land/manual/getting_started/installation 安装 Deno${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Deno 已安装: $(deno --version | head -n1)${NC}"
    return 0
}

# 检查 Node.js 是否安装
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo -e "${YELLOW}💡 请访问 https://nodejs.org 安装 Node.js${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Node.js 已安装: $(node --version)${NC}"
    return 0
}

# 检查外部PocketBase连接
check_pocketbase_connection() {
    echo -e "${BLUE}🔍 检查外部PocketBase连接...${NC}"
    
    if curl -s --connect-timeout 5 "${POCKETBASE_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PocketBase服务器连接正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 无法连接到PocketBase服务器: ${POCKETBASE_URL}${NC}"
        echo -e "${YELLOW}💡 请确认：${NC}"
        echo -e "   1. PocketBase服务器是否运行"
        echo -e "   2. 网络连接是否正常"
        echo -e "   3. 服务器地址是否正确"
        return 1
    fi
}

# 启动 GraphQL 服务器
start_graphql_server() {
    echo -e "${PURPLE}🦕 启动 GraphQL 服务器...${NC}"
    cd backend
    
    echo -e "${GREEN}🌟 启动GraphQL API服务器 (端口 ${GRAPHQL_PORT})${NC}"
    echo -e "${BLUE}🔍 GraphQL 查询界面: http://localhost:${GRAPHQL_PORT}/graphql${NC}"
    echo -e "${BLUE}❤️  健康检查: http://localhost:${GRAPHQL_PORT}/health${NC}"
    echo -e "${BLUE}📊 连接到PocketBase: ${POCKETBASE_URL}${NC}"
    
    # 使用环境变量启动GraphQL服务器
    POCKETBASE_URL="${POCKETBASE_URL}" GRAPHQL_PORT="${GRAPHQL_PORT}" deno task server &
    BACKEND_PID=$!
    cd ..
}

# 启动前端
start_frontend() {
    echo -e "${PURPLE}⚡ 启动前端开发服务器...${NC}"
    cd frontend
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装前端依赖...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}🌟 启动前端服务器 (端口 ${FRONTEND_PORT})${NC}"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}🛑 正在停止服务器...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ GraphQL服务器已停止${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ 前端服务器已停止${NC}"
    fi
    
    echo -e "${CYAN}👋 再见！${NC}"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主逻辑
main() {
    # 检查外部PocketBase连接
    if [ "$FRONTEND_ONLY" != "true" ]; then
        if ! check_pocketbase_connection; then
            echo -e "${RED}❌ 无法连接到外部PocketBase服务器${NC}"
            exit 1
        fi
    fi
    
    # 启动GraphQL服务器
    if [ "$FRONTEND_ONLY" != "true" ]; then
        if check_deno; then
            start_graphql_server
        else
            echo -e "${RED}❌ 无法启动 GraphQL 服务器${NC}"
            exit 1
        fi
        
        # 等待GraphQL服务器启动
        echo -e "${YELLOW}⏳ 等待GraphQL服务器启动...${NC}"
        sleep 5
    fi
    
    # 启动前端
    if check_node; then
        start_frontend
    else
        echo -e "${RED}❌ 无法启动前端 (需要 Node.js)${NC}"
        exit 1
    fi
    
    # 显示访问信息
    echo
    echo -e "${GREEN}🎉 开发环境启动成功！${NC}"
    echo -e "${CYAN}======================================${NC}"
    
    if [ "$FRONTEND_ONLY" != "true" ]; then
        echo -e "${BLUE}📊 外部PocketBase管理界面:${NC} ${POCKETBASE_URL}/_/"
        echo -e "${BLUE}🌐 外部PocketBase API:${NC}      ${POCKETBASE_URL}/api/"
        echo -e "${BLUE}🔍 GraphQL 查询界面:${NC}        http://localhost:${GRAPHQL_PORT}/graphql"
        echo -e "${BLUE}🚀 GraphQL API:${NC}             http://localhost:${GRAPHQL_PORT}/graphql"
        echo -e "${BLUE}❤️  健康检查:${NC}               http://localhost:${GRAPHQL_PORT}/health"
        echo -e "${BLUE}🔧 架构:${NC}                    外部PocketBase + GraphQL"
    fi
    
    echo -e "${BLUE}💻 前端应用:${NC}                http://localhost:${FRONTEND_PORT}"
    echo -e "${BLUE}👤 测试账户:${NC}                ahukpyu@outlook.com / kpyu1512..@"
    echo
    echo -e "${YELLOW}💡 按 Ctrl+C 停止所有服务器${NC}"
    
    # 等待用户中断
    wait
}

# 显示帮助
show_help() {
    echo -e "${CYAN}管理平台开发环境启动器 (外部PocketBase版本)${NC}"
    echo
    echo -e "${YELLOW}用法:${NC}"
    echo -e "  $0 [frontend_only]"
    echo
    echo -e "${YELLOW}参数:${NC}"
    echo -e "  frontend_only   是否仅启动前端 (true|false，默认: false)"
    echo
    echo -e "${YELLOW}示例:${NC}"
    echo -e "  $0                    # 启动完整环境 (GraphQL + 前端)"
    echo -e "  $0 false              # 启动完整环境 (GraphQL + 前端)"
    echo -e "  $0 true               # 仅启动前端"
    echo
    echo -e "${YELLOW}环境要求:${NC}"
    echo -e "  - Deno 1.37+ (用于GraphQL服务)"
    echo -e "  - Node.js 18+ (用于前端开发)"
    echo -e "  - curl 命令 (用于连接检查)"
    echo -e "  - 外部PocketBase服务器可访问"
    echo
    echo -e "${YELLOW}服务架构:${NC}"
    echo -e "  - 外部PocketBase服务器 (${POCKETBASE_URL})"
    echo -e "  - 本地GraphQL API服务 (端口 ${GRAPHQL_PORT})"
    echo -e "  - 本地Next.js前端服务 (端口 ${FRONTEND_PORT})"
    echo -e "  - GraphQL作为PocketBase的包装层"
}

# 检查是否请求帮助
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# 运行主函数
main 