import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export async function GET() {
  try {
    // 尝试读取爬取的数据
    const crawledDataPath = path.join(process.cwd(), 'src/data/crawledData.json');
    
    if (fs.existsSync(crawledDataPath)) {
      const crawledData = JSON.parse(fs.readFileSync(crawledDataPath, 'utf8'));
      return NextResponse.json({
        success: true,
        data: crawledData,
        source: 'crawled',
        timestamp: new Date().toISOString()
      });
    } else {
      // 如果没有爬取数据，返回模拟数据
      const { platforms } = await import('@/data/mockData');
      const mockData = platforms.reduce((acc, platform) => {
        acc[platform.id] = platform.movies;
        return acc;
      }, {} as Record<string, unknown>);
      
      return NextResponse.json({
        success: true,
        data: mockData,
        source: 'mock',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('API错误:', error);
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

export async function POST(): Promise<NextResponse> {
  try {
    // 触发数据爬取
    const crawlerProcess = spawn('node', ['scripts/crawler.js'], {
      cwd: process.cwd()
    });

    return new Promise<NextResponse>((resolve) => {
      crawlerProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: '数据爬取完成',
            timestamp: new Date().toISOString()
          }));
        } else {
          resolve(NextResponse.json(
            {
              success: false,
              error: '数据爬取失败',
              timestamp: new Date().toISOString()
            },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('爬取触发错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '无法启动数据爬取',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 