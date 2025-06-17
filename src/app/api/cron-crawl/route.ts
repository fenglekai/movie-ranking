/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 爬取配置
const platforms = {
  // tencentTV: {
  //   name: "腾讯视频剧集",
  //   url: "https://v.qq.com/biu/ranks/",
  // },
  // tencentMovie: {
  //   name: "腾讯视频电影", 
  //   url: "https://v.qq.com/biu/ranks/",
  // },
  // tencentShow: {
  //   name: "腾讯视频综艺",
  //   url: "https://v.qq.com/biu/ranks/",
  // },
  iqiyiTV: {
    name: "爱奇艺剧集",
    url: "https://www.iqiyi.com/trending/",
  },
  // iqiyiMovie: {
  //   name: "爱奇艺电影",
  //   url: "https://www.iqiyi.com/trending/",
  // },
  // iqiyiShow: {
  //   name: "爱奇艺综艺",
  //   url: "https://www.iqiyi.com/trending/",
  // },
  // doubanMovie: {
  //   name: "豆瓣电影",
  //   url: "https://movie.douban.com/explore",
  // },
  // doubanTV: {
  //   name: "豆瓣剧集",
  //   url: "https://movie.douban.com/tv",
  // },
  // doubanShow: {
  //   name: "豆瓣综艺",
  //   url: "https://movie.douban.com/tv",
  // },
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
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 },
    });
  }
}

// 解析豆瓣平台数据
async function parseDoubanPlatform(page: any, platformId: string): Promise<MovieData[]> {
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

// 解析爱奇艺平台数据
async function parseIqiyiPlatform(page: any, platformId: string): Promise<MovieData[]> {
  try {
    // 等待页面加载
    await page.waitForSelector('.qy-mod-rank', { timeout: 10000 });
    
    // 选择正确的标签
    const tagIndex = platformId === 'iqiyiTV' ? 1 : platformId === 'iqiyiMovie' ? 2 : 3;
    await page.click(`.qy-rank-tab li:nth-child(${tagIndex})`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return await page.evaluate((platformId: string) => {
      const items = document.querySelectorAll('.qy-rank-list-wrap .qy-rank-item');
      const results: any[] = [];

      for (let i = 0; i < Math.min(items.length, 20); i++) {
        const item = items[i];
        try {
          const titleElement = item.querySelector('.qy-rank-name a') as HTMLAnchorElement;
          const title = titleElement?.textContent?.trim() || '';
          const url = titleElement?.href || '';

          const hotElement = item.querySelector('.qy-rank-heat');
          const hot = hotElement?.textContent?.trim() || '';

          const infoElement = item.querySelector('.qy-rank-desc');
          const info = infoElement?.textContent?.trim() || '';

          // 解析年份和类型
          const yearMatch = info.match(/(\d{4})/);
          const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

          const genreMatch = info.match(/简介：(.*?)$/);
          const description = genreMatch ? genreMatch[1] : info;
          
          // 提取类型信息
          const genreInfo = info.split(' ')[0] || '未分类';

          if (title) {
            results.push({
              id: i + 1,
              url,
              title,
              hot,
              rating: null,
              genre: genreInfo,
              year,
              description,
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

// 主爬取函数
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  // 简单的认证检查（可选）
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let browser: any = null;
  
  try {
    console.log('🚀 开始定时爬取任务...');
    
    // 启动浏览器
    browser = await getBrowserInstance();

    const results: { [key: string]: MovieData[] } = {};
    
    // 批量爬取所有平台（减少平台数量以提高成功率）
    const platformIds = Object.keys(platforms);
    
    for (const platformId of platformIds) {
      try {
        const data = await crawlPlatform(platformId, browser);
        results[platformId] = data;
        
        // 添加延迟避免被封
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`爬取 ${platformId} 失败:`, error);
        results[platformId] = [];
      }
    }

    // 保存数据
    const finalData = saveData(results);
    
    console.log('✅ 定时爬取任务完成');
    
    return NextResponse.json({
      success: true,
      message: '爬取完成',
      totalMovies: finalData.totalMovies,
      platforms: finalData.platforms,
      lastUpdated: finalData.lastUpdated,
      timestamp: finalData.timestamp
    });

  } catch (error) {
    console.error('❌ 爬取任务失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '爬取失败',
      timestamp: new Date().toISOString()
    }, { status: 500 });

  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 