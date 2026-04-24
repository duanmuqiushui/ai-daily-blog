/**
 * Excalidraw 配图生成模块
 * 生成手绘风格的 Excalidraw 图表
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 创建基础 Excalidraw 文档结构
 */
function createBaseExcalidraw(): any {
  return {
    type: "excalidraw",
    version: 2,
    source: "hermes-agent-blog-generator",
    elements: [],
    appState: {
      viewBackgroundColor: "#ffffff",
      gridSize: null,
      stats: {
        totalCanvasWidth: 800,
        totalCanvasHeight: 600
      }
    },
    files: {}
  };
}

/**
 * 添加手绘风格的矩形
 */
function addRectangle(doc: any, id: string, x: number, y: number, width: number, height: number, label: string, fillColor: string = "#a5d8ff"): void {
  // 矩形
  doc.elements.push({
    type: "rectangle",
    id,
    x,
    y,
    width,
    height,
    roundness: { type: 3 },
    fillStyle: "solid",
    fillColor,
    strokeColor: "#1e1e1e",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    boundElements: [{ id: `${id}-label`, type: "text" }]
  });

  // 标签
  const textX = x + width / 2 - (label.length * 10) / 2;
  const textY = y + height / 2 - 12;
  doc.elements.push({
    type: "text",
    id: `${id}-label`,
    x: textX,
    y: textY,
    width: label.length * 12,
    height: 24,
    text: label,
    fontSize: 16,
    fontFamily: 1,
    strokeColor: "#1e1e1e",
    fillColor: "transparent",
    textAlign: "center",
    verticalAlign: "middle",
    containerId: id,
    originalText: label,
    autoResize: false
  });
}

/**
 * 添加手绘风格的箭头
 */
function addArrow(doc: any, id: string, startX: number, startY: number, endX: number, endY: number, label?: string): void {
  const arrow: any = {
    type: "arrow",
    id,
    x: startX,
    y: startY,
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
    points: [[0, 0], [endX - startX, endY - startY]],
    endArrowhead: "arrow",
    strokeColor: "#1e1e1e",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100
  };

  if (label) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - 20;
    arrow.boundElements = [{ id: `${id}-label`, type: "text" }];
    doc.elements.push({
      type: "text",
      id: `${id}-label`,
      x: midX - (label.length * 5),
      y: midY,
      width: label.length * 10,
      height: 20,
      text: label,
      fontSize: 14,
      fontFamily: 1,
      strokeColor: "#1e1e1e",
      fillColor: "transparent",
      textAlign: "center",
      verticalAlign: "middle",
      containerId: id,
      originalText: label,
      autoResize: false
    });
  }

  doc.elements.push(arrow);
}

/**
 * 添加文本标签
 */
function addText(doc: any, id: string, x: number, y: number, text: string, fontSize: number = 16, bold: boolean = false): void {
  doc.elements.push({
    type: "text",
    id,
    x,
    y,
    width: text.length * (fontSize * 0.6),
    height: fontSize + 8,
    text,
    fontSize,
    fontFamily: 1,
    strokeColor: "#1e1e1e",
    fillColor: "transparent",
    textAlign: "left",
    verticalAlign: "top",
    originalText: text,
    autoResize: false
  });
}

/**
 * 添加椭圆
 */
function addEllipse(doc: any, id: string, x: number, y: number, width: number, height: number, label: string, fillColor: string = "#b2f2bb"): void {
  doc.elements.push({
    type: "ellipse",
    id,
    x,
    y,
    width,
    height,
    fillStyle: "solid",
    fillColor,
    strokeColor: "#1e1e1e",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    boundElements: [{ id: `${id}-label`, type: "text" }]
  });

  const textX = x + width / 2 - (label.length * 8) / 2;
  const textY = y + height / 2 - 10;
  doc.elements.push({
    type: "text",
    id: `${id}-label`,
    x: textX,
    y: textY,
    width: label.length * 10,
    height: 20,
    text: label,
    fontSize: 14,
    fontFamily: 1,
    strokeColor: "#1e1e1e",
    fillColor: "transparent",
    textAlign: "center",
    verticalAlign: "middle",
    containerId: id,
    originalText: label,
    autoResize: false
  });
}

