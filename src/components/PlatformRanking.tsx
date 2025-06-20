'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform, Movie, ContentType } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { fetchPlatformData } from '@/data/crawledDataAdapter';
import { Loader2, Trophy } from 'lucide-react';

interface PlatformRankingProps {
  platform: Platform;
  selectedContentType: ContentType;
}

export function PlatformRanking({ platform, selectedContentType }: PlatformRankingProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // 过滤电影列表
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => movie.type === selectedContentType);
  }, [movies, selectedContentType]);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchPlatformData(platform.id);
      setMovies(data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [platform.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4 border-b flex-shrink-0">
                  <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white text-xl shadow-md`}>
              {platform.logo}
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                {platform.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                共 {filteredMovies.length} 部作品
              </p>
            </div>
          </div>
      </div>

      {/* 内容区域 - 添加滚动条 */}
      <div className="bg-background/50 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">加载中...</span>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  暂无{
                    selectedContentType === 'movie' ? '电影' : 
                    selectedContentType === 'tv' ? '电视剧' : '综艺'
                  }数据
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  请稍后再试或切换其他分类
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/30" style={{ height: 'calc(100vh - 320px)' }}>
            {filteredMovies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}`}
                movie={movie}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部统计信息 */}
      {filteredMovies.length > 0 && (
        <div className="px-6 py-3 bg-muted/20 border-t flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-muted-foreground">
              共 {filteredMovies.length} 部作品
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 