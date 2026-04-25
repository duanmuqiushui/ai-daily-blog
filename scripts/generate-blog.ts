/**
 * 博客生成脚本 - 从日报生成带配图的博客文章
 */
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { createExcalidrawDiagram } from './create-excalidraw.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary?: string;
  keywords?: string[];
  analysis?: string;
}

interface DailyReport {
  date: string;
  title: string;
  summary: string;
  highlights: NewsItem[];
  details: NewsItem[];
  hotTopics?: string[];
  metadata: {
    totalCount: number;
    sources: string[];
    generatedAt: Date;
  };
}

/**
 * 为每条资讯生成 Excalidraw 配图
 */
async function generateIllustration(item: NewsItem, index: number, date: string): Promise<{ localPath: string; shareUrl: string }> {
  console.log(`🎨 为第 ${index + 1} 条生成配图: ${item.title.slice(0, 30)}...`);

  const prompt = generateIllustrationPrompt(item);
  const filename = `${date}-${index + 1}-${sanitizeFilename(item.title)}.excalidraw`;
  const outputPath = path.join(__dirname, '../output/images', filename);

  // 确保目录存在
  const imagesDir = path.dirname(outputPath);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  try {
    const result = await createExcalidrawDiagram(prompt, outputPath);
    console.log(`  ✅ 配图已保存: ${filename}`);
    return result;
  } catch (error) {
    console.error(`  ❌ 配图生成失败: ${error}`);
    return { localPath: '', shareUrl: '' };
  }
}

/**
 * 根据资讯内容生成 Excalidraw 配图 prompt
 */
function generateIllustrationPrompt(item: NewsItem): string {
  const title = item.title;
  const keywords = item.keywords?.join(', ') || '';
  const source = item.source;

  // 根据来源和关键词选择合适的配图主题
  if (title.toLowerCase().includes('gpt') || title.toLowerCase().includes('llm') || title.toLowerCase().includes('gpt')) {
    return `hand-drawn style diagram showing AI language model architecture, neural network nodes, transformer attention mechanism, with labels in Chinese and English, clean sketch aesthetic`;
  }

  if (source === 'arxiv' || title.toLowerCase().includes('paper') || title.toLowerCase().includes('research')) {
    return `hand-drawn style illustration showing scientific research process, data analysis charts, laboratory equipment, research paper concept, academic diagram style in Chinese`;
  }

  if (title.toLowerCase().includes('security') || title.toLowerCase().includes('attack') || title.toLowerCase().includes('vulnerability')) {
    return `hand-drawn style cybersecurity diagram showing firewall, lock and key symbols, network protection concept, threat detection visual, Chinese labels, sketch aesthetic`;
  }

  if (title.toLowerCase().includes('autonomous') || title.toLowerCase().includes('driving') || title.toLowerCase().includes('自动驾驶')) {
    return `hand-drawn style illustration showing autonomous vehicle sensors, AI perception system, lidar scanning visualization, self-driving car diagram, Chinese labels`;
  }

  if (title.toLowerCase().includes('federated') || title.toLowerCase().includes('privacy')) {
    return `hand-drawn style diagram showing distributed network, multiple devices connected, privacy shield concept, federated learning visualization, Chinese labels`;
  }

  // 默认：AI/科技主题
  return `hand-drawn style technology concept illustration, AI neural network, data flow visualization, circuit and chip elements, Chinese labels, clean sketch aesthetic`;
}

/**
 * 清理文件名
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/**
 * 生成博客文章内容
 */
