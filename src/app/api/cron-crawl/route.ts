/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 爬取配置
const platforms = {
  tencentTV: {
    name: "腾讯视频剧集",
    url: "https://v.qq.com/biu/ranks/",
  },
  tencentMovie: {
    name: "腾讯视频电影", 
    url: "https://v.qq.com/biu/ranks/",
  },
  tencentShow: {
    name: "腾讯视频综艺",
    url: "https://v.qq.com/biu/ranks/",
  },
  iqiyiTV: {
    name: "爱奇艺剧集",
    url: "https://www.iqiyi.com/trending/",
  },
  iqiyiMovie: {
    name: "爱奇艺电影",
    url: "https://www.iqiyi.com/trending/",
  },
  iqiyiShow: {
    name: "爱奇艺综艺",
    url: "https://www.iqiyi.com/trending/",
  },
  doubanMovie: {
    name: "豆瓣电影",
    url: "https://movie.douban.com/explore",
  },
  doubanTV: {
    name: "豆瓣剧集",
    url: "https://movie.douban.com/tv",
  },
  doubanShow: {
    name: "豆瓣综艺",
    url: "https://movie.douban.com/tv",
  },
};

interface MovieData {
  id: number;
  url: string;
  title: string;
  rating?: number | null;
  hot?: string | null;
  genre?: string | string[] | null;
  year?: number | null;
  description?: string | null;
  platform: string;
}

// 动态导入浏览器相关模块
async function getBrowserInstance() {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Vercel 生产环境
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');
    
    return await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  } else {
    // 本地开发环境
    const puppeteer = await import('puppeteer');
    
    return await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 },
    });
  }
}

