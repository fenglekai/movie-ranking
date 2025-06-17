'use client';

import { useState } from 'react';
import { getAllPlatforms, getCrawledDataStats } from '@/data/crawledDataAdapter';
import { PlatformRanking } from '@/components/PlatformRanking';
import { ContentFilter } from '@/components/ContentFilter';
import { PlatformSelector } from '@/components/PlatformSelector';
import { MobileMovieCard } from '@/components/MobileMovieCard';
import { ContentType } from '@/types/movie';
import { Zap, Star, Trophy } from 'lucide-react';

export default function Home() {
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('tv');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('douban'); // 手机端选中的平台
  const platforms = getAllPlatforms();
  const stats = getCrawledDataStats();
  


  return (
    <div className="relative min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="w-full max-w-none px-4 lg:px-6 xl:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                热榜追踪器
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                <Star className="w-3 h-3 inline mr-1" />
                发现最热门的影视内容
              </p>
            </div>
          </div>
        </div>
        
        {/* 桌面端导航 */}
        <div className="hidden md:block border-t bg-muted/30">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8 py-3">
            <ContentFilter 
              selectedType={selectedContentType}
              onTypeChange={setSelectedContentType}
            />
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="w-full max-w-none px-4 lg:px-6 xl:px-8 py-6 pb-2 md:pb-6">
        {/* PC端布局 - Grid布局 + 固定高度 + 滚动条 */}
        <div className="hidden md:block">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {platforms.map((platform) => (
              <div key={platform.id} className="h-full">
                <PlatformRanking 
                  platform={platform} 
                  selectedContentType={selectedContentType}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 手机端布局 - 平台选择器 + 单平台列表 */}
        <div className="block md:hidden">
          {/* 平台选择器 */}
          <div className="mb-4">
            <PlatformSelector 
              platforms={platforms}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
            />
          </div>

          {/* 选中平台的内容 */}
          {(() => {
            const currentPlatform = platforms.find(p => p.id === selectedPlatform);
            const filteredMovies = currentPlatform?.movies?.filter(movie => movie.type === selectedContentType) || [];

            return (
              <>

                {/* 内容列表 */}
                <div>
                  {filteredMovies.length === 0 ? (
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
                    <div className="divide-y divide-border/30">
                      {filteredMovies.map((movie, index) => (
                        <MobileMovieCard
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
                  <div className="px-4 py-3 bg-muted/20 border-t">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        共 {filteredMovies.length} 部作品
                      </p>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t backdrop-blur-sm bg-card/95 z-50">
        <div className="w-full px-4 py-3">
          <ContentFilter 
            selectedType={selectedContentType}
            onTypeChange={setSelectedContentType}
          />
        </div>
      </div>

      {/* 页脚 */}
      <footer className="border-t bg-card mt-4 md:mt-16">
        <div className="w-full px-4 lg:px-6 xl:px-8 py-6">
          <div className="text-center text-muted-foreground">
            <p>© 2024 热榜追踪器 - 数据来源于各大视频平台</p>
            <p className="text-sm mt-1">
              共收录 {stats.totalMovies} 部作品，覆盖 {stats.platforms} 个分类
            </p>
            <p className="text-xs mt-1 opacity-70">
              最后更新：{stats.lastUpdated}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
