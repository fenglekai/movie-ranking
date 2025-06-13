'use client';

import { useState } from 'react';
import { getAllPlatforms, getCrawledDataStats } from '@/data/crawledDataAdapter';
import { PlatformRanking } from '@/components/PlatformRanking';
import { ContentFilter } from '@/components/ContentFilter';
import { ContentType } from '@/types/movie';
import { Zap, Star } from 'lucide-react';

export default function Home() {
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('tv');
  const platforms = getAllPlatforms();
  const stats = getCrawledDataStats();
  


  return (
    <div className="relative min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
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
          <div className="container mx-auto px-4 py-3">
            <ContentFilter 
              selectedType={selectedContentType}
              onTypeChange={setSelectedContentType}
            />
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* 排行榜网格 - 使用flex布局避免高度空白问题 */}
        <div className="flex flex-wrap gap-6 justify-center">
          {platforms.map((platform) => (
            <div key={platform.id} className="w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] min-w-[300px] flex-shrink-0">
              <PlatformRanking 
                platform={platform} 
                selectedContentType={selectedContentType}
              />
            </div>
          ))}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t backdrop-blur-sm bg-card/95 z-50">
        <div className="container mx-auto px-4 py-3">
          <ContentFilter 
            selectedType={selectedContentType}
            onTypeChange={setSelectedContentType}
          />
        </div>
      </div>

      {/* 页脚 */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>© 2024 热榜追踪器 - 数据来源于各大视频平台</p>
            <p className="text-sm mt-1">
              共收录 {stats.totalMovies} 部作品，覆盖 {stats.platforms} 个平台
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