// 解析豆瓣平台数据
async function parseDoubanPlatform(page: any, platformId: string): Promise<MovieData[]> {
  try {
    // 如果是豆瓣综艺，需要先点击综艺标签
    if (platformId === 'doubanShow') {
      console.log("🎪 点击豆瓣综艺标签...");

      // 尝试找到并点击综艺标签
      try {
        const tabElements = await page.$$(".explore-recent-hot-tag");
        console.log(`🎯 找到 ${tabElements.length} 个标签元素`);

        for (const tabElement of tabElements) {
          const text = await page.evaluate((el: Element) => el.textContent, tabElement);
          console.log(`  - 检查元素文本: "${text}"`);

          if (text && text.includes("最近热门综艺")) {
            console.log(`📌 找到综艺标签，文本: "${text}"`);

            // 滚动到元素可见
            await page.evaluate((element: Element) => {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }, tabElement);

            // 点击标签
            await tabElement.click();
            console.log("✅ 成功点击综艺标签");
            break;
          }
        }
      } catch (error) {
        console.log(`❌ 尝试点击综艺标签失败: ${error}`);
      }

      // 等待数据加载完成
      console.log("⏳ 等待综艺数据加载...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    return await page.evaluate((platformId: string) => {
      const elements = document.querySelectorAll(".subject-list-list li");
      const results: MovieData[] = [];

      console.log(`🎯 使用选择器: .subject-list-list li, 找到 ${elements.length} 个元素`);

      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        const element = elements[i];
        try {
          const link = element.querySelector("a") as HTMLAnchorElement;
          const url = link?.href || "";

          const titleElement = element.querySelector(".drc-subject-info-title-text");
          let title = titleElement?.textContent?.trim() || "";
          title = title.replace(/^\d+\.?\s*/, "").trim();
          title = title.split("\n")[0].trim();

          const ratingElement = element.querySelector(".drc-rating-num");
          const ratingText = ratingElement?.textContent?.trim() || "";
          const rating = ratingText && ratingText !== "暂无评分" ? parseFloat(ratingText) : null;

          const infoElement = element.querySelector(".drc-subject-info-subtitle");
          const info = infoElement?.textContent?.trim() || "";
          const infoFormat = info.split(" / ");

          const year = infoFormat[0] ? parseInt(infoFormat[0]) : new Date().getFullYear();
          const genre = infoFormat[2] ? infoFormat[2].trim().split(" ") : [];

          let director = '';
          let actor = '';
          if (infoFormat.length === 5) {
            director = infoFormat[3];
            actor = infoFormat[4];
          } else {
            actor = infoFormat[3] || '';
          }

          const description = `导演：${director} 演员：${actor}`;

          if (title) {
            results.push({
              id: i + 1,
              url,
              title,
              rating,
              genre,
              year,
              description,
              platform: platformId
            } as MovieData);
          }
        } catch (error) {
          console.error(`解析第 ${i + 1} 个元素时出错:`, error);
        }
      }

      return results;
    }, platformId);
  } catch (error) {
    console.error(`❌ 处理豆瓣${platformId}数据时出错:`, error);
    // 如果出错，回退到普通解析
    return await page.evaluate((platformId: string) => {
      const elements = document.querySelectorAll(".subject-list-list li");
      const results: MovieData[] = [];

      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        const element = elements[i];
        try {
          const link = element.querySelector("a") as HTMLAnchorElement;
          const url = link?.href || "";

          const titleElement = element.querySelector(".drc-subject-info-title-text");
          let title = titleElement?.textContent?.trim() || "";
          title = title.replace(/^\d+\.?\s*/, "").trim();
          title = title.split("\n")[0].trim();

          const ratingElement = element.querySelector(".drc-rating-num");
          const ratingText = ratingElement?.textContent?.trim() || "";
          const rating = ratingText && ratingText !== "暂无评分" ? parseFloat(ratingText) : null;

          const infoElement = element.querySelector(".drc-subject-info-subtitle");
          const info = infoElement?.textContent?.trim() || "";
          const infoFormat = info.split(" / ");

          const year = infoFormat[0] ? parseInt(infoFormat[0]) : new Date().getFullYear();
          const genre = infoFormat[2] ? infoFormat[2].trim().split(" ") : [];

          let director = '';
          let actor = '';
          if (infoFormat.length === 5) {
            director = infoFormat[3];
            actor = infoFormat[4];
          } else {
            actor = infoFormat[3] || '';
          }

          const description = `导演：${director} 演员：${actor}`;

          if (title) {
            results.push({
              id: i + 1,
              url,
              title,
              rating,
              genre,
              year,
              description,
              platform: platformId
            } as MovieData);
          }
        } catch (error) {
          console.error(`解析第 ${i + 1} 个元素时出错:`, error);
        }
      }

      return results;
    }, platformId);
  }
}

