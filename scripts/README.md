# 影视排行榜爬虫

这是一个用于爬取各大视频平台热播排行榜数据的Node.js脚本。

## 功能特性

- 🎬 支持多个主流视频平台：爱奇艺、优酷、腾讯视频、芒果TV、豆瓣
- 🤖 使用Puppeteer进行动态页面爬取
- 🛡️ 遵守robots.txt规则，尊重网站爬取政策
- ⏱️ 智能延时和重试机制，避免对服务器造成压力
- 📊 自动生成统计信息和时间戳
- 🔄 支持配置化管理，易于维护和扩展
- 💾 自动备份历史数据

## 安装依赖

确保已安装所需的npm包：

```bash
npm install puppeteer cheerio axios user-agents
```

## 使用方法

### 基本使用

直接运行爬虫脚本：

```bash
node crawler.js
```

### 爬取特定平台

```javascript
const { crawlPlatform } = require('./crawler');

// 爬取豆瓣数据
crawlPlatform('douban').then(movies => {
  console.log('豆瓣电影数据:', movies);
});
```

### 自定义配置

修改 `crawler-config.js` 文件来调整爬虫行为：

```javascript
const config = require('./crawler-config');

// 修改延时设置
config.global.minDelay = 3000;
config.global.maxDelay = 6000;

// 修改最大电影数量
config.global.maxMoviesPerPlatform = 30;
```

## 配置说明

### 全局配置

- `minDelay/maxDelay`: 请求间隔时间（毫秒）
- `pageTimeout`: 页面加载超时时间
- `maxRetries`: 最大重试次数
- `maxMoviesPerPlatform`: 每个平台最大爬取电影数量
- `checkRobots`: 是否检查robots.txt

### 平台特定配置

每个平台可以有独立的配置：

- `useHeadless`: 是否使用无头浏览器
- `waitTime`: 页面等待时间
- `blockResources`: 阻止加载的资源类型
- `customHeaders`: 自定义请求头

## 输出格式

爬取的数据会保存到 `src/data/crawledData.json`，格式如下：

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "lastUpdated": "2024/1/1 20:00:00",
  "totalMovies": 75,
  "platforms": 5,
  "data": {
    "douban": [
      {
        "id": 1,
        "title": "电影标题",
        "poster": "海报URL",
        "rating": 8.5,
        "genre": "动作",
        "year": 2024,
        "description": "电影描述",
        "platform": "douban"
      }
    ]
  }
}
```

## 注意事项

### 法律和道德考虑

1. **遵守robots.txt**: 脚本会自动检查并遵守网站的robots.txt规则
2. **合理使用**: 请勿过于频繁地爬取，避免对服务器造成压力
3. **仅供学习**: 本脚本仅用于学习和研究目的
4. **版权尊重**: 请尊重网站的版权和使用条款

### 技术限制

1. **反爬机制**: 各平台可能有反爬虫机制，可能需要调整策略
2. **页面变化**: 网站结构可能发生变化，需要更新选择器
3. **IP限制**: 频繁访问可能导致IP被暂时封禁

### 故障排除

1. **爬取失败**: 检查网络连接和目标网站是否可访问
2. **数据为空**: 可能是选择器过时，需要更新
3. **超时错误**: 增加 `pageTimeout` 设置
4. **内存不足**: 减少 `maxMoviesPerPlatform` 或启用资源阻止

## 维护和更新

### 更新选择器

当网站结构发生变化时，需要更新 `crawler-config.js` 中的选择器：

```javascript
selectors: {
  douban: {
    container: '.new-item-selector', // 更新容器选择器
    title: '.new-title-selector',    // 更新标题选择器
    // ...
  }
}
```

### 添加新平台

1. 在 `platforms` 对象中添加新平台配置
2. 在 `crawler-config.js` 中添加对应的选择器
3. 如需特殊处理，添加专门的解析函数

## 性能优化

1. **资源阻止**: 阻止加载图片、CSS等不必要的资源
2. **并发控制**: 避免同时爬取多个平台
3. **缓存机制**: 可以添加缓存避免重复爬取
4. **增量更新**: 只爬取新增或更新的内容

## 许可证

本项目仅供学习和研究使用，请遵守相关法律法规和网站使用条款。 