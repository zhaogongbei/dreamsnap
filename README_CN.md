# 📸 DreamSnap 项目完整介绍

## 🎯 项目概述

**DreamSnap** 是一款 AI 驱动的摄影 Web 应用，专为情侣和新人打造。用户可以上传照片，通过 AI 技术将照片转换为各种主题风格的梦幻效果。

- **作者**: PixelPro Studios
- **版本**: 1.0.0
- **技术栈**: React 19 + TypeScript + Vite + TailwindCSS
- **上线状态**: ✅ 已完成开发，可投入使用

---

## 🌟 核心功能

### 1. 拍照/上传照片
- 📷 **使用相机拍照** - 支持前置/后置摄像头切换
- 📁 **从相册上传** - 支持 JPG、PNG、HEIC 格式
- 📸 **多张照片选择** - 用户可以选择最喜欢的照片

### 2. AI 主题风格转换
- 🎨 **21 种预设主题** 涵盖：
  - 🏖️ 海滩婚礼 | 🌸 樱花动漫 | ⚔️ 权力的游戏
  - 🎃 万圣节 | 🧙 哈利波特 | 🦸 超级英雄
  - 🏔️ 雪山 | 🎈 热气球 | 🌺 热带海滩
  - 🇨🇳 中式婚礼 | 🇮🇳 印度婚礼 | 🇲🇾 马来婚礼
  - 等等...

- 📂 **主题分类筛选** - 婚礼、动漫、奇幻、季节、文化等
- 🏷️ **中英文双语** - 主题名称自动切换语言

### 3. AI 图片生成
- ⚡ **Gemini 2.5 Flash** 驱动
- 🔄 **三路故障转移** - 主用 + 2 个备用 API
- ⏱️ **30-120 秒** 完成生成
- 🖼️ **自动水印** 添加

### 4. 图片预览与操作
- ✨ **高清预览** 生成效果
- 👍 **喜欢/重试** - 可重新选择主题
- 💾 **保存到资产库**
- 📤 **分享到飞书群** - 自动发送通知

### 5. 我的资产库
- 🖼️ **个人照片管理** - 查看所有生成的照片
- ⬇️ **下载高清图片**
- 🗑️ **删除不需要的照片**

### 6. 画廊展示
- 🏛️ **公开画廊** - 展示所有用户作品
- 🆕 **实时更新** - 新照片自动显示

---

## 🔧 技术架构

### 前端技术

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 7 | 构建工具 |
| TailwindCSS 4 | 样式设计 |
| Zustand | 状态管理 |
| React Router | 页面路由 |

### 第三方服务

| 服务 | 用途 |
|------|------|
| **Supabase** | 数据库 + 存储 |
| **Gemini API** | AI 图片生成 |
| **飞书 WebHook** | 消息通知 |
| **Google Auth** | 管理员登录 |

### API 故障转移

```
主用: https://undyapi.com
备用1: https://vip.undyingapi.com
备用2: https://vip.undyingapi.site
```

---

## 📱 用户流程

```
1️⃣ 登录验证
    ↓
2️⃣ 拍照/上传照片
    ↓
3️⃣ 选择最佳照片
    ↓
4️⃣ 选择主题风格
    ↓
5️⃣ AI 生成图片 ⏳ (30-120秒)
    ↓
6️⃣ 预览效果
    ├─ 👍 喜欢 → 7️⃣
    └─ 🔄 重试 → 返回步骤 4
    ↓
7️⃣ 发送通知到飞书群
    ↓
8️⃣ 完成！✨ → 返回首页
```

---

## 🎨 界面特色

- 📱 **移动端优先** 设计
- 🎨 **渐变色主题** - 紫色/粉色渐变
- 🌐 **中英文切换** - 一键切换语言
- 🔮 **梦幻动画** - 加载动画、过渡效果
- 📍 **左侧竖排导航** - 紫色按钮，简洁美观

---

## 📂 项目文件结构

```
dreamsnap/
├── src/
│   ├── components/       # UI 组件
│   │   ├── PhotoCapture.tsx      # 拍照/上传
│   │   ├── PhotoSelection.tsx    # 照片选择
│   │   ├── ThemeSelection.tsx    # 主题选择
│   │   ├── AIGeneration.tsx      # AI 生成
│   │   └── ImagePreview.tsx      # 预览
│   ├── pages/            # 页面
│   │   ├── LoginPage.tsx         # 登录
│   │   ├── AssetsPage.tsx        # 资产库
│   │   └── GalleryPage.tsx       # 画廊
│   ├── lib/              # 工具库
│   │   ├── supabase.ts            # 数据库
│   │   ├── gemini.ts              # AI 生成
│   │   ├── feishu.ts             # 飞书通知
│   │   └── i18n.ts               # 国际化
│   ├── contexts/          # React Context
│   │   ├── AuthContext.tsx       # 认证
│   │   └── LanguageContext.tsx   # 语言
│   └── stores/            # 状态管理
│       └── appStore.ts          # Zustand Store
├── public/               # 静态资源
├── .env.local           # 环境配置
└── package.json
```

---

## ⚙️ 环境配置

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# 飞书机器人
VITE_FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# Gemini API
VITE_GEMINI_API_KEY=sk-xxx
VITE_GEMINI_BASE_URL=https://undyapi.com/v1beta
```

---

## 🚀 启动方式

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview
```

---

## 📊 当前状态

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| 拍照/上传 | ✅ 完成 | 支持相机和相册 |
| AI 生成 | ✅ 完成 | 三路故障转移 |
| 中英文 | ✅ 完成 | 一键切换 |
| 主题翻译 | ✅ 完成 | 21 个主题 |
| 资产库 | ✅ 完成 | 45MB 存储 |
| 画廊 | ✅ 完成 | 实时展示 |
| 飞书通知 | ✅ 完成 | 富文本卡片 |
| 登录验证 | ✅ 完成 | Google Auth |

---

**DreamSnap** 是一个完整的商业级 AI 摄影解决方案，开箱即用！🎉
