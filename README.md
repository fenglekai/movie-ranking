# 影视排行榜

一个使用 Next.js 和 ShadcnUI 构建的影视排行榜应用，展示各大视频平台的热播影视作品排行。

## 功能特性

- 🎬 支持多个主流视频平台：爱奇艺、优酷、腾讯视频、芒果TV、豆瓣
- 📱 响应式设计，支持桌面端和移动端
- 🔄 实时数据刷新功能
- 🎨 现代化UI设计，使用ShadcnUI组件库
- ⚡ 基于Next.js 15，性能优化
- 🌙 支持深色模式

## 技术栈

- **前端框架**: Next.js 15
- **UI组件库**: ShadcnUI
- **样式**: Tailwind CSS
- **开发语言**: TypeScript
- **图标**: Lucide React

## 项目结构

```
movie-ranking/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 主页面
│   ├── components/         # React组件
│   │   ├── ui/            # ShadcnUI基础组件
│   │   ├── MovieCard.tsx  # 电影卡片组件
│   │   └── PlatformRanking.tsx # 平台排行组件
│   ├── data/              # 数据相关
│   │   └── mockData.ts    # 模拟数据
│   ├── lib/               # 工具函数
│   │   └── utils.ts       # 通用工具
│   └── types/             # TypeScript类型定义
│       └── movie.ts       # 电影相关类型
├── scripts/               # 脚本文件
│   └── crawler.js         # 数据爬虫脚本（待实现）
└── public/               # 静态资源
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 数据爬取

项目包含一个基础的爬虫脚本框架，位于 `scripts/crawler.js`。

### 运行爬虫脚本

```bash
node scripts/crawler.js
```

**注意**: 当前爬虫脚本仅为示例代码，需要：

1. 安装爬虫相关依赖：
   ```bash
   npm install puppeteer cheerio axios
   ```

2. 根据各平台的实际页面结构实现具体的爬取逻辑

3. 处理反爬机制（代理、延时、User-Agent等）

4. 遵守各平台的robots.txt和使用条款

### 爬虫实现建议

- 使用 Puppeteer 处理动态加载的内容
- 使用 Cheerio 解析静态HTML
- 实现请求限流和重试机制
- 添加数据清洗和验证逻辑
- 考虑使用代理池避免IP被封

## 部署

### Vercel部署

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 自动部署完成

### 其他平台

项目支持部署到任何支持Node.js的平台，如：
- Netlify
- Railway
- Heroku
- 自建服务器

## 开发指南

### 添加新平台

1. 在 `src/data/mockData.ts` 中添加平台配置
2. 在 `scripts/crawler.js` 中添加爬取逻辑
3. 更新类型定义（如需要）

### 自定义样式

项目使用Tailwind CSS，可以：
- 修改 `src/app/globals.css` 中的CSS变量
- 在组件中使用Tailwind类名
- 扩展 `tailwind.config.js`（如需要）

### 组件开发

- 基础UI组件位于 `src/components/ui/`
- 业务组件直接放在 `src/components/`
- 遵循ShadcnUI的设计规范

## 注意事项

1. **数据来源**: 当前使用模拟数据，实际部署时需要实现真实的数据爬取
2. **法律合规**: 爬取数据时请遵守相关法律法规和平台条款
3. **性能优化**: 大量数据时考虑分页和虚拟滚动
4. **缓存策略**: 建议实现数据缓存减少爬取频率

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License
