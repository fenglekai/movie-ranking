#!/usr/bin/env node

/**
 * 爬取API测试用例
 * 用于本地测试 /api/cron-crawl 是否正常工作
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 300000, // 5分钟超时
  dataPath: path.join(__dirname, '../src/data/crawledData.json')
};

/**
 * 等待服务器启动
 */
async function waitForServer(maxAttempts = 10) {
  console.log('⏳ 检查开发服务器状态...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/rankings`);
      if (response.ok) {
        console.log('✅ 开发服务器已就绪');
        return true;
      }
    } catch {
      console.log(`🔄 等待服务器启动... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('❌ 开发服务器启动失败或超时');
}

/**
 * 测试爬取API
 */
async function testCrawlAPI() {
  console.log('\n🎯 测试爬取API...');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/cron-crawl`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`⏱️  执行时间: ${duration.toFixed(2)}秒`);
    console.log(`📡 响应状态: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API返回错误状态: ${response.status}`);
    }
    
    // 验证响应结构
    const requiredFields = ['success', 'timestamp'];
    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`响应缺少必需字段: ${field}`);
      }
    }
    
    if (result.success) {
      console.log('✅ 爬取API执行成功');
      console.log(`📊 统计信息:`);
      console.log(`   - 总影视数: ${result.totalMovies || 'N/A'}`);
      console.log(`   - 平台数: ${result.platforms || 'N/A'}`);
      console.log(`   - 更新时间: ${result.lastUpdated || 'N/A'}`);
      
      return result;
    } else {
      throw new Error(`爬取失败: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ 爬取API测试失败:', error.message);
    throw error;
  }
}

/**
 * 验证生成的数据文件
 */
async function validateDataFile() {
  console.log('\n📁 验证数据文件...');
  
  if (!fs.existsSync(TEST_CONFIG.dataPath)) {
    throw new Error('数据文件不存在');
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(TEST_CONFIG.dataPath, 'utf8'));
    
    // 验证数据结构
    const requiredFields = ['timestamp', 'lastUpdated', 'totalMovies', 'platforms', 'data'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`数据文件缺少必需字段: ${field}`);
      }
    }
    
    // 验证数据内容
    if (!data.data || typeof data.data !== 'object') {
      throw new Error('数据文件中的data字段无效');
    }
    
    const platformCount = Object.keys(data.data).length;
    const totalMovies = Object.values(data.data).reduce((total, movies) => {
      return total + (Array.isArray(movies) ? movies.length : 0);
    }, 0);
    
    console.log('✅ 数据文件验证通过');
    console.log(`📊 文件统计:`);
    console.log(`   - 平台数: ${platformCount}`);
    console.log(`   - 总影视数: ${totalMovies}`);
    console.log(`   - 文件大小: ${(fs.statSync(TEST_CONFIG.dataPath).size / 1024).toFixed(2)} KB`);
    
    // 显示各平台数据详情
    console.log(`📺 各平台数据:`);
    for (const [platform, movies] of Object.entries(data.data)) {
      const count = Array.isArray(movies) ? movies.length : 0;
      const sample = count > 0 ? movies[0]?.title || '无标题' : '无数据';
      console.log(`   - ${platform}: ${count}部 (示例: ${sample})`);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ 数据文件验证失败:', error.message);
    throw error;
  }
}

/**
 * 测试数据读取API
 */
async function testRankingsAPI() {
  console.log('\n🔍 测试数据读取API...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/rankings`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API返回错误状态: ${response.status}`);
    }
    
    console.log('✅ 数据读取API正常');
    console.log(`📂 数据来源: ${result.source}`);
    console.log(`⏰ 最后更新: ${result.lastUpdated}`);
    
    if (result.source === 'crawled') {
      console.log('🎉 成功读取到爬取数据!');
    } else {
      console.log('⚠️  当前使用模拟数据');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ 数据读取API测试失败:', error.message);
    throw error;
  }
}

/**
 * 性能测试
 */
async function performanceTest() {
  console.log('\n⚡ 性能测试...');
  
  const tests = [
    { name: '数据读取API', url: '/api/rankings' },
  ];
  
  for (const test of tests) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${test.url}`);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ ${test.name}: ${duration}ms`);
      } else {
        console.log(`❌ ${test.name}: 失败 (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: 错误 - ${error.message}`);
    }
  }
}

/**
 * 清理测试数据（可选）
 */
function cleanup(skipCleanup = true) {
  if (skipCleanup) {
    console.log('\n📝 保留测试数据用于查看');
    return;
  }
  
  console.log('\n🧹 清理测试数据...');
  
  if (fs.existsSync(TEST_CONFIG.dataPath)) {
    fs.unlinkSync(TEST_CONFIG.dataPath);
    console.log('✅ 测试数据已清理');
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始爬取API测试...\n');
  console.log('📋 测试计划:');
  console.log('  1. 检查开发服务器状态');
  console.log('  2. 执行爬取API测试');
  console.log('  3. 验证生成的数据文件');
  console.log('  4. 测试数据读取API');
  console.log('  5. 性能测试');
  console.log('  6. 生成测试报告\n');
  
  const testResults = {
    total: 5,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // 1. 检查服务器
    await waitForServer();
    testResults.passed++;
    
    // 2. 测试爬取API
    try {
      await testCrawlAPI();
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`爬取API: ${error.message}`);
    }
    
    // 3. 验证数据文件
    try {
      await validateDataFile();
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`数据文件验证: ${error.message}`);
    }
    
    // 4. 测试数据读取API
    try {
      await testRankingsAPI();
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`数据读取API: ${error.message}`);
    }
    
    // 5. 性能测试
    try {
      await performanceTest();
      testResults.passed++;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`性能测试: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ 测试初始化失败:', error.message);
    testResults.failed++;
    testResults.errors.push(`初始化: ${error.message}`);
  }
  
  // 生成测试报告
  console.log('\n📊 测试报告');
  console.log('==================');
  console.log(`✅ 通过: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ 失败: ${testResults.failed}/${testResults.total}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有测试通过! 爬取功能正常，可以部署到Vercel');
  } else {
    console.log('\n⚠️  部分测试失败，请检查并修复问题后重新测试');
  }
  
  // 清理（默认不清理，保留数据供查看）
  cleanup();
  
  console.log('\n📝 下一步:');
  console.log('  - 如果测试通过，可以提交代码并部署到Vercel');
  console.log('  - 查看生成的 src/data/crawledData.json 确认数据格式');
  console.log('  - 部署后Vercel会自动设置Cron Jobs每小时运行');
}

// 运行测试
runTests().catch(error => {
  console.error('\n💥 测试运行失败:', error);
  process.exit(1);
}); 