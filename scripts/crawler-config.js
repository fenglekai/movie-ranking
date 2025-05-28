/**
 * 爬虫配置文件
 * 用于配置各种爬虫参数和设置
 */

module.exports = {
  // 全局设置
  global: {
    // 请求间隔 (毫秒)
    minDelay: 2000,
    maxDelay: 5000,
    
    // 超时设置
    pageTimeout: 30000,
    requestTimeout: 5000,
    
    // 重试设置
    maxRetries: 3,
    retryDelay: 1000,
    
    // 并发控制
    maxConcurrent: 1, // 同时爬取的平台数量
    
    // 数据限制
    maxMoviesPerPlatform: 20,
    
    // User-Agent 轮换
    rotateUserAgent: true,
    
    // 是否检查robots.txt
    checkRobots: true,
    
    // 是否启用代理
    useProxy: false,
    proxyList: [
      // 'http://proxy1:port',
      // 'http://proxy2:port'
    ]
  },
  
  // 平台特定设置
  platforms: {
    douban: {
      // 豆瓣需要特殊处理
      useHeadless: false,
      waitTime: 5000,
      maxRetries: 5,
      customHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    },
    
    iqiyi: {
      useHeadless: true,
      waitTime: 3000,
      blockResources: ['image', 'stylesheet', 'font']
    },
    
    youku: {
      useHeadless: true,
      waitTime: 3000,
      blockResources: ['image', 'stylesheet', 'font']
    },
    
    tencent: {
      useHeadless: true,
      waitTime: 3000,
      blockResources: ['image', 'stylesheet', 'font']
    },
    
    mango: {
      useHeadless: true,
      waitTime: 3000,
      blockResources: ['image', 'stylesheet', 'font']
    }
  },
  
  // 选择器配置 (可能需要定期更新)
  selectors: {
    douban: {
      container: '.item',
      title: '.title',
      poster: '.pic img',
      rating: '.rating_nums',
      info: '.info .bd p'
    },
    
    iqiyi: {
      container: '.site-piclist_pic_link',
      title: 'img',
      poster: 'img'
    },
    
    youku: {
      container: '.p-thumb',
      title: 'img',
      poster: 'img'
    },
    
    tencent: {
      container: '.list_item',
      title: 'img',
      poster: 'img'
    },
    
    mango: {
      container: '.video-item',
      title: 'img',
      poster: 'img'
    }
  },
  
  // 输出设置
  output: {
    // 输出文件路径
    filePath: '../src/data/crawledData.json',
    
    // 是否美化JSON
    prettify: true,
    
    // 是否包含时间戳
    includeTimestamp: true,
    
    // 是否包含统计信息
    includeStats: true,
    
    // 备份设置
    createBackup: true,
    backupDir: '../src/data/backups'
  },
  
  // 日志设置
  logging: {
    level: 'info', // debug, info, warn, error
    colorOutput: true,
    logToFile: false,
    logFilePath: './crawler.log'
  }
}; 