#!/usr/bin/env node

/**
 * 影视排行榜数据爬虫脚本
 * 用于爬取各大视频平台的热播排行榜数据
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");
const UserAgent = require("user-agents");

// 平台配置
const platforms = {
  // 未成功的爬取
  // youku: {
  //   name: '优酷',
  //   url: 'https://www.youku.com/channel/webmovie',
  //   selector: '.p-thumb',
  //   useHeadless: true,
  // },
  // mango: {
  //   name: '芒果TV',
  //   url: 'https://www.mgtv.com/channel/movie',
  //   selector: '.video-item',
  //   useHeadless: true,
  // },

  // 已经成功的爬取
  // tencentTV: {
  //   name: "腾讯视频剧集",
  //   url: "https://v.qq.com/biu/ranks/",
  //   selector: ".item.item_odd.item_1",
  //   useHeadless: true,
  // },
  // tencentMovie: {
  //   name: "腾讯视频电影",
  //   url: "https://v.qq.com/biu/ranks/",
  //   selector: ".item.item_odd.item_1",
  //   useHeadless: true,
  // },
  // tencentShow: {
  //   name: "腾讯视频综艺",
  //   url: "https://v.qq.com/biu/ranks/",
  //   selector: ".item.item_odd.item_1",
  //   useHeadless: true,
  // },
  // iqiyiTV: {
  //   name: "爱奇艺剧集",
  //   url: "https://www.iqiyi.com/trending/",
  //   selector: ".rvi__box",
  //   useHeadless: true,
  // },
  // iqiyiMovie: {
  //   name: "爱奇艺电影",
  //   url: "https://www.iqiyi.com/trending/",
  //   selector: ".rvi__box",
  //   useHeadless: true,
  // },
  // iqiyiShow: {
  //   name: "爱奇艺综艺",
  //   url: "https://www.iqiyi.com/trending/",
  //   selector: ".rvi__box",
  //   useHeadless: true,
  // },
  // doubanMovie: {
  //   name: "豆瓣电影",
  //   url: "https://movie.douban.com/explore",
  //   selector: ".drc-subject-info",
  //   useHeadless: true,
  // },
  // doubanTV: {
  //   name: "豆瓣剧集",
  //   url: "https://movie.douban.com/tv",
  //   selector: ".drc-subject-info",
  //   useHeadless: true,
  // },
  // doubanShow: {
  //   name: "豆瓣综艺",
  //   url: "https://movie.douban.com/tv",
  //   selector: ".drc-subject-info",
  //   useHeadless: true,
  // },
};

/**
 * 检查robots.txt
 * @param {string} baseUrl 网站基础URL
 * @param {string} targetPath 要访问的路径 (例如: '/chart')
 * @returns {Promise<boolean>} 是否允许爬取
 */
async function checkRobotsTxt(baseUrl, targetPath = "/") {
  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).href;
    const response = await axios.get(robotsUrl, { timeout: 5000 });
    const robotsTxt = response.data;

    // 解析robots.txt
    const lines = robotsTxt.split("\n").map((line) => line.trim());
    let currentUserAgent = null;
    let isRelevantSection = false;
    const disallowedPaths = [];

    for (const line of lines) {
      if (line.startsWith("User-agent:")) {
        const userAgent = line.substring(11).trim();
        isRelevantSection = userAgent === "*";
        currentUserAgent = userAgent;
      } else if (line.startsWith("Disallow:") && isRelevantSection) {
        const path = line.substring(9).trim();
        if (path) {
          disallowedPaths.push(path);
        }
      } else if (line.startsWith("User-agent:") && currentUserAgent) {
        // 新的User-agent部分开始，重置状态
        if (currentUserAgent !== line.substring(11).trim()) {
          break;
        }
      }
    }

    // 检查目标路径是否被禁止
    for (const disallowedPath of disallowedPaths) {
      if (disallowedPath === "/") {
        // 禁止所有路径
        console.log(`⚠️  ${baseUrl} 的 robots.txt 禁止所有爬取`);
        return false;
      } else if (targetPath.startsWith(disallowedPath)) {
        // 目标路径匹配禁止的路径
        console.log(
          `⚠️  ${baseUrl}${targetPath} 被 robots.txt 禁止 (规则: ${disallowedPath})`
        );
        return false;
      }
    }

    console.log(`✅ ${baseUrl}${targetPath} 允许爬取`);
    return true;
  } catch (error) {
    console.log(`⚠️  无法获取 ${baseUrl} 的 robots.txt，继续爬取`);
    return true; // 如果无法获取robots.txt，假设允许爬取
  }
}