function generateBlogContent(report: DailyReport, coverShareUrl: string, illustrations: Map<string, { localPath: string; shareUrl: string }>): string {
  const lines: string[] = [];

  // 标题
  lines.push(`# ${report.title}`);
  lines.push('');
  if (coverShareUrl) {
    lines.push(`[![🤖 AI 日报封面图](https://img.shields.io/badge/点击查看-AI技术日报封面手绘图-blue?style=for-the-badge)](${coverShareUrl})`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // 今日概述
  lines.push('## 📊 今日概述');
  lines.push('');
  lines.push(report.summary);
  lines.push('');

  // 重点解读
  if (report.highlights.length > 0) {
    lines.push('## 📄 重点解读');
    lines.push('');

    report.highlights.forEach((item, index) => {
      const illust = illustrations.get(item.id);

      lines.push(`### ${index + 1}. ${item.title}`);
      lines.push('');

      // 配图 - 优先使用 Excalidraw 分享链接
      if (illust) {
        if (illust.shareUrl) {
          lines.push(`[![配图${index + 1}](https://img.shields.io/badge/点击查看-Excalidraw手绘配图-blue?style=for-the-badge)](${illust.shareUrl})`);
        }
        lines.push('');
      }

      // 来源
      const sourceLabel = item.source === 'arxiv' ? '📚 论文' : item.source === 'hackernews' ? '💬 Hacker News' : '📰 资讯';
      lines.push(`**来源**: ${sourceLabel}`);
      lines.push('');

      // AI 解读
      if (item.analysis) {
        lines.push('**AI 解读**:');
        lines.push(item.analysis);
        lines.push('');
      }

      // 关键词
      if (item.keywords && item.keywords.length > 0) {
        lines.push(`**标签**: ${item.keywords.slice(0, 8).join(', ')}`);
        lines.push('');
      }

      // 链接
      lines.push(`**链接**: [原文链接](${item.url})`);
      lines.push('');
    });
  }

  // 技术热议话题
  if (report.hotTopics && report.hotTopics.length > 0) {
    lines.push('## 💬 技术热议话题');
    lines.push('');
    report.hotTopics.forEach((topic, index) => {
      lines.push(`${index + 1}. ${topic}`);
    });
    lines.push('');
  }

  // 全部资讯
  if (report.details.length > 0) {
    lines.push('## 📋 全部资讯');
    lines.push('');

    const otherNews = report.details.filter(d => !report.highlights.some(h => h.id === d.id));

    otherNews.slice(0, 15).forEach((item) => {
      const sourceLabel = item.source === 'arxiv' ? '📚' : item.source === 'hackernews' ? '💬' : '📰';
      lines.push(`- ${sourceLabel} [${item.title}](${item.url})`);
    });

    if (otherNews.length > 15) {
      lines.push('');
      lines.push(`... 还有 ${otherNews.length - 15} 条资讯`);
    }

    lines.push('');
  }


  // 元信息
  lines.push('---');
  lines.push('');
  lines.push(`**📈 共收录 ${report.metadata.totalCount} 条资讯**`);
  lines.push(`**来源**: ${report.metadata.sources.join(', ')}`);
  lines.push(`**生成时间**: ${report.metadata.generatedAt.toLocaleString('zh-CN')}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*本文由 AI 日报 Agent 自动生成 | 数据来源：Hacker News, ArXiv, RSS*');

  return lines.join('\n');
}

/**
 * 用 HTML 模板包装 Markdown 生成的 HTML 内容
 */
function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.7;
      color: #333;
    }
    a { color: #2c5282; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1, h2, h3 { color: #2c5282; margin-top: 30px; }
    h1 { font-size: 1.8em; margin-top: 0; }
    h2 { font-size: 1.4em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    h3 { font-size: 1.15em; color: #2d3748; margin-top: 25px; }
    pre { background: #f7f7f7; padding: 15px; overflow-x: auto; border-radius: 6px; font-size: 0.9em; }
    code { background: #f7f7f7; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
    img { max-width: 100%; border-radius: 6px; }
    .back-link { margin-bottom: 20px; }
    .highlight-item { background: #f8f9fa; border-left: 4px solid #2c5282; padding: 15px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 0.9em; }
    hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
    blockquote { border-left: 4px solid #2c5282; margin: 0; padding: 0 0 0 20px; color: #666; }
  </style>
</head>
<body>
  <div class="back-link"><a href="/ai-daily-blog/">← 返回首页</a></div>
  ${body}
  <footer class="footer">
    <p>由 AI 日报 Agent 自动生成 | 数据来源：Hacker News, ArXiv, RSS</p>
  </footer>
</body>
</html>`;
}

/**
 * 生成 Jekyll 格式的博客文章
 */
function generateJekyllPost(report: DailyReport, content: string): { filename: string; content: string } {
  const dateStr = report.date.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '');
  const slug = `ai-daily-${dateStr}`;
  const filename = `${dateStr}-${slug}.md`;

  const frontmatter = `---
layout: post
title: "${report.title}"
date: ${dateStr}
author: AI 日报 Agent
categories: [AI, 技术日报]
tags: [AI, ${report.metadata.sources.join(', ')}]
---

`;

  return {
    filename,
    content: frontmatter + content
  };
}

/**
 * 生成封面图
 */
async function generateCover(date: string): Promise<{ localPath: string; shareUrl: string }> {
  console.log('🎨 生成日报封面图...');

  const prompt = `hand-drawn style technology blog cover illustration, AI and machine learning theme, neural network brain concept, data streams and circuits, Chinese and English text "AI技术日报", modern tech aesthetic, clean white background, professional sketch style`;

  const filename = `${date}-cover.excalidraw`;
  const outputPath = path.join(__dirname, '../output/images', filename);

  const imagesDir = path.dirname(outputPath);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  try {
    const result = await createExcalidrawDiagram(prompt, outputPath);
    console.log('  ✅ 封面图已生成');
    return result;
  } catch (error) {
    console.error(`  ❌ 封面图生成失败: ${error}`);
    return { localPath: '', shareUrl: '' };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('📝 AI 日报博客生成器\n');

  // 1. 检查是否有现成的日报数据
  // 默认从标准输出中提取，或者从文件读取
  const args = process.argv.slice(2);
  const reportFile = args[0] || path.join(__dirname, '../../src/output/latest-report.json');

  let report: DailyReport;

  if (fs.existsSync(reportFile)) {
    console.log(`📖 从文件读取日报: ${reportFile}`);
    const data = fs.readFileSync(reportFile, 'utf-8');
    report = JSON.parse(data);
  } else {
    // 如果没有文件，生成示例数据用于测试
    console.log('⚠️ 未找到日报文件，使用测试数据');
    report = {
      date: new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      title: `AI 技术日报 - ${new Date().toLocaleDateString('zh-CN')}`,
      summary: '本期 AI 技术演进呈现...',
      highlights: [],
      details: [],
      hotTopics: [],
      metadata: {
        totalCount: 0,
        sources: ['Hacker News', 'ArXiv', 'RSS'],
        generatedAt: new Date()
      }
    };
  }

  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // 2. 生成封面图
  const coverResult = await generateCover(dateStr);
  if (coverResult.localPath) {
    // 复制到 output/images
    const destPath = path.join(__dirname, '../output/images', `${dateStr}-cover.excalidraw`);
    fs.copyFileSync(coverResult.localPath, destPath);
  }

  // 3. 资讯配图生成已移除（通用骨架图与内容无关，无实际价值）

  // 4. 生成博客内容（只用封面图，移除无意义的内容无关配图）
  console.log('\n📝 生成博客文章...');
  const blogContent = generateBlogContent(report, coverResult.shareUrl, new Map());

  // 5. 生成 Jekyll 格式
  const { filename, content } = generateJekyllPost(report, blogContent);

  // 5b. 用 marked 将 Markdown 转为 HTML（GitHub Pages Jekyll 处理 _posts/ 失败，改为直接预编译 HTML）
  const markdownBody = content.replace(/^---[\s\S]*?---\n/, ''); // 去掉 frontmatter
  const htmlBody = marked(markdownBody) as string;
  const htmlPost = wrapHtml(report.title, htmlBody);

  // 6. 保存到 _posts 目录（Markdown 备份）
  const outputDir = path.join(__dirname, '../output/_posts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`\n✅ 博客文章已保存: ${outputPath}`);

  // 7. 保存预编译 HTML 到 posts/ 目录（GitHub Pages 直接服务）
  const postsDir = path.join(__dirname, '../posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  const htmlFilename = filename.replace(/\.md$/, '.html');
  const htmlPath = path.join(postsDir, htmlFilename);
  fs.writeFileSync(htmlPath, htmlPost, 'utf-8');
  console.log(`✅ HTML 博客已保存: ${htmlPath}`);

  // 8. 更新 index.html 列表
  const indexPath = path.join(__dirname, '../index.html');
  const postDate = filename.match(/(\d{4}-\d+-\d+)/)?.[1] || '';
  const postTitle = report.title;
  const excerpt = `📊 今日概述 | ${report.highlights.length}篇重点解读 | 技术热议话题 | ${report.metadata.totalCount}条资讯`;
  const postLink = `/ai-daily-blog/posts/${htmlFilename}`;
  const newPostEntry = `      <li>
        <span class="post-meta">${postDate}</span>
        <h2><a href="${postLink}">${postTitle}</a></h2>
        <p class="post-excerpt">${excerpt}</p>
      </li>\n`;
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    // 在 post-list 的 <li> 之后插入新条目（保持最新在前）
    if (!indexContent.includes(postLink)) {
      indexContent = indexContent.replace(
        '      <li>\n        <span class="post-meta">',
        newPostEntry + '      <li>\n        <span class="post-meta">'
      );
      fs.writeFileSync(indexPath, indexContent, 'utf-8');
      console.log('✅ index.html 已更新');
    }
  }

  console.log('\n📋 生成完成！');
  console.log(`   - 博客文章: ${filename}`);
  console.log(`   - 配图数量: 0`);
  console.log(`   - 输出目录: ${path.join(__dirname, '../output')}`);

  return {
    filename,
    blogPath: outputPath,
    illustrations: []
  };
}

main().catch((error) => {
  console.error('❌ 生成失败:', error);
  process.exit(1);
});