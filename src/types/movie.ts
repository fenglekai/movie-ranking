export type ContentType = 'movie' | 'tv' | 'variety';

export interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  genre: string;
  year: number;
  description: string;
  type: ContentType;
  episodes?: number; // 电视剧集数
  status?: string; // 更新状态：完结、更新中等
}

export interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  movies: Movie[];
}

export type PlatformType = 'iqiyi' | 'youku' | 'tencent' | 'mango' | 'douban'; 