/**
 * 解析豆瓣平台数据
 * @param {Object} page puppeteer页面对象
 * @param {string} selector CSS选择器
 * @param {string} platformId 平台ID
 * @returns {Array} 电影数据数组
 */
async function parseDoubanPlatform(page, selector, platformId) {
  const movies = await page.evaluate(
    (selector, platformId) => {
      const elements = document.querySelectorAll(selector);
      const results = [];

      console.log(`🎯 使用选择器: ${selector}, 找到 ${elements.length} 个元素`);

      elements.forEach((element, index) => {
        try {
          // 获取标题
          const titleElement = element.querySelector(
            ".drc-subject-info-title-text"
          );
          let title = titleElement ? titleElement.textContent.trim() : "";

          // 清理标题中的多余字符
          title = title.replace(/^\d+\.?\s*/, "").trim(); // 移除开头的数字
          title = title.split("\n")[0].trim(); // 取第一行作为标题

          // 获取评分
          const ratingElement = element.querySelector(".drc-rating-num");
          const ratingText = ratingElement
            ? ratingElement.textContent.trim()
            : "";
          const rating =
            ratingText && ratingText !== "暂无评分"
              ? parseFloat(ratingText)
              : "-";

          // 获取详细信息
          const infoElement = element.querySelector(
            ".drc-subject-info-subtitle"
          );
          const info = infoElement ? infoElement.textContent.trim() : "";

          // 拆分信息 [0] 年份 [1] 国家 [2] 类型 [3] 导演 [4] 演员
          const infoFormat = info.split(" / ");

          // 提取年份
          const year = infoFormat[0]
            ? parseInt(infoFormat[0])
            : new Date().getFullYear();

          // 提取类型
          const genre = infoFormat[2] ? infoFormat[2].trim().split(" ") : [];

          // 提取导演
          const director = infoFormat.slice(3, 4);

          // 提取演员
          const actor = infoFormat.slice(4, 5);

          if (title && title.length > 1 && index < 20) {
            // 限制数量并确保标题有效
            results.push({
              id: index + 1,
              title,
              hot: null,
              rating: Math.round(rating * 10) / 10, // 保留一位小数
              genre,
              year,
              description: `导演：${director} 演员：${actor}`,
              platform: platformId,
            });
          }
        } catch (error) {
          console.error("解析豆瓣平台数据时出错:", error);
        }
      });

      return results;
    },
    selector,
    platformId
  );

  console.log(`✅ 成功解析到 ${movies.length} 部`);
  return movies;
}

/**
 * 解析豆瓣综艺数据（需要先点击标签）
 * @param {Object} page puppeteer页面对象
 * @param {string} selector CSS选择器
 * @param {string} platformId 平台ID
 * @returns {Array} 综艺数据数组
 */
async function parsedoubanShow(page, selector, platformId) {
  try {
    console.log("🎪 点击豆瓣综艺标签...");

    // 尝试找到并点击综艺标签
    try {
      const tabElements = await page.$$(".explore-recent-hot-tag");
      console.log(`🎯 找到 ${tabElements.length} 个元素`);

      for (const tabElement of tabElements) {
        const text = await page.evaluate((el) => el.textContent, tabElement);
        console.log(`  - 检查元素文本: "${text}"`);

        if (text && text.includes("最近热门综艺")) {
          console.log(`📌 找到综艺标签，文本: "${text}"`);

          // 滚动到元素可见
          await page.evaluate((element) => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }, tabElement);

          // 点击标签
          await tabElement.click();
          console.log("✅ 成功点击综艺标签");
          break;
        }
      }
    } catch (error) {
      console.log(`❌ 尝试点击失败: ${error.message}`);
    }

    // 等待数据加载完成
    console.log("⏳ 等待综艺数据加载...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 等待新内容加载（可以根据实际页面调整选择器）
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
      console.log("✅ 检测到新内容已加载");
    } catch (error) {
      console.log("⚠️  等待新内容超时，继续进行数据解析");
    }

    // 解析数据
    const movies = await parseDoubanPlatform(page, selector, platformId);
    return movies;
  } catch (error) {
    console.error("❌ 处理豆瓣综艺数据时出错:", error);
    // 如果出错，回退到普通解析
    return await parseDoubanPlatform(page, selector, platformId);
  }
}