/**
 * 创建 AI 架构图
 */
function createAIArchitectureDiagram(): any {
  const doc = createBaseExcalidraw();

  // 标题
  addText(doc, "title", 250, 20, "AI 模型架构", 24, true);

  // 输入层
  addRectangle(doc, "input", 50, 80, 120, 60, "输入层", "#a5d8ff");
  addText(doc, "input-text", 60, 150, "文本/图像", 12);

  // 隐藏层 1
  addRectangle(doc, "hidden1", 220, 80, 120, 60, "注意力层", "#d0bfff");
  addText(doc, "h1-text", 230, 150, "Self-Attention", 12);

  // 隐藏层 2
  addRectangle(doc, "hidden2", 390, 80, 120, 60, "前馈层", "#d0bfff");
  addText(doc, "h2-text", 400, 150, "Feed Forward", 12);

  // 输出层
  addRectangle(doc, "output", 560, 80, 120, 60, "输出层", "#b2f2bb");
  addText(doc, "output-text", 570, 150, "预测/生成", 12);

  // 连接箭头
  addArrow(doc, "arrow1", 170, 110, 220, 110);
  addArrow(doc, "arrow2", 340, 110, 390, 110);
  addArrow(doc, "arrow3", 510, 110, 560, 110);

  // 说明文字
  addText(doc, "desc1", 50, 200, "Transformer 架构示意", 14);
  addText(doc, "desc2", 50, 230, "• 多头注意力机制", 12);
  addText(doc, "desc3", 50, 250, "• 残差连接与层归一化", 12);
  addText(doc, "desc4", 50, 270, "• 位置编码", 12);

  return doc;
}

/**
 * 创建安全评估图
 */
function createSecurityDiagram(): any {
  const doc = createBaseExcalidraw();

  // 标题
  addText(doc, "title", 280, 20, "AI 安全评估框架", 24, true);

  // 中心：AI 系统
  addEllipse(doc, "ai-system", 300, 120, 200, 80, "AI 系统", "#ffd8a8");

  // 攻击类型
  addRectangle(doc, "attack1", 50, 80, 140, 50, "对抗样本", "#ffc9c9");
  addRectangle(doc, "attack2", 50, 160, 140, 50, "后门攻击", "#ffc9c9");
  addRectangle(doc, "attack3", 50, 240, 140, 50, "数据投毒", "#ffc9c9");

  // 防护类型
  addRectangle(doc, "defend1", 610, 80, 140, 50, "鲁棒性测试", "#c3fae8");
  addRectangle(doc, "defend2", 610, 160, 140, 50, "可解释性", "#c3fae8");
  addRectangle(doc, "defend3", 610, 240, 140, 50, "隐私保护", "#c3fae8");

  // 连接线
  addArrow(doc, "arrow1", 190, 105, 300, 140);
  addArrow(doc, "arrow2", 190, 185, 300, 160);
  addArrow(doc, "arrow3", 190, 265, 300, 180);
  addArrow(doc, "arrow4", 500, 140, 610, 105);
  addArrow(doc, "arrow5", 500, 160, 610, 185);
  addArrow(doc, "arrow6", 500, 180, 610, 265);

  // 评估结果
  addRectangle(doc, "result", 300, 280, 200, 60, "安全评估报告", "#fff3bf");

  return doc;
}

/**
 * 创建自动驾驶架构图
 */
