import { Platform, Movie, ContentType } from '@/types/movie';
import crawledData from './crawledData.json';

// 定义平台配置类型
interface PlatformConfigItem {
  id: string;
  name: string;
  logo: string;
  color: string;
}

// 平台映射配置 - 将所有子平台映射到主平台（按指定顺序排列）
const platformConfig: Record<string, PlatformConfigItem> = {
  'douban': {
    id: 'douban',
    name: '豆瓣',
    logo: '📖',
    color: 'bg-green-600'
  },
  'iqiyi': {
    id: 'iqiyi',
    name: '爱奇艺',
    logo: '🎬',
    color: 'bg-green-500'
  },
  'tencent': {
    id: 'tencent',
    name: '腾讯视频',
    logo: '🎭',
    color: 'bg-orange-500'
  },
  'mango': {
    id: 'mango',
    name: '芒果TV',
    logo: '🥭',
    color: 'bg-yellow-500'
  },
  'youku': {
    id: 'youku',
    name: '优酷',
    logo: '📺',
    color: 'bg-blue-500'
  }
};

// 子平台到主平台的映射
const subPlatformMapping: Record<string, string> = {
  'tencentTV': 'tencent',
  'tencentMovie': 'tencent',
  'tencentShow': 'tencent',
  'iqiyiTV': 'iqiyi',
  'iqiyiMovie': 'iqiyi',
  'iqiyiShow': 'iqiyi',
  'doubanMovie': 'douban',
  'doubanTV': 'douban',
  'doubanShow': 'douban'
};

// 根据标题和平台推断内容类型
function inferContentType(title: string, platformKey: string): ContentType {
  // 首先根据子平台类型明确判断
  if (platformKey.includes('Movie')) {
    return 'movie';
  }
  if (platformKey.includes('TV')) {
    return 'tv';
  }
  if (platformKey.includes('Show')) {
    return 'variety';
  }
  
  // 其他情况默认为电视剧
  return 'tv';
}

// 定义爬取数据项的类型
interface CrawledDataItem {
  id: number;
  title: string;
  rating?: number | string | null;
  genre?: string | string[] | null;
  year?: number | null;
  description?: string | null;
  episodes?: number;
  status?: string;
  platform?: string;
  url?: string;
  hot?: string | number | null;
  poster?: string;
}

// 转换爬取的数据为前端格式
function convertCrawledDataToMovie(item: CrawledDataItem, platformKey: string): Movie {
  const contentType = inferContentType(item.title, platformKey);
  
  // 处理评分
  let rating = 0;
  if (item.rating) {
    const ratingNum = typeof item.rating === 'string' ? parseFloat(item.rating) : item.rating;
    rating = isNaN(ratingNum) ? 0 : ratingNum;
  }
  
  // 处理类型
  let genre = '未分类';
  if (item.genre) {
    if (Array.isArray(item.genre)) {
      genre = item.genre.join(', ');
    } else {
      genre = item.genre;
    }
  }
  
  const mainPlatformId = subPlatformMapping[platformKey] || platformKey;
  const config = platformConfig[mainPlatformId];
  const platformName = config?.name || platformKey;
  
  // 创建唯一ID，避免不同子平台间的ID冲突
  const uniqueId = parseInt(`${item.id}${platformKey.slice(-2).charCodeAt(0)}`);
  
  return {
    id: uniqueId,
    title: item.title || '未知标题',
    poster: '/placeholder-movie.svg', // 使用默认占位图
    rating: rating,
    genre: genre,
    year: item.year || new Date().getFullYear(),
    description: item.description || `${item.title} - 来自${platformName}`,
    type: contentType,
    episodes: item.episodes,
    status: item.status
  };
}

// 获取所有平台数据
export function getAllPlatforms(): Platform[] {
  const platformMoviesMap: Record<string, Movie[]> = {};
  
  // 初始化所有主平台
  Object.values(platformConfig).forEach(config => {
    platformMoviesMap[config.id] = [];
  });
  
  // 遍历爬取数据中的所有子平台，合并到主平台
  if (crawledData && crawledData.data) {
    Object.entries(crawledData.data).forEach(([subPlatformKey, items]) => {
      const mainPlatformId = subPlatformMapping[subPlatformKey];
      
      if (mainPlatformId && Array.isArray(items)) {
        const movies = items.map(item => convertCrawledDataToMovie(item, subPlatformKey));
        // 将子平台的数据合并到主平台
        platformMoviesMap[mainPlatformId].push(...movies);
      }
    });
  }
  
  // 创建最终的平台列表（按指定顺序）
  const platformOrder = ['douban', 'iqiyi', 'tencent', 'mango', 'youku'];
  const platforms: Platform[] = platformOrder.map(platformId => {
    const config = platformConfig[platformId];
    return {
      id: config.id,
      name: config.name,
      logo: config.logo,
      color: config.color,
      movies: platformMoviesMap[config.id] || []
    };
  });
  
  return platforms;
}

// 根据平台ID获取数据
export async function fetchPlatformData(platformId: string): Promise<Movie[]> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const platforms = getAllPlatforms();
  const platform = platforms.find(p => p.id === platformId);
  
  return platform?.movies || [];
}

// 获取统计信息
export function getCrawledDataStats() {
  if (!crawledData) {
    return {
      totalMovies: 0,
      platforms: 0,
      lastUpdated: '未知'
    };
  }
  
  return {
    totalMovies: crawledData.totalMovies || 0,
    platforms: crawledData.platforms || 0,
    lastUpdated: crawledData.lastUpdated || '未知'
  };
}

// 调试函数 - 查看数据转换详情
export function debugPlatformData() {
  console.log('=== 调试平台数据 ===');
  
  const platforms = getAllPlatforms();
  
  platforms.forEach(platform => {
    console.log(`\n平台: ${platform.name} (${platform.id})`);
    console.log(`总数据: ${platform.movies.length}`);
    
    const movieCount = platform.movies.filter(m => m.type === 'movie').length;
    const tvCount = platform.movies.filter(m => m.type === 'tv').length;
    const varietyCount = platform.movies.filter(m => m.type === 'variety').length;
    
    console.log(`- 电影: ${movieCount}`);
    console.log(`- 电视剧: ${tvCount}`);
    console.log(`- 综艺: ${varietyCount}`);
    
    // 显示前3个数据的详情
    if (platform.movies.length > 0) {
      console.log('前3个数据:');
      platform.movies.slice(0, 3).forEach((movie, idx) => {
        console.log(`  ${idx + 1}. ${movie.title} - ${movie.type}`);
      });
    }
  });
  
  return platforms;
} 