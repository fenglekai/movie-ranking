import { Platform, Movie } from '@/types/movie';

// 示例内容数据
const sampleMovies: Movie[] = [
  {
    id: 1,
    title: "流浪地球3",
    poster: "/placeholder-movie.jpg",
    rating: 8.5,
    genre: "科幻",
    year: 2024,
    description: "人类再次面临生存危机，刘培强等人踏上了更加危险的太空征程。",
    type: "movie",
    url: "",
  },
  {
    id: 2,
    title: "狂飙",
    poster: "/placeholder-movie.jpg",
    rating: 9.0,
    genre: "剧情",
    year: 2024,
    description: "一部以扫黑除恶为背景的现实主义电视剧，展现了正义与邪恶的较量。",
    type: "tv",
    episodes: 39,
    url: "",
    status: "完结"
  },
  {
    id: 3,
    title: "向往的生活",
    poster: "/placeholder-movie.jpg",
    rating: 7.8,
    genre: "生活",
    year: 2024,
    description: "明星嘉宾回归田园，体验简单朴素的慢生活，感受人与自然的和谐。",
    type: "variety",
    episodes: 12,
    url: "",
    status: "更新中"
  },
  {
    id: 4,
    title: "中国古代建筑",
    poster: "/placeholder-movie.jpg",
    rating: 8.9,
    genre: "历史",
    year: 2024,
    description: "深度探索中国古代建筑艺术，揭示千年文明的建筑智慧和文化内涵。",
    type: "movie",
    episodes: 8,
    url: "",
    status: "完结"
  },
  {
    id: 5,
    title: "热辣滚烫",
    poster: "/placeholder-movie.jpg",
    rating: 8.0,
    genre: "喜剧",
    year: 2024,
    description: "一个关于自我救赎和重新开始的暖心故事，笑中带泪，温暖人心。",
    url: "",
    type: "movie"
  }
];

export const platforms: Platform[] = [
  {
    id: 'iqiyi',
    name: '爱奇艺',
    logo: '🎬',
    color: 'bg-green-500',
    movies: sampleMovies
  },
  {
    id: 'youku',
    name: '优酷',
    logo: '📺',
    color: 'bg-blue-500',
    movies: sampleMovies
  },
  {
    id: 'tencent',
    name: '腾讯视频',
    logo: '🎭',
    color: 'bg-orange-500',
    movies: sampleMovies
  },
  {
    id: 'mango',
    name: '芒果TV',
    logo: '🥭',
    color: 'bg-yellow-500',
    movies: sampleMovies
  },
  {
    id: 'douban',
    name: '豆瓣',
    logo: '📖',
    color: 'bg-green-600',
    movies: sampleMovies
  }
];

// 这个函数将来可以被爬虫脚本替换
export const fetchPlatformData = async (platformId: string): Promise<Movie[]> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const platform = platforms.find(p => p.id === platformId);
  return platform?.movies || [];
}; 