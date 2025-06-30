@echo off
setlocal enabledelayedexpansion

REM 管理平台 - GraphQL 架构快速启动脚本
REM 使用方法: start.cmd [选项]
REM 选项:
REM   dev     - 启动开发环境 (默认)
REM   prod    - 启动生产环境
REM   clean   - 清理并重启
REM   stop    - 停止所有服务

REM 设置变量
set "BACKEND_PID_FILE=.backend.pid"de
set "FRONTEND_PID_FILE=.frontend.pid"
set "POCKETBASE_URL=http://47.111.142.237:8090"
set "GRAPHQL_PORT=8082"

REM 获取命令参数
set "COMMAND=%~1"
if "%COMMAND%"=="" set "COMMAND=dev"

REM 主函数调用
call :main %COMMAND%
goto :eof

:main
set "cmd=%~1"
if "%cmd%"=="dev" goto :start_dev_flow
if "%cmd%"=="prod" goto :start_prod_flow
if "%cmd%"=="clean" goto :clean_restart
if "%cmd%"=="stop" goto :stop_services
if "%cmd%"=="health" goto :run_health_check
if "%cmd%"=="help" goto :show_help
if "%cmd%"=="--help" goto :show_help
if "%cmd%"=="-h" goto :show_help

call :print_error "未知选项: %cmd%"
call :show_help
exit /b 1

:start_dev_flow
call :check_dependencies
if errorlevel 1 exit /b 1
call :install_frontend_deps
if errorlevel 1 exit /b 1
call :start_dev
goto :eof

:start_prod_flow
call :check_dependencies
if errorlevel 1 exit /b 1
call :install_frontend_deps
if errorlevel 1 exit /b 1
call :start_prod
goto :eof

REM 打印函数
:print_info
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM 检查依赖
:check_dependencies
call :print_info "检查系统依赖..."

where deno >nul 2>&1
if errorlevel 1 (
    call :print_error "Deno 未安装。请访问 https://deno.land/ 安装 Deno"
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js 未安装。请访问 https://nodejs.org/ 安装 Node.js"
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    call :print_error "npm 未安装。请安装 npm"
    exit /b 1
)

call :print_success "依赖检查完成"
goto :eof

REM 安装前端依赖
:install_frontend_deps
call :print_info "安装前端依赖..."
cd frontend
if not exist "node_modules" (
    npm install
    if errorlevel 1 (
        call :print_error "前端依赖安装失败"
        cd ..
        exit /b 1
    )
    call :print_success "前端依赖安装完成"
) else (
    call :print_info "前端依赖已存在，跳过安装"
)
cd ..
goto :eof

REM 下载 PocketBase
:download_pocketbase
call :print_info "检查 PocketBase..."
cd backend
if not exist "bin\pocketbase.exe" (
    call :print_info "下载 PocketBase..."
    deno task download-pb
    if errorlevel 1 (
        call :print_error "PocketBase 下载失败"
        cd ..
        exit /b 1
    )
    call :print_success "PocketBase 下载完成"
) else (
    call :print_info "PocketBase 已存在，跳过下载"
)
cd ..
goto :eof

REM 检查外部PocketBase连接
:check_pocketbase_connection
call :print_info "检查外部PocketBase连接..."
ping -n 1 47.111.142.237 >nul 2>&1
if errorlevel 1 (
    call :print_error "无法连接到外部PocketBase服务器"
    exit /b 1
)
call :print_success "外部PocketBase连接正常"
goto :eof

REM 检查端口占用
:check_ports
call :print_info "检查端口占用..."
netstat -an | findstr ":3000" >nul 2>&1
if not errorlevel 1 call :print_warning "端口 3000 已被占用"

netstat -an | findstr ":8082" >nul 2>&1
if not errorlevel 1 call :print_warning "端口 8082 已被占用"
goto :eof

REM 启动开发环境
:start_dev
call :print_info "启动开发环境..."

REM 检查外部PocketBase连接
call :check_pocketbase_connection
if errorlevel 1 exit /b 1

REM 检查端口是否被占用
call :check_ports