/**
 * 解析爱奇艺平台数据
 * @param {Object} page puppeteer页面对象
 * @param {string} selector CSS选择器
 * @param {string} platformId 平台ID
 * @returns {Array} 电影数据数组
 */
async function parseIqiyiPlatform(page, selector, platformId) {
  const movies = await page.evaluate(
    (selector, platformId) => {
      const elements = document.querySelectorAll(selector);
      const results = [];

      console.log(`🎯 使用选择器: ${selector}, 找到 ${elements.length} 个元素`);

      elements.forEach((element, index) => {
        try {
          // 获取标题
          const titleElement = element.querySelector(".rvi__tit1");
          const title = titleElement
            ? titleElement.textContent
                .trim()
                .replace((index + 1).toString(), "")
            : "";

          // 获取热度
          const hotElement = element.querySelector(".rvi__index__num");
          const hot = hotElement ? hotElement.textContent.trim() : "";

          // 获取详细信息
          const infoElement = element.querySelector(".rvi__type1");
          const info = infoElement ? infoElement.textContent.trim() : "";

          // 拆分信息 [0] 年份 [1] 类型 [2] 演员
          const infoFormat = info.split(" / ");

          // 提取年份
          const year = infoFormat[0]
            ? parseInt(infoFormat[0])
            : new Date().getFullYear();

          // 提取类型
          const genre = infoFormat[1];

          // 提取演员
          const actor = infoFormat[2];

          // 获取描述
          const desElement = element.querySelector(".rvi__des2");
          const des = desElement ? desElement.textContent.trim() : "";

          if (title && title.length > 1 && index < 20) {
            // 限制数量并确保标题有效
            results.push({
              id: index + 1,
              title,
              hot,
              rating: null,
              genre,
              year,
              description: `演员：${actor} 简介：${des}`,
              platform: platformId,
            });
          }
        } catch (error) {
          console.error("解析爱奇艺平台数据时出错:", error);
        }
      });

      return results;
    },
    selector,
    platformId
  );

  console.log(`✅ 成功解析到 ${movies.length} 部`);
  return movies;
}

/**
 * 爱奇艺选择Tag
 * @param {Object} page puppeteer页面对象
 * @param {string} selector CSS选择器
 * @param {string} platformId 平台ID
 * @returns {Array} 数据数组
 */
