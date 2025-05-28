'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [crawling, setCrawling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleCrawl = async () => {
    setCrawling(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/rankings', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('success');
        setMessage('数据爬取完成！');
        setLastUpdate(new Date().toLocaleString('zh-CN'));
      } else {
        setStatus('error');
        setMessage(result.error || '爬取失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('网络错误，请稍后重试');
    } finally {
      setCrawling(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      const response = await fetch('/api/rankings');
      const result = await response.json();
      
      if (result.success) {
        setLastUpdate(new Date(result.timestamp).toLocaleString('zh-CN'));
        setStatus('success');
        setMessage(`数据来源: ${result.source === 'crawled' ? '爬取数据' : '模拟数据'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage('获取数据状态失败');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">数据管理后台</h1>
              <p className="text-muted-foreground">管理影视排行榜数据爬取</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 数据爬取控制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                数据爬取控制
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCrawl}
                  disabled={crawling}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${crawling ? 'animate-spin' : ''}`} />
                  {crawling ? '爬取中...' : '开始爬取数据'}
                </button>
                
                <button
                  onClick={handleRefreshData}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  刷新数据状态
                </button>
              </div>

              {/* 状态显示 */}
              {status !== 'idle' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  {status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">{message}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 数据状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                数据状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">最后更新时间:</span>
                  <Badge variant="outline">
                    {lastUpdate || '未知'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">爬取状态:</span>
                  <Badge variant={crawling ? "default" : "secondary"}>
                    {crawling ? '进行中' : '空闲'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">支持平台:</span>
                  <Badge variant="outline">5个平台</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 平台列表 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>支持的平台</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: '爱奇艺', logo: '🎬', color: 'bg-green-500' },
                { name: '优酷', logo: '📺', color: 'bg-blue-500' },
                { name: '腾讯视频', logo: '🎭', color: 'bg-orange-500' },
                { name: '芒果TV', logo: '🥭', color: 'bg-yellow-500' },
                { name: '豆瓣', logo: '📖', color: 'bg-green-600' },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-2 p-3 bg-card rounded-lg border"
                >
                  <div className={`w-8 h-8 rounded ${platform.color} flex items-center justify-center text-white text-sm`}>
                    {platform.logo}
                  </div>
                  <span className="font-medium text-sm">{platform.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• 点击"开始爬取数据"按钮手动触发数据爬取</p>
              <p>• 爬取过程可能需要几分钟时间，请耐心等待</p>
              <p>• 数据会自动保存到 src/data/crawledData.json 文件</p>
              <p>• 前端页面会自动使用最新的爬取数据</p>
              <p>• 如果爬取失败，系统会继续使用模拟数据</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 