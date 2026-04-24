#!/bin/bash
# AI 日报博客发布脚本
# 运行日报生成 + 博客生成 + Git 提交推送

set -e

WORKSPACE="/home/sola/workspace/src/daily-ai-news-agent"
BLOG_DIR="$WORKSPACE/blog-generator"

echo "🤖 AI 日报博客发布脚本"
echo "========================"
echo ""

# 1. 生成日报（如果还没有）
echo "📰 步骤 1: 生成 AI 日报..."
cd "$WORKSPACE"
if [ -f .env ]; then
    source .env
fi

# 检查是否有今天的报告
TODAY=$(date +%Y%m%d)
REPORT_FILE="$WORKSPACE/src/output/${TODAY}-report.json"

if [ ! -f "$REPORT_FILE" ]; then
    echo "   生成今日日报..."
    npx tsx src/scripts/send-daily-report.ts > /tmp/daily-report.log 2>&1
else
    echo "   日报已存在，跳过生成"
fi

# 2. 生成博客
echo ""
echo "📝 步骤 2: 生成博客文章..."
cd "$BLOG_DIR"
npx tsx scripts/generate-blog.ts > /tmp/blog-generate.log 2>&1

# 3. Git 提交并推送
echo ""
echo "🚀 步骤 3: 推送到 GitHub..."
cd "$BLOG_DIR"

# 添加新生成的文件
git add output/_posts/
git add output/images/ 2>/dev/null || true
git add -A

# 检查是否有变更
if git diff --staged --quiet; then
    echo "   没有新内容需要提交"
else
    git commit -m "Blog post $(date +%Y-%m-%d)"
    echo "   已提交"
    
    # 获取远程仓库信息
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -n "$REMOTE" ]; then
        echo "   推送到远程仓库..."
        git push
        echo "   推送完成！"
    else
        echo "   ⚠️ 没有远程仓库配置，请手动推送"
        echo "   添加远程仓库: git remote add origin https://github.com/USERNAME/repo.git"
    fi
fi

echo ""
echo "✅ 完成！"
echo "   博客将在 GitHub Actions 构建后发布"
echo "   查看状态: https://github.com/USERNAME/ai-daily-blog/actions"
