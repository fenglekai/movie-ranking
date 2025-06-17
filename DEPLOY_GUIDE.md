# 定时爬取部署指南

## 方案A：定时爬取（推荐）

此方案使用Vercel Cron Jobs每小时自动爬取一次数据，前端从缓存读取数据。

### 部署步骤

#### 1. 本地测试（推荐）

在部署前，建议先进行本地测试确保爬取功能正常：

```bash
# 启动开发服务器
npm run dev

# 在另一个终端运行测试
npm run test:crawl
```

测试脚本会验证：
- ✅ 爬取API是否正常工作
- ✅ 数据文件是否正确生成
- ✅ 数据格式是否符合预期
- ✅ 前端API是否能正确读取数据

#### 2. 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. Vercel会自动检测到Next.js项目并部署

#### 3. 配置环境变量（可选）

在Vercel项目设置中添加环境变量：

```
CRON_SECRET=your-secret-key-here
```

这个密钥用于保护定时爬取API，防止恶意调用。

#### 4. 验证定时任务

部署完成后，Vercel会自动设置Cron Job：
- **执行频率**: 每小时一次 (`0 * * * *`)
- **API路径**: `/api/cron-crawl`
- **超时时间**: 5分钟

#### 5. 手动触发测试

可以通过访问以下URL手动触发爬取测试：

```
https://your-domain.vercel.app/api/cron-crawl
```

如果设置了CRON_SECRET，需要在请求头中添加：

```
Authorization: Bearer your-secret-key-here
```

### 工作原理

1. **定时爬取**: Vercel Cron Jobs每小时调用 `/api/cron-crawl`
2. **数据存储**: 爬取的数据保存到 `src/data/crawledData.json`
3. **前端读取**: `/api/rankings` 从缓存文件读取数据
4. **降级处理**: 如果爬取数据不可用，自动使用模拟数据

### 优势

- ✅ 不受Vercel执行时间限制（爬取在后台进行）
- ✅ 前端响应速度快（读取缓存）
- ✅ 自动更新数据
- ✅ 有降级机制保证服务可用

### 监控和调试

1. **检查爬取状态**:
   ```
   GET /api/rankings
   ```
   返回数据中的 `source` 字段显示数据来源（`crawled` 或 `mock`）

2. **查看Vercel函数日志**:
   - 在Vercel Dashboard中查看函数执行日志
   - 监控爬取任务的成功率

3. **数据更新时间**:
   返回数据中的 `lastUpdated` 字段显示最后更新时间

### 故障排除

1. **爬取失败**: 检查Vercel函数日志，可能是网站反爬机制
2. **数据过期**: 检查Cron Job是否正常运行
3. **访问被拒**: 可能需要调整User-Agent或添加延迟

### 配置文件说明

- `vercel.json`: 配置Cron Jobs和函数超时时间
- `src/app/api/cron-crawl/route.ts`: 定时爬取逻辑
- `src/app/api/rankings/route.ts`: 数据读取API

### 成本估算

- **Vercel Pro计划**: 支持Cron Jobs
- **执行时间**: 每次爬取约2-5分钟
- **存储**: 数据文件很小，几乎不占用空间 