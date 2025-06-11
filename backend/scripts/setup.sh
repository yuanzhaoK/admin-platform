#!/bin/bash

# PocketBase 数据管理脚本设置
# 为所有脚本添加执行权限

echo "🔧 设置PocketBase数据管理脚本..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 添加执行权限
chmod +x "$SCRIPT_DIR/data-export.ts"
chmod +x "$SCRIPT_DIR/data-import.ts" 
chmod +x "$SCRIPT_DIR/data-manager.ts"

echo "✅ 设置完成！"
echo ""
echo "现在您可以直接执行脚本："
echo "  ./scripts/data-manager.ts help"
echo "  ./scripts/data-export.ts --help"
echo "  ./scripts/data-import.ts --help"
echo ""
echo "或者使用完整的deno命令："
echo "  deno run --allow-all scripts/data-manager.ts help"
echo ""
echo "📖 更多信息请查看: scripts/README.md" 