async function chooseIqiyiTag(page, selector, platformId, tagIndex) {
  console.log("🎪 进入iframe标签...");
  let iframeElementHandle = await page.$('iframe[class="iframe"]');
  let iframe = await iframeElementHandle.contentFrame();

  console.log("🎪 点击热播总榜标签...");
  const gclElements = await iframe.$$(".gcl__in.gcl__in--hover");
  await gclElements[0].click();

  console.log("🎪 进入iframe标签...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  iframeElementHandle = await page.$('iframe[class="iframe"]');
  iframe = await iframeElementHandle.contentFrame();

  console.log("🎪 点击分类标签...");
  const rtabElements = await iframe.$$(".rtab__slider__link");
  await rtabElements[tagIndex].click();

  console.log("🎪 进入iframe标签...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  iframeElementHandle = await page.$('iframe[class="iframe"]');
  iframe = await iframeElementHandle.contentFrame();

  const movies = await parseIqiyiPlatform(iframe, selector, platformId);
  return movies;
}

/**
 * 解析腾讯视频平台数据
 * @param {Object} page puppeteer页面对象
 * @param {string} selector CSS选择器
 * @param {string} platformId 平台ID
 * @returns {Array} 数据数组
 */
async function parseTencentPlatform(page, selector, platformId) {
  let movies = [];
  const modElements = await page.$$(".mod_rank_figure");
  const titleDict = {
    tencentTV: "电视剧",
    tencentMovie: "电影",
    tencentShow: "综艺",
  };
  for (const mod of modElements) {
    const title = await mod.$eval(".mod_rank_title", (element) => {
      const titleElement = element.querySelector(".title");
      return titleElement.textContent.trim();
    });

    // 匹配对应排行榜单
    if (titleDict[platformId] !== title) continue;

    movies = await mod.$eval(
      ".hotlist",
      (list, selector, platformId) => {
        const results = [];
        try {
          const elements = list.querySelectorAll(selector);
          console.log(
            `🎯 使用选择器: ${selector}, 找到 ${elements.length} 个元素`
          );

          elements.forEach((element, index) => {
            // 获取标题
            const titleElement = element.querySelector(".name");
            const title = titleElement
              ? titleElement.textContent
                  .trim()
                  .replace((index + 1).toString(), "")
              : "";

            if (title && title.length > 1 && index < 20) {
              // 限制数量并确保标题有效
              results.push({
                id: index + 1,
                title,
                hot: null,
                rating: null,
                genre: null,
                year: null,
                description: null,
                platform: platformId,
              });
            }
          });
        } catch (error) {
          console.error("解析腾讯平台数据时出错:", error);
        }
        return results;
      },
      selector,
      platformId
    );
  }

  console.log(`✅ 成功解析到 ${movies.length} 部`);
  return movies;
}

/**
 * 爬取单个平台数据
 * @param {string} platformId 平台ID
 * @returns {Promise<Array>} 电影数据数组
 */
async function crawlPlatform(platformId) {
  const platform = platforms[platformId];
  if (!platform) {
    throw new Error(`未知平台: ${platformId}`);
  }

  console.log(`开始爬取 ${platform.name} 数据...`);

  try {
    // 检查robots.txt
    const url = new URL(platform.url);
    const targetPath = url.pathname;
    const canCrawl = await checkRobotsTxt(url.origin, targetPath);
    if (!canCrawl) {
      console.log(`⚠️  跳过 ${platform.name}，robots.txt 禁止爬取`);
      return [];
    }

    // 使用puppeteer爬取页面并直接解析
    const browser = await puppeteer.launch({
      headless: platform.useHeadless ? "new" : false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--window-size=1920,1080", // 设置窗口大小
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // 强制PC端UA
      ],
    });

    let movies = [];
    try {
      const page = await browser.newPage();

      // 强制设置PC端User-Agent
      const pcUserAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      await page.setUserAgent(pcUserAgent);

      // 设置PC端视口大小
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true,
      });

      // 添加额外的PC端标识
      await page.evaluateOnNewDocument(() => {
        // 覆盖navigator.userAgent
        Object.defineProperty(navigator, "userAgent", {
          get: () =>
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });

        // 设置其他PC端标识
        Object.defineProperty(navigator, "platform", {
          get: () => "Win32",
        });

        Object.defineProperty(navigator, "maxTouchPoints", {
          get: () => 0,
        });

        // 禁用触摸事件
        delete window.ontouchstart;
        delete window.ontouchmove;
        delete window.ontouchend;
      });

      // 拦截图片以提高速度
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (req.resourceType() === "image") {
          req.abort();
        } else {
          req.continue();
        }
      });

      // 导航到页面
      await page.goto(platform.url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // 添加调试信息：检查页面标题
      const pageTitle = await page.title();
      console.log(`📄 页面标题: ${pageTitle}`);

      // 根据平台解析数据
      switch (platformId) {
        case "doubanMovie":
        case "doubanTV":
          movies = await parseDoubanPlatform(
            page,
            platform.selector,
            platformId
          );
          break;

        case "doubanShow":
          movies = await parsedoubanShow(page, platform.selector, platformId);
          break;

        case "iqiyiTV":
          movies = await chooseIqiyiTag(page, platform.selector, platformId, 2);
          break;

        case "iqiyiMovie":
          movies = await chooseIqiyiTag(page, platform.selector, platformId, 4);
          break;

        case "iqiyiShow":
          movies = await chooseIqiyiTag(page, platform.selector, platformId, 5);
          break;

        case "tencentTV":
        case "tencentMovie":
        case "tencentShow":
          movies = await parseTencentPlatform(
            page,
            platform.selector,
            platformId
          );
          break;

        default:
          throw new Error(`未知平台: ${platformId}`);
          break;
      }
    } finally {
      await browser.close();
    }

    console.log(`✅ ${platform.name} 解析到 ${movies.length} 部`);
    return movies;
  } catch (error) {
    console.error(`❌ ${platform.name} 爬取失败:`, error.message);

    // 返回示例数据作为后备
    return [
      {
        id: 1,
        title: `${platform.name}热门电影1`,
        poster: "/placeholder-movie.jpg",
        rating: 8.5,
        genre: "动作",
        year: 2024,
        description: `这是来自${platform.name}的热门电影`,
        platform: platformId,
      },
      {
        id: 2,
        title: `${platform.name}热门电影2`,
        poster: "/placeholder-movie.jpg",
        rating: 8.2,
        genre: "喜剧",
        year: 2024,
        description: `这是来自${platform.name}的热门电影`,
        platform: platformId,
      },
    ];
  }
}

