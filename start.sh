#!/bin/bash

# 管理平台 - GraphQL 架构快速启动脚本
# 使用方法: ./start.sh [选项]
# 选项:
#   dev     - 启动开发环境 (默认)
#   prod    - 启动生产环境
#   clean   - 清理并重启
#   stop    - 停止所有服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."
    
    if ! command -v deno &> /dev/null; then
        print_error "Deno 未安装。请访问 https://deno.land/ 安装 Deno"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装。请访问 https://nodejs.org/ 安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装。请安装 npm"
        exit 1
    fi
    
    print_success "依赖检查完成"
}

# 安装前端依赖
install_frontend_deps() {
    print_info "安装前端依赖..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "前端依赖安装完成"
    else
        print_info "前端依赖已存在，跳过安装"
    fi
    cd ..
}

# 下载 PocketBase
download_pocketbase() {
    print_info "检查 PocketBase..."
    cd backend
    if [ ! -f "bin/pocketbase" ]; then
        print_info "下载 PocketBase..."
        deno task download-pb
        print_success "PocketBase 下载完成"
    else
        print_info "PocketBase 已存在，跳过下载"
    fi
    cd ..
}

# 启动开发环境
start_dev() {
    print_info "启动开发环境..."
    
    # 检查外部PocketBase连接
    if ! check_pocketbase_connection; then
        print_error "无法连接到外部PocketBase服务器"
        exit 1
    fi
    
    # 检查端口是否被占用
    check_ports
    
    # 启动GraphQL服务
    print_info "启动GraphQL服务器..."
    cd backend
    POCKETBASE_URL="http://47.111.142.237:8090" GRAPHQL_PORT="8082" deno task server &
    BACKEND_PID=$!
    cd ..
    
    # 等待GraphQL服务启动
    print_info "等待GraphQL服务器启动..."
    sleep 5
    
    # 启动前端服务
    print_info "启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # 保存进程ID
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    print_success "开发环境启动完成!"
    print_info "服务地址:"
    echo "  前端应用:              http://localhost:3000"
    echo "  GraphQL API:           http://localhost:8082/graphql"
    echo "  GraphQL健康检查:       http://localhost:8082/health"
    echo "  外部PocketBase:        http://47.111.142.237:8090"
    echo "  外部PocketBase管理:    http://47.111.142.237:8090/_/"
    echo ""
    print_info "架构: 外部PocketBase + 本地GraphQL + 本地Next.js"
    print_info "按 Ctrl+C 停止所有服务"
    
    # 等待用户中断
    trap 'stop_services' INT
    wait
}

# 检查端口占用
check_ports() {
    local ports=(3000 8082)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "端口 $port 已被占用"
        fi
    done
}

# 停止服务
stop_services() {
    print_info "停止所有服务..."
    
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_success "后端服务已停止"
        fi
        rm -f .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_success "前端服务已停止"
        fi
        rm -f .frontend.pid
    fi
    
    # 强制杀死可能残留的进程
    pkill -f "deno.*server" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    print_success "所有服务已停止"
}

# 运行健康检查
run_health_check() {
    print_info "运行系统健康检查..."
    cd backend
    deno task health-check
    cd ..
}

# 清理并重启
clean_restart() {
    print_info "清理数据库并重启..."
    stop_services
    cd backend
    deno task clean
    cd ..
    start_dev
}

# 启动生产环境
start_prod() {
    print_info "启动生产环境..."
    
    # 检查外部PocketBase连接
    if ! check_pocketbase_connection; then
        print_error "无法连接到外部PocketBase服务器"
        exit 1
    fi
    
    # 构建前端
    print_info "构建前端..."
    cd frontend
    npm run build
    cd ..
    
    # 启动GraphQL服务
    print_info "启动GraphQL服务器..."
    cd backend
    POCKETBASE_URL="http://47.111.142.237:8090" GRAPHQL_PORT="8082" deno task start &
    BACKEND_PID=$!
    cd ..
    
    # 启动前端
    print_info "启动前端服务..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    print_success "生产环境启动完成!"
    print_info "服务地址:"
    echo "  前端应用:              http://localhost:3000"
    echo "  GraphQL API:           http://localhost:8082/graphql"
    echo "  外部PocketBase:        http://47.111.142.237:8090"
    echo ""
    print_info "架构: 外部PocketBase + 本地GraphQL + 本地Next.js"
    
    trap 'stop_services' INT
    wait
}

# 显示帮助信息
show_help() {
    echo "管理平台 - GraphQL 架构快速启动脚本"
    echo ""
    echo "使用方法: ./start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  dev     启动开发环境 (默认)"
    echo "  prod    启动生产环境"
    echo "  clean   清理数据库并重启"
    echo "  stop    停止所有服务"
    echo "  help    显示此帮助信息"
    echo ""
    echo "开发环境服务地址:"
    echo "  前端应用:        http://localhost:3000"
    echo "  GraphQL API:     http://localhost:8082/graphql"
    echo "  PocketBase:      http://localhost:8090"
    echo "  PocketBase 管理: http://localhost:8090/_/"
    echo "  代理服务器:      http://localhost:8091"
}

# 主函数
main() {
    local command=${1:-dev}
    
    case $command in
        dev)
            check_dependencies
            install_frontend_deps
            start_dev
            ;;
        prod)
            check_dependencies
            install_frontend_deps
            start_prod
            ;;
        clean)
            clean_restart
            ;;
        stop)
            stop_services
            ;;
        health)
            run_health_check
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知选项: $command"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 