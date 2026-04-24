# AI 日报博客生成器

将 AI 日报转换为带手绘风格配图的博客文章，发布到 GitHub Pages。

## 功能特点

- 📝 自动从日报生成完整博客文章
- 🎨 Excalidraw 手绘风格配图
- 📚 Jekyll 静态博客，托管在 GitHub Pages
- 🔄 自动化部署

## 目录结构

```
blog-generator/
├── scripts/
│   ├── generate-blog.ts      # 主生成脚本
│   └── create-excalidraw.ts  # Excalidraw 配图生成
├── templates/
│   └── blog-post.md          # 博客模板
├── output/                   # 生成的博客文章
│   └── _posts/               # Jekyll posts 目录
├── _config.yml               # Jekyll 配置
├── Gemfile                   # Ruby 依赖
├── index.html                # 博客首页
└── .github/workflows/        # GitHub Actions
```

## 使用方法

### 1. 初始化 GitHub 仓库

```bash
cd blog-generator
git init
git add .
git commit -m "Initial commit: AI日报博客生成器"
```

### 2. 创建 GitHub 仓库并启用 Pages

1. 在 GitHub 上创建新仓库，命名为 `ai-daily-blog`
2. 推送代码到 GitHub
3. 在仓库 Settings → Pages 中启用 GitHub Pages
4. Source 选择 `gh-pages` 分支（或 main 分支）

### 3. 生成本地测试

```bash
# 安装依赖
npm install
cd blog-generator

# 生成测试博客
npx tsx scripts/generate-blog.ts
```

### 4. 发布新文章

```bash
# 运行日报生成（如果还没运行过）
cd ..
npx tsx src/scripts/send-daily-report.ts

# 生成博客
cd blog-generator
npx tsx scripts/generate-blog.ts

# 提交并推送
git add output/_posts/*
git commit -m "Add blog post $(date +%Y-%m-%d)"
git push
```

## 配图说明

每篇博客会包含：
- 封面图：Excalidraw 手绘风格封面
- 每条重点资讯一张配图（架构图/概念图）

配图使用 Excalidraw JSON 格式，可以：
1. 在 [excalidraw.com](https://excalidraw.com) 打开编辑
2. 导出为 PNG/SVG
3. 分享链接

## CI/CD 自动部署

每次推送到 main 分支，GitHub Actions 会自动：
1. 安装 Ruby 和 Jekyll
2. 构建博客
3. 部署到 GitHub Pages

## 手动触发日报生成 + 博客发布

在终端运行：

```bash
#!/bin/bash
cd /home/sola/workspace/src/daily-ai-news-agent

# 1. 生成日报
source .env
npx tsx src/scripts/send-daily-report.ts > /tmp/daily-report.log 2>&1

# 2. 生成博客
cd blog-generator
npx tsx scripts/generate-blog.ts > /tmp/blog生成.log 2>&1

# 3. 提交并推送
cd blog-generator
git add output/_posts/*
git add output/images/*
git commit -m "Blog post $(date +%Y-%m-%d)"
git push
```

## 定时任务配置

建议每天 9:00 自动生成博客：

```bash
# 添加 cron job
crontab -e

# 添加行：
0 9 * * * /home/sola/workspace/src/daily-ai-news-agent/blog-generator/publish.sh >> /tmp/blog-cron.log 2>&1
```

## 自定义配置

### 修改博客标题

编辑 `_config.yml`：
```yaml
title: 你的博客标题
description: 博客描述
```

### 修改主题颜色

编辑 `index.html` 中的 CSS 样式

### 添加更多页面

在博客根目录添加：
- `about.md` - 关于页面
- `contact.md` - 联系方式页面

## 故障排除

### Jekyll 构建失败

```bash
bundle install
bundle exec jekyll serve --watch
```

### Excalidraw 图片上传失败

检查网络连接，或手动上传 .excalidraw 文件到 excalidraw.com

### GitHub Pages 404

检查仓库 Settings → Pages → Source 配置，确保分支和目录正确

## License

MIT
