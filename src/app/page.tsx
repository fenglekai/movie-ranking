'use client';

import { useState } from 'react';
import { platforms } from '@/data/mockData';
import { PlatformRanking } from '@/components/PlatformRanking';
import { ContentFilter } from '@/components/ContentFilter';
import { ContentType } from '@/types/movie';
import { TrendingUp, Database, Zap, Star } from 'lucide-react';

export default function Home() {
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'all'>('movie');

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <a
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">管理后台</span>
            </a>
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
        {/* 统计信息 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">平台热度</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center gap-2 p-3 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 rounded ${platform.color} flex items-center justify-center text-white text-sm`}>
                  {platform.logo}
                </div>
                <span className="font-medium text-sm">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 排行榜网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <PlatformRanking 
              key={platform.id} 
              platform={platform} 
              selectedContentType={selectedContentType}
            />
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
            <p className="text-sm mt-1">实时追踪热门内容</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
