/**
 * 博客生成脚本 - 从日报生成带配图的博客文章
 */
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
async function generateIllustration(item: NewsItem, index: number, date: string): Promise<string> {
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
    await createExcalidrawDiagram(prompt, outputPath);
    console.log(`  ✅ 配图已保存: ${filename}`);
    return outputPath;
  } catch (error) {
    console.error(`  ❌ 配图生成失败: ${error}`);
    return '';
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
function generateBlogContent(report: DailyReport, illustrations: Map<string, string>): string {
  const lines: string[] = [];

  // 标题
  lines.push(`# ${report.title}`);
  lines.push('');
  lines.push('![AI 日报封面图](./images/cover.excalidraw)');
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
      const illustPath = illustrations.get(item.id);

      lines.push(`### ${index + 1}. ${item.title}`);
      lines.push('');

      // 配图
      if (illustPath) {
        const relativePath = path.relative(
          path.join(__dirname, '../output/_posts'),
          illustPath
        ).replace(/\\/g, '/');
        lines.push(`![配图${index + 1}](./${relativePath})`);
        lines.push('');
      }

      // 来源
      const sourceLabel = item.source === 'arxiv' ? '📚 论文' : item.source === 'hackernews' ? '💬 Hacker News' : '📰 资讯';
      lines.push(`**来源**: ${sourceLabel}`);
      lines.push('');

      // 内容摘要
      if (item.summary) {
        lines.push('**摘要**:');
        lines.push(item.summary);
        lines.push('');
      }

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

    otherNews.slice(0, 15).forEach((item, index) => {
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
async function generateCover(date: string): Promise<string> {
  console.log('🎨 生成日报封面图...');

  const prompt = `hand-drawn style technology blog cover illustration, AI and machine learning theme, neural network brain concept, data streams and circuits, Chinese and English text "AI技术日报", modern tech aesthetic, clean white background, professional sketch style`;

  const filename = `${date}-cover.excalidraw`;
  const outputPath = path.join(__dirname, '../output/images', filename);

  const imagesDir = path.dirname(outputPath);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  try {
    await createExcalidrawDiagram(prompt, outputPath);
    console.log('  ✅ 封面图已生成');
    return outputPath;
  } catch (error) {
    console.error(`  ❌ 封面图生成失败: ${error}`);
    return '';
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
  const coverPath = await generateCover(dateStr);
  if (coverPath) {
    // 复制到 output/images
    const destPath = path.join(__dirname, '../output/images', `${dateStr}-cover.excalidraw`);
    fs.copyFileSync(coverPath, destPath);
  }

  // 3. 为每条重点资讯生成配图
  const illustrations = new Map<string, string>();

  if (report.highlights.length > 0) {
    console.log(`\n🎨 开始生成 ${report.highlights.length} 张配图...`);

    for (let i = 0; i < report.highlights.length; i++) {
      const item = report.highlights[i];
      const illustPath = await generateIllustration(item, i, dateStr);
      if (illustPath) {
        illustrations.set(item.id, illustPath);
      }

      // 间隔，避免过快
      if (i < report.highlights.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // 4. 生成博客内容
  console.log('\n📝 生成博客文章...');
  const blogContent = generateBlogContent(report, illustrations);

  // 5. 生成 Jekyll 格式
  const { filename, content } = generateJekyllPost(report, blogContent);

  // 6. 保存到 _posts 目录
  const outputDir = path.join(__dirname, '../output/_posts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`\n✅ 博客文章已保存: ${outputPath}`);

  // 7. 同时保存到博客根目录（如果需要 GitHub Pages）
  const blogRoot = path.join(__dirname, '../output');
  const blogPath = path.join(blogRoot, filename);
  fs.writeFileSync(blogPath, content, 'utf-8');
  console.log(`✅ 博客副本已保存: ${blogPath}`);

  console.log('\n📋 生成完成！');
  console.log(`   - 博客文章: ${filename}`);
  console.log(`   - 配图数量: ${illustrations.size}`);
  console.log(`   - 输出目录: ${path.join(__dirname, '../output')}`);

  return {
    filename,
    blogPath: outputPath,
    illustrations: Array.from(illustrations.entries())
  };
}

main().catch((error) => {
  console.error('❌ 生成失败:', error);
  process.exit(1);
});