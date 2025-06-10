#!/bin/bash

# 管理平台开发环境启动脚本
# 支持 Deno 和 Node.js 两种后端实现

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 管理平台 - 开发环境启动器${NC}"
echo -e "${CYAN}======================================${NC}"

# 检查参数
BACKEND_TYPE=${1:-"deno"} # 默认使用 Deno
FRONTEND_ONLY=${2:-"false"}

echo -e "${BLUE}📋 配置信息:${NC}"
echo -e "   后端类型: ${BACKEND_TYPE}"
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

# 启动 Deno 后端
start_deno_backend() {
    echo -e "${PURPLE}🦕 启动 Deno 后端服务器...${NC}"
    cd backend
    
    # 检查是否需要下载 PocketBase
    if [ ! -f "bin/pocketbase" ]; then
        echo -e "${YELLOW}📥 PocketBase 未找到，正在下载...${NC}"
        deno task download-pb
    fi
    
    echo -e "${GREEN}🌟 启动代理服务器 (端口 8091)${NC}"
    deno task dev &
    BACKEND_PID=$!
    cd ..
}

# 启动 Node.js 后端
start_node_backend() {
    echo -e "${PURPLE}📦 启动 Node.js 后端服务器...${NC}"
    cd backend
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装 Node.js 依赖...${NC}"
        npm install
    fi
    
    # 检查是否需要下载 PocketBase
    if [ ! -f "bin/pocketbase" ]; then
        echo -e "${YELLOW}📥 PocketBase 未找到，正在下载...${NC}"
        npm run download-pb
    fi
    
    echo -e "${GREEN}🌟 启动代理服务器 (端口 8091)${NC}"
    npm run dev &
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
    
    echo -e "${GREEN}🌟 启动前端服务器 (端口 3000)${NC}"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}🛑 正在停止服务器...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ 后端服务器已停止${NC}"
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
    # 检查后端类型并启动
    if [ "$FRONTEND_ONLY" != "true" ]; then
        case $BACKEND_TYPE in
            "deno")
                if check_deno; then
                    start_deno_backend
                else
                    echo -e "${RED}❌ 无法启动 Deno 后端${NC}"
                    exit 1
                fi
                ;;
            "node")
                if check_node; then
                    start_node_backend
                else
                    echo -e "${RED}❌ 无法启动 Node.js 后端${NC}"
                    exit 1
                fi
                ;;
            *)
                echo -e "${RED}❌ 不支持的后端类型: $BACKEND_TYPE${NC}"
                echo -e "${YELLOW}💡 支持的类型: deno, node${NC}"
                exit 1
                ;;
        esac
        
        # 等待后端启动
        echo -e "${YELLOW}⏳ 等待后端服务器启动...${NC}"
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
        echo -e "${BLUE}📊 后端管理界面:${NC} http://localhost:8091/_/"
        echo -e "${BLUE}🌐 API 端点:${NC}      http://localhost:8091/api/"
        echo -e "${BLUE}🔧 后端类型:${NC}      $BACKEND_TYPE"
    fi
    
    echo -e "${BLUE}💻 前端应用:${NC}      http://localhost:3000"
    echo -e "${BLUE}👤 测试账户:${NC}      admin@example.com / admin123"
    echo
    echo -e "${YELLOW}💡 按 Ctrl+C 停止所有服务器${NC}"
    
    # 等待用户中断
    wait
}

# 显示帮助
show_help() {
    echo -e "${CYAN}管理平台开发环境启动器${NC}"
    echo
    echo -e "${YELLOW}用法:${NC}"
    echo -e "  $0 [backend_type] [frontend_only]"
    echo
    echo -e "${YELLOW}参数:${NC}"
    echo -e "  backend_type    后端类型 (deno|node，默认: deno)"
    echo -e "  frontend_only   是否仅启动前端 (true|false，默认: false)"
    echo
    echo -e "${YELLOW}示例:${NC}"
    echo -e "  $0                    # 使用 Deno 后端 + 前端"
    echo -e "  $0 node               # 使用 Node.js 后端 + 前端"
    echo -e "  $0 deno false         # 使用 Deno 后端 + 前端"
    echo -e "  $0 deno true          # 仅启动前端"
    echo
    echo -e "${YELLOW}环境要求:${NC}"
    echo -e "  - Deno 1.37+ (用于 Deno 后端)"
    echo -e "  - Node.js 18+ (用于 Node.js 后端和前端)"
    echo -e "  - unzip 命令 (用于解压 PocketBase)"
}

# 检查是否请求帮助
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# 运行主函数
main 