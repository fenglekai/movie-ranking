# 🎬 热榜追踪器

> 实时追踪各大视频平台热门影视作品排行榜，发现最新最热的电影、电视剧、综艺节目

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwind-css)](https://tailwindcss.com)

## ✨ 特色功能

- 🎯 **多平台覆盖** - 支持爱奇艺、腾讯视频、豆瓣等主流平台
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **实时数据** - 每日自动更新最新排行榜数据
- 🎨 **现代化UI** - 基于 ShadcnUI 的精美界面设计
- 🔄 **自动爬取** - 后台自动爬取数据，无需手动更新
- 📊 **分类浏览** - 按电影、电视剧、综艺分类查看

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd movie-ranking

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 部署到 Vercel

1. Fork 本项目到你的 GitHub 账户
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量（可选）：
   - `CRON_SECRET`: 定时任务访问密钥
4. 自动部署完成

## 🛠️ 技术栈

- **前端框架**: Next.js 15
- **开发语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: ShadcnUI
- **图标**: Lucide React
- **数据爬取**: Puppeteer (生产环境使用 @sparticuz/chromium)
- **部署**: Vercel

## 📊 数据来源

项目通过自动化爬虫获取以下平台的排行榜数据：

- **爱奇艺** - 电视剧排行榜
- **腾讯视频** - 电影、电视剧、综艺排行榜  
- **豆瓣** - 电影、电视剧、综艺评分排行榜

> 数据每日更新，确保排行榜信息的时效性

## 🔧 API 接口

### 定时爬取接口

```
GET /api/cron-crawl
```

触发数据爬取任务，支持 Bearer Token 认证。

### 排行榜数据

爬取的数据保存在 `src/data/crawledData.json`，包含：

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024/1/1 08:00:00",
  "totalMovies": 120,
  "platforms": 6,
  "data": {
    "iqiyiTV": [...],
    "tencentMovie": [...],
    "doubanMovie": [...]
  }
}
```

## ⚙️ 配置说明

### 环境变量

```bash
# 可选：定时任务访问密钥
CRON_SECRET=your-secret-key

# Vercel 自动设置
VERCEL=1
NODE_ENV=production
```

### 定时任务

项目配置了每日8点自动执行的定时任务（`vercel.json`）：

```json
{
  "crons": [
    {
      "path": "/api/cron-crawl",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## 🔒 法律声明

- 本项目仅用于学习和技术交流
- 数据来源于公开的网络平台
- 请遵守相关平台的使用条款和 robots.txt 规则
- 爬取频率已控制在合理范围内

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 📝 许可证

MIT License

---

<p align="center">
  <strong>热榜追踪器</strong> - 让你不错过任何热门影视作品
</p>