// 解析爱奇艺平台数据
async function parseIqiyiPlatform(page: any, platformId: string): Promise<MovieData[]> {
  try {
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("🎪 进入iframe标签...");
    let iframeElementHandle = await page.$('iframe[class="iframe"]');
    if (!iframeElementHandle) {
      console.error("未找到iframe元素");
      return [];
    }
    
    let iframe = await iframeElementHandle.contentFrame();
    if (!iframe) {
      console.error("无法获取iframe内容");
      return [];
    }

    console.log("🎪 点击热播总榜标签...");
    const gclElements = await iframe.$$(".gcl__con");
    if (gclElements.length > 0) {
      await gclElements[0].click();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 重试逻辑：最多重试3次
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      console.log(`🎪 重新进入iframe标签... (尝试 ${retryCount + 1}/${maxRetries})`);
      iframeElementHandle = await page.$('iframe[class="iframe"]');
      iframe = await iframeElementHandle.contentFrame();

      console.log("🎪 点击分类标签...");
      const rtabElements = await iframe.$$(".rtab__slider__link");
      
      // 根据平台选择对应的标签索引
      const tagIndex = platformId === 'iqiyiTV' ? 2 : platformId === 'iqiyiMovie' ? 4 : 5;
      
      if (rtabElements.length > tagIndex) {
        await rtabElements[0].click();
        await rtabElements[tagIndex].click();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log("🎪 最后一次进入iframe标签...");
      iframeElementHandle = await page.$('iframe[class="iframe"]');
      iframe = await iframeElementHandle.contentFrame();

      // 检查.rvi__list元素是否存在
      const listElements = await iframe.$$(".rvi__list");
      console.log(`🔍 检查到 ${listElements.length} 个 .rvi__list 元素`);
      
      if (listElements.length > 0) {
        console.log("✅ 找到 .rvi__list 元素，开始解析数据");
        break;
      } else {
        console.log(`❌ 未找到 .rvi__list 元素，准备重试 (${retryCount + 1}/${maxRetries})`);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log("⏳ 等待5秒后重试...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // 如果重试后仍然没有找到元素，记录错误但继续尝试解析
    if (retryCount >= maxRetries) {
      console.log("⚠️  重试次数已用完，但仍将尝试解析数据");
    }

    return await iframe.evaluate((platformId: string) => {
      const elements = document.querySelectorAll(".rvi__list a");
      const results: any[] = [];

      console.log(`🎯 使用选择器: .rvi__list a, 找到 ${elements.length} 个元素`);

      for (let i = 0; i < Math.min(elements.length, 20); i++) {
        const element = elements[i];
        try {
          // 获取链接
          const url = element ? (element as HTMLAnchorElement).href : "";

          // 获取标题
          const titleElement = element.querySelector(".rvi__tit1");
          const title = titleElement
            ? titleElement.textContent?.trim().replace((i + 1).toString(), "") || ""
            : "";

          // 获取热度
          const hotElement = element.querySelector(".rvi__index__num");
          const hot = hotElement ? hotElement.textContent?.trim() || "" : "";

          // 获取详细信息
          const infoElement = element.querySelector(".rvi__type1");
          const info = infoElement ? infoElement.textContent?.trim() || "" : "";

          // 拆分信息 [0] 年份 [1] 类型 [2] 演员
          const infoFormat = info.split(" / ");

          // 提取年份
          const year = infoFormat[0]
            ? parseInt(infoFormat[0])
            : new Date().getFullYear();

          // 提取类型
          const genre = infoFormat[1] || "未分类";

          // 提取演员
          const actor = infoFormat[2] || "";

          // 获取描述
          const desElement = element.querySelector(".rvi__des2");
          const des = desElement ? desElement.textContent?.trim() || "" : "";

          if (title && title.length > 1) {
            results.push({
              id: i + 1,
              url,
              title,
              hot,
              rating: null,
              genre,
              year,
              description: `演员：${actor} 简介：${des}`,
              platform: platformId
            });
          }
        } catch (error) {
          console.error(`解析第 ${i + 1} 个爱奇艺元素时出错:`, error);
        }
      }

      return results;
    }, platformId);
  } catch (error) {
    console.error(`爬取爱奇艺 ${platformId} 失败:`, error);
    return [];
  }
}

// 解析腾讯视频平台数据
async function parseTencentPlatform(page: any, platformId: string): Promise<MovieData[]> {
  try {
    await page.waitForSelector('.mod_rank_figure', { timeout: 10000 });
    
    return await page.evaluate(async (platformId: string) => {
      const modElements = document.querySelectorAll(".mod_rank_figure");
      const titleDict: { [key: string]: string } = {
        tencentTV: "电视剧",
        tencentMovie: "电影", 
        tencentShow: "综艺",
      };

      for (const mod of modElements) {
        const titleElement = mod.querySelector(".mod_rank_title .title");
        const title = titleElement?.textContent?.trim() || '';

        if (titleDict[platformId] !== title) continue;

        const items = mod.querySelectorAll(".item.item_odd.item_1");
        const results: MovieData[] = [];

        for (let i = 0; i < Math.min(items.length, 10); i++) {
          const item = items[i];
          try {
            const linkElement = item.querySelector("a") as HTMLAnchorElement;
            const url = linkElement?.href || '';
            
            const titleElement = item.querySelector(".name");
            const itemTitle = titleElement?.textContent?.trim() || '';
            
            if (itemTitle) {
              results.push({
                id: i + 1,
                url,
                title: itemTitle,
                hot: null,
                rating: null,
                genre: null,
                year: null,
                description: null,
                platform: platformId
              } as MovieData);
            }
          } catch (error) {
            console.error(`解析第 ${i + 1} 个腾讯视频元素时出错:`, error);
          }
        }

        return results;
      }

      return [];
    }, platformId);
  } catch (error) {
    console.error(`爬取腾讯视频 ${platformId} 失败:`, error);
    return [];
  }
}

// 爬取单个平台
async function crawlPlatform(platformId: string, browser: any): Promise<MovieData[]> {
  const platform = platforms[platformId as keyof typeof platforms];
  if (!platform) {
    throw new Error(`未知平台: ${platformId}`);
  }

  console.log(`🚀 开始爬取 ${platform.name}...`);

  const page = await browser.newPage();
  
  try {
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });

    // 拦截图片以提高速度
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(platform.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    let data: MovieData[] = [];

    // 根据平台选择解析函数
    if (platformId.startsWith('douban')) {
      data = await parseDoubanPlatform(page, platformId);
    } else if (platformId.startsWith('iqiyi')) {
      data = await parseIqiyiPlatform(page, platformId);
    } else if (platformId.startsWith('tencent')) {
      data = await parseTencentPlatform(page, platformId);
    }

    console.log(`✅ ${platform.name} 爬取完成，获得 ${data.length} 条数据`);
    return data;

  } catch (error) {
    console.error(`❌ 爬取 ${platform.name} 失败:`, error);
    return [];
  } finally {
    await page.close();
  }
}

// 保存数据到文件
function saveData(data: { [key: string]: MovieData[] }) {
  const outputPath = path.join(process.cwd(), 'src/data/crawledData.json');
  
  // 创建目录（如果不存在）
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 计算统计信息
  const platformCount = Object.keys(data).length;
  const totalMovies = Object.values(data).reduce((total, movies) => total + movies.length, 0);

  const finalData = {
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toLocaleString('zh-CN'),
    totalMovies,
    platforms: platformCount,
    data: data
  };

  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
  console.log(`📁 数据已保存到: ${outputPath}`);
  
  return finalData;
}

// 后台爬取函数
async function performCrawlInBackground() {
  let browser: any = null;
  
  try {
    console.log('🚀 开始后台定时爬取任务...');
    
    // 启动浏览器
    browser = await getBrowserInstance();

    const results: { [key: string]: MovieData[] } = {};
    
    // 批量爬取所有平台
    const platformIds = Object.keys(platforms);
    
    for (const platformId of platformIds) {
      try {
        const data = await crawlPlatform(platformId, browser);
        results[platformId] = data;
        
        // 添加延时避免被封IP (随机5-8秒)
        const delay = Math.random() * 3000 + 5000; // 5000-8000ms
        console.log(`⏱️  等待 ${Math.round(delay / 1000)} 秒后继续下一个平台...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error(`爬取 ${platformId} 失败:`, error);
        results[platformId] = [];
        
        // 即使爬取失败也要添加延时
        const delay = Math.random() * 3000 + 5000;
        console.log(`⏱️  失败后等待 ${Math.round(delay / 1000)} 秒...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 保存数据
    const finalData = saveData(results);
    
    console.log('✅ 后台定时爬取任务完成');
    console.log(`📊 爬取结果: ${finalData.totalMovies} 部影视作品，来自 ${finalData.platforms} 个平台`);

  } catch (error) {
    console.error('❌ 后台爬取任务失败:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 主爬取函数
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  // 简单的认证检查（可选）
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 立即启动后台爬取任务（不等待完成）
    performCrawlInBackground().catch(error => {
      console.error('后台爬取任务异常:', error);
    });
    
    // 立即返回成功响应
    return NextResponse.json({
      success: true,
      message: '爬取任务已启动，正在后台执行',
      startTime: new Date().toISOString(),
      timestamp: new Date().toLocaleString('zh-CN')
    });

  } catch (error) {
    console.error('❌ 启动爬取任务失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '启动任务失败',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 