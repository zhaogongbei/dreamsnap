#!/usr/bin/env node

/**
 * DreamSnap 自动更新日志脚本
 * 
 * 使用方法：
 * node scripts/auto-changelog.js "更新说明"
 * 
 * 例如：
 * node scripts/auto-changelog.js "添加新功能：用户头像上传"
 */

const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');
const DATE = new Date().toISOString().split('T')[0];

function appendChangelog(message, type = 'feat') {
  const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  
  // 找到今天的日期标题
  const todayHeader = `## [${DATE}]`;
  
  // 如果今天还没有记录，创建新的日期区块
  let newContent;
  if (changelog.includes(todayHeader)) {
    // 添加到今天的区块
    const typeEmoji = getTypeEmoji(type);
    const newEntry = `\n#### ${typeEmoji} ${formatMessage(message)}`;
    newContent = changelog.replace(
      todayHeader,
      `${todayHeader}\n${newEntry}`
    );
  } else {
    // 创建新的日期区块
    const typeEmoji = getTypeEmoji(type);
    const newBlock = `\n\n## [${DATE}] 新增更新\n\n### ${type === 'feat' ? '✨ 新功能' : type === 'fix' ? '🐛 Bug 修复' : '🎨 UI 优化'}\n\n#### ${typeEmoji} ${formatMessage(message)}\n`;
    newContent = changelog.replace(
      '---\n\n## 📊 项目当前状态',
      `${newBlock}---\n\n## 📊 项目当前状态`
    );
  }
  
  fs.writeFileSync(CHANGELOG_PATH, newContent);
  console.log('✅ 更新日志已记录！');
}

function getTypeEmoji(type) {
  const emojis = {
    'feat': '✨',
    'fix': '🐛',
    'ui': '🎨',
    'docs': '📝',
    'refactor': '♻️',
    'perf': '⚡',
    'test': '✅',
    'build': '🔧',
    'ci': '👷',
    'chore': '📦',
  };
  return emojis[type] || '📝';
}

function formatMessage(message) {
  return message.charAt(0).toUpperCase() + message.slice(1);
}

// 主程序
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法：node auto-changelog.js "更新说明" [type]');
  console.log('type: feat | fix | ui | docs | refactor | perf | test | build | ci | chore');
  process.exit(1);
}

const message = args[0];
const type = args[1] || 'feat';

appendChangelog(message, type);
