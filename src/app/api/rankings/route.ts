import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 读取爬取的数据
    const crawledDataPath = path.join(process.cwd(), 'src/data/crawledData.json');
    
    if (fs.existsSync(crawledDataPath)) {
      const crawledData = JSON.parse(fs.readFileSync(crawledDataPath, 'utf8'));
      
      // 检查数据是否存在且有效
      if (crawledData.data && Object.keys(crawledData.data).length > 0) {
        return NextResponse.json({
          success: true,
          data: crawledData.data,
          source: 'crawled',
          lastUpdated: crawledData.lastUpdated,
          totalMovies: crawledData.totalMovies,
          platforms: crawledData.platforms,
          timestamp: crawledData.timestamp
        });
      }
    }
    
    // 如果没有有效的爬取数据，返回模拟数据
    console.log('使用模拟数据，因为爬取数据不可用');
    const { platforms } = await import('@/data/mockData');
    const mockData = platforms.reduce((acc, platform) => {
      acc[platform.id] = platform.movies;
      return acc;
    }, {} as Record<string, unknown>);
    
    return NextResponse.json({
      success: true,
      data: mockData,
      source: 'mock',
      lastUpdated: '模拟数据',
      totalMovies: platforms.reduce((total, platform) => total + platform.movies.length, 0),
      platforms: platforms.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API错误:', error);
    
    // 错误情况下也尝试返回模拟数据
    try {
      const { platforms } = await import('@/data/mockData');
      const mockData = platforms.reduce((acc, platform) => {
        acc[platform.id] = platform.movies;
        return acc;
      }, {} as Record<string, unknown>);
      
      return NextResponse.json({
        success: true,
        data: mockData,
        source: 'mock',
        lastUpdated: '模拟数据（错误回退）',
        totalMovies: platforms.reduce((total, platform) => total + platform.movies.length, 0),
        platforms: platforms.length,
        timestamp: new Date().toISOString(),
        warning: '数据获取出现错误，使用模拟数据'
      });
    } catch (fallbackError) {
      console.error('模拟数据加载失败:', fallbackError);
      return NextResponse.json(
        { 
          success: false, 
          error: '获取数据失败',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  }
} 