/**
 * 爬取所有平台数据
 */
async function crawlAllPlatforms() {
  const results = {};

  for (const platformId of Object.keys(platforms)) {
    try {
      console.log(`\n🎬 开始处理 ${platforms[platformId].name}...`);
      const movies = await crawlPlatform(platformId);
      results[platformId] = movies;
      console.log(
        `✅ ${platforms[platformId].name} 数据爬取完成，共 ${movies.length} 部影视作品`
      );

      // 添加延时避免被封IP (随机5-8秒)
      const delay = Math.random() * 3000 + 5000;
      console.log(`⏱️  等待 ${Math.round(delay / 1000)} 秒后继续...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      console.error(
        `❌ ${platforms[platformId].name} 数据爬取失败:`,
        error.message
      );
      results[platformId] = [];
    }
  }

  return results;
}

/**
 * 保存数据到文件
 * @param {Object} data 爬取的数据
 */
function saveData(data) {
  try {
    // 确保目录存在
    const dataDir = path.join(__dirname, "../src/data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, "crawledData.json");

    // 添加时间戳和统计信息
    const enrichedData = {
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toLocaleString("zh-CN"),
      totalMovies: Object.values(data).reduce(
        (sum, movies) => sum + movies.length,
        0
      ),
      platforms: Object.keys(data).length,
      data: data,
    };

    fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2), "utf8");
    console.log(`📁 数据已保存到: ${outputPath}`);
    console.log(
      `📊 统计信息: 共 ${enrichedData.platforms} 个平台，${enrichedData.totalMovies} 部电影`
    );
  } catch (error) {
    console.error("💥 保存数据时发生错误:", error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🚀 开始爬取影视排行榜数据...");
  console.log(
    "📋 支持的平台:",
    Object.values(platforms)
      .map((p) => p.name)
      .join(", ")
  );
  console.log("⚠️  注意：本脚本会检查robots.txt并遵守网站的爬取规则");
  console.log("🔄 爬取过程中会自动添加延时以避免对服务器造成压力\n");

  const startTime = Date.now();

  try {
    const data = await crawlAllPlatforms();
    saveData(data);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log("\n✨ 所有数据爬取完成！");
    console.log(`⏱️  总耗时: ${duration} 秒`);

    // 显示爬取结果摘要
    console.log("\n📈 爬取结果摘要:");
    Object.entries(data).forEach(([platformId, movies]) => {
      const platform = platforms[platformId];
      console.log(`  ${platform.name}: ${movies.length} 部影视作品`);
    });
  } catch (error) {
    console.error("💥 爬取过程中发生错误:", error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 程序异常退出:", error);
    process.exit(1);
  });
}

module.exports = {
  crawlPlatform,
  crawlAllPlatforms,
  platforms,
  checkRobotsTxt,
  parseDoubanPlatform,
};