REM 启动GraphQL服务
call :print_info "启动GraphQL服务器..."
cd backend
set "POCKETBASE_URL=%POCKETBASE_URL%"
set "GRAPHQL_PORT=%GRAPHQL_PORT%"
start /b "" deno task server
cd ..

REM 等待GraphQL服务启动
call :print_info "等待GraphQL服务器启动..."
timeout /t 5 /nobreak >nul

REM 启动前端服务
call :print_info "启动前端服务..."
cd frontend
start /b "" npm run dev
cd ..

call :print_success "开发环境启动完成!"
call :print_info "服务地址:"
echo   前端应用:              http://localhost:3000
echo   GraphQL API:           http://localhost:8082/graphql
echo   GraphQL健康检查:       http://localhost:8082/health
echo   外部PocketBase:        http://47.111.142.237:8090
echo   外部PocketBase管理:    http://47.111.142.237:8090/_/
echo.
call :print_info "架构: 外部PocketBase + 本地GraphQL + 本地Next.js"
call :print_info "按 Ctrl+C 停止所有服务"

REM 等待用户中断
echo 按任意键停止所有服务...
pause >nul
call :stop_services
goto :eof

REM 停止服务
:stop_services
call :print_info "停止所有服务..."

REM 强制杀死可能残留的进程
taskkill /f /im deno.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.cmd >nul 2>&1

REM 删除PID文件
if exist "%BACKEND_PID_FILE%" del /f "%BACKEND_PID_FILE%"
if exist "%FRONTEND_PID_FILE%" del /f "%FRONTEND_PID_FILE%"

call :print_success "所有服务已停止"
goto :eof

REM 运行健康检查
:run_health_check
call :print_info "运行系统健康检查..."
cd backend
deno task health-check
if errorlevel 1 (
    call :print_error "健康检查失败"
    cd ..
    exit /b 1
)
cd ..
call :print_success "健康检查通过"
goto :eof

REM 清理并重启
:clean_restart
call :print_info "清理数据库并重启..."
call :stop_services
cd backend
deno task clean
if errorlevel 1 (
    call :print_error "清理失败"
    cd ..
    exit /b 1
)
cd ..
call :start_dev
goto :eof

REM 启动生产环境
:start_prod
call :print_info "启动生产环境..."

REM 检查外部PocketBase连接
call :check_pocketbase_connection
if errorlevel 1 exit /b 1

REM 构建前端
call :print_info "构建前端..."
cd frontend
npm run build
if errorlevel 1 (
    call :print_error "前端构建失败"
    cd ..
    exit /b 1
)
cd ..

REM 启动GraphQL服务
call :print_info "启动GraphQL服务器..."
cd backend
set "POCKETBASE_URL=%POCKETBASE_URL%"
set "GRAPHQL_PORT=%GRAPHQL_PORT%"
start /b "" deno task start
cd ..

REM 启动前端
call :print_info "启动前端服务..."
cd frontend
start /b "" npm start
cd ..

call :print_success "生产环境启动完成!"
call :print_info "服务地址:"
echo   前端应用:              http://localhost:3000
echo   GraphQL API:           http://localhost:8082/graphql
echo   外部PocketBase:        http://47.111.142.237:8090
echo.
call :print_info "架构: 外部PocketBase + 本地GraphQL + 本地Next.js"

echo 按任意键停止所有服务...
pause >nul
call :stop_services
goto :eof

REM 显示帮助信息
:show_help
echo 管理平台 - GraphQL 架构快速启动脚本
echo.
echo 使用方法: start.cmd [选项]
echo.
echo 选项:
echo   dev     启动开发环境 (默认)
echo   prod    启动生产环境
echo   clean   清理数据库并重启
echo   stop    停止所有服务
echo   health  运行健康检查
echo   help    显示此帮助信息
echo.
echo 开发环境服务地址:
echo   前端应用:        http://localhost:3000
echo   GraphQL API:     http://localhost:8082/graphql
echo   PocketBase:      http://localhost:8090
echo   PocketBase 管理: http://localhost:8090/_/
echo   代理服务器:      http://localhost:8091
goto :eof