function createAutonomousDrivingDiagram(): any {
  const doc = createBaseExcalidraw();

  // 标题
  addText(doc, "title", 250, 20, "端到端自动驾驶", 24, true);

  // 感知层
  addRectangle(doc, "perception", 50, 80, 180, 80, "感知层", "#a5d8ff");
  addText(doc, "perc-desc", 60, 170, "摄像头 | 激光雷达", 12);
  addText(doc, "perc-desc2", 60, 190, "毫米波雷达 | GPS", 12);

  // 融合层
  addRectangle(doc, "fusion", 280, 80, 180, 80, "数据融合", "#d0bfff");
  addText(doc, "fus-desc", 310, 170, "BEV 视角", 12);
  addText(doc, "fus-desc2", 290, 190, "传感器时间同步", 12);

  // 决策层
  addRectangle(doc, "decision", 510, 80, 180, 80, "决策规划", "#ffd8a8");
  addText(doc, "dec-desc", 540, 170, "路径规划", 12);
  addText(doc, "dec-desc2", 540, 190, "行为预测", 12);

  // 控制层
  addRectangle(doc, "control", 510, 200, 180, 60, "控制执行", "#b2f2bb");
  addText(doc, "ctrl-desc", 550, 270, "车辆控制", 12);

  // 连接箭头
  addArrow(doc, "arrow1", 230, 120, 280, 120);
  addArrow(doc, "arrow2", 460, 120, 510, 120);
  addArrow(doc, "arrow3", 600, 260, 600, 200);

  // 世界模型
  addRectangle(doc, "world-model", 280, 200, 180, 80, "世界模型", "#fff3bf");
  addArrow(doc, "arrow4", 370, 160, 370, 200);

  // 底部说明
  addText(doc, "note", 50, 320, "端到端方案：感知→决策→控制联合优化", 14);
  addText(doc, "note2", 50, 350, "优势：数据驱动 | 泛化能力强 | 迭代快", 12);

  return doc;
}

/**
 * 创建联邦学习图
 */
function createFederatedLearningDiagram(): any {
  const doc = createBaseExcalidraw();

  // 标题
  addText(doc, "title", 250, 20, "联邦学习架构", 24, true);

  // 中心服务器
  addEllipse(doc, "server", 320, 150, 160, 80, "聚合服务器", "#d0bfff");

  // 客户端 1
  addRectangle(doc, "client1", 80, 80, 120, 60, "客户端 A", "#a5d8ff");
  // 客户端 2
  addRectangle(doc, "client2", 80, 180, 120, 60, "客户端 B", "#a5d8ff");
  // 客户端 3
  addRectangle(doc, "client3", 80, 280, 120, 60, "客户端 C", "#a5d8ff");

  // 数据节点
  addEllipse(doc, "data1", 50, 150, 30, 30, "", "#b2f2bb");
  addEllipse(doc, "data2", 50, 250, 30, 30, "", "#b2f2bb");
  addEllipse(doc, "data3", 50, 350, 30, 30, "", "#b2f2bb");

  // 箭头
  addArrow(doc, "arrow1", 200, 110, 320, 170, "梯度");
  addArrow(doc, "arrow2", 200, 210, 320, 190, "梯度");
  addArrow(doc, "arrow3", 200, 310, 320, 210, "梯度");

  addArrow(doc, "arrow4", 320, 190, 200, 130, "模型");
  addArrow(doc, "arrow5", 320, 210, 200, 230, "模型");
  addArrow(doc, "arrow6", 320, 230, 200, 330, "模型");

  // 说明
  addText(doc, "note", 480, 100, "隐私保护：原始数据不出本地", 14);
  addText(doc, "note2", 480, 130, "安全聚合：差分隐私/同态加密", 12);
  addText(doc, "note3", 480, 160, "抗噪训练：频域分析标签噪声", 12);

  return doc;
}

/**
 * 创建默认/通用图
 */
function createDefaultDiagram(): any {
  const doc = createBaseExcalidraw();

  // 标题
  addText(doc, "title", 250, 20, "AI 技术架构", 24, true);

  // 数据输入
  addRectangle(doc, "data", 50, 100, 150, 70, "数据输入", "#a5d8ff");
  addText(doc, "data-desc", 70, 180, "文本 | 图像 | 音频", 12);

  // AI 模型
  addEllipse(doc, "model", 280, 100, 200, 80, "AI 模型", "#d0bfff");
  addText(doc, "model-desc", 320, 190, "神经网络", 12);

  // 输出
  addRectangle(doc, "output", 550, 100, 150, 70, "智能输出", "#b2f2bb");
  addText(doc, "output-desc", 570, 180, "预测 | 决策 | 生成", 12);

  // 连接
  addArrow(doc, "arrow1", 200, 135, 280, 135, "处理");
  addArrow(doc, "arrow2", 480, 135, 550, 135, "结果");

  // 反馈循环
  addArrow(doc, "feedback", 625, 200, 625, 300);
  addArrow(doc, "feedback2", 625, 300, 130, 300);
  addArrow(doc, "feedback3", 130, 300, 130, 170);

  addText(doc, "feedback-label", 640, 240, "反馈", 12);

  return doc;
}

/**
 * 根据 prompt 主题选择合适的图表模板
 */
function selectTemplate(prompt: string): any {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('language model') || lowerPrompt.includes('neural network') ||
      lowerPrompt.includes('transformer') || lowerPrompt.includes('llm') || lowerPrompt.includes('gpt')) {
    return createAIArchitectureDiagram();
  }

  if (lowerPrompt.includes('security') || lowerPrompt.includes('vulnerability') ||
      lowerPrompt.includes('attack') || lowerPrompt.includes('defense')) {
    return createSecurityDiagram();
  }

  if (lowerPrompt.includes('autonomous') || lowerPrompt.includes('driving') ||
      lowerPrompt.includes('vehicle') || lowerPrompt.includes('自动驾驶')) {
    return createAutonomousDrivingDiagram();
  }

  if (lowerPrompt.includes('federated') || lowerPrompt.includes('privacy') ||
      lowerPrompt.includes('distributed')) {
    return createFederatedLearningDiagram();
  }

  return createDefaultDiagram();
}

/**
 * 生成 Excalidraw 图表
 */
export async function createExcalidrawDiagram(prompt: string, outputPath: string): Promise<string> {
  console.log(`🎨 创建 Excalidraw 图表: ${path.basename(outputPath)}`);
  console.log(`   Prompt: ${prompt.slice(0, 80)}...`);

  // 根据 prompt 选择模板
  const diagram = selectTemplate(prompt);

  // 保存文件
  const content = JSON.stringify(diagram, null, 2);
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`   已保存: ${outputPath}`);

  // 上传到 excalidraw.com
  try {
    const uploadScript = '/home/sola/.hermes/skills/creative/excalidraw/scripts/upload.py';
    if (fs.existsSync(uploadScript)) {
      const result = execSync(`python3 "${uploadScript}" "${outputPath}"`, {
        encoding: 'utf-8',
        timeout: 30000
      }).trim();

      console.log(`   已上传: ${result}`);
      return result; // 返回分享链接
    }
  } catch (error) {
    console.log(`   上传失败，使用本地文件: ${error}`);
  }

  return outputPath;
}

/**
 * 生成封面图
 */
export async function generateCoverDiagram(date: string): Promise<string> {
  const outputPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../output/images',
    `${date}-cover.excalidraw`
  );

  const doc = createBaseExcalidraw();

  // 大标题
  addText(doc, "main-title", 150, 150, "AI 技术日报", 36, true);
  addText(doc, "date", 220, 210, date, 20);

  // 装饰元素
  addRectangle(doc, "deco1", 100, 280, 100, 60, "Hacker News", "#ffa8a8");
  addRectangle(doc, "deco2", 230, 280, 100, 60, "ArXiv", "#a8d8ff");
  addRectangle(doc, "deco3", 360, 280, 100, 60, "RSS", "#a8ffa8");

  // AI 元素装饰
  addEllipse(doc, "ai-icon", 520, 150, 80, 80, "AI", "#d0bfff");

  // 连接线
  addArrow(doc, "line1", 200, 320, 230, 320);
  addArrow(doc, "line2", 330, 320, 360, 320);
  addArrow(doc, "line3", 460, 320, 520, 200);

  // 底部说明
  addText(doc, "footer", 150, 380, "每天自动抓取 AI 相关资讯，生成技术解读", 14);

  const content = JSON.stringify(doc, null, 2);
  fs.writeFileSync(outputPath, content, 'utf-8');

  // 尝试上传
  try {
    const uploadScript = '/home/sola/.hermes/skills/creative/excalidraw/scripts/upload.py';
    if (fs.existsSync(uploadScript)) {
      const result = execSync(`python3 "${uploadScript}" "${outputPath}"`, {
        encoding: 'utf-8',
        timeout: 30000
      }).trim();
      console.log(`封面图已上传: ${result}`);
      return result;
    }
  } catch (error) {
    console.log(`封面上传失败: ${error}`);
  }

  return outputPath;
}