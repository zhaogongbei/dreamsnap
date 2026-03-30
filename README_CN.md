# 📸 DreamSnap 项目介绍

> AI 驱动的摄影主题转换 Web 应用
> 
> 🌐 线上地址：https://www.528258.xyz/
> 📦 GitHub：https://github.com/zhaogongbei/dreamsnap

---

## 🎯 项目概述

**DreamSnap** 是一款基于 AI 的摄影 Web 应用，用户拍照或上传照片后，通过 AI 技术将照片转换为各种主题风格的艺术效果图。支持 29 种主题风格，中英文双语界面，生成完成后自动发送通知到飞书群。

- **版本**：1.0.0
- **技术栈**：React 19 + TypeScript + Vite + TailwindCSS
- **部署平台**：Vercel
- **上线状态**：✅ 已上线运行

---

## 🌟 核心功能

### 1. 拍照 / 上传照片
- 📷 使用设备摄像头拍照，支持前置/后置切换
- 📁 从相册上传，支持 JPG、PNG、HEIC 格式
- 📸 自动拍摄 5 张，用户选择最佳一张

### 2. AI 主题风格转换（29 种主题）

#### 🎭 动漫风格（11 种）
| 主题 | 中文 | 风格说明 |
|------|------|---------|
| Cherry Blossom Anime | 樱花动漫 | 日式动漫，樱花背景 |
| Jungle Cartoon Adventure | 丛林卡通冒险 | 卡通动画，丛林场景 |
| Studio Ghibli Style | 宫崎骏风格 | 吉卜力水彩动画风 |
| Cyberpunk Style | 赛博朋克风格 | 霓虹灯光，未来科技 |
| Impressionist Style | 印象派风格 | 印象派绘画，笔触感 |
| Mecha Style | 机甲风格 | 机械装甲，机器人 |
| Game CG Style | 游戏CG风格 | 高质量游戏渲染 |
| Chinese Style | 国风风格 | 中国水墨画风格 |
| Pixar Style | 皮克斯风格 | 3D动画，温馨可爱 |
| Picture Book Story Style | 绘本故事风格 | 绘本插画，童话氛围 |
| Retro Comic Style | 复古漫画风格 | 复古漫画，网点效果 |

#### 💒 婚礼风格（5 种）
| 主题 | 中文 |
|------|------|
| Beach Wedding | 海滩婚礼 |
| Classic Garden Wedding | 经典花园婚礼 |
| Desert Sand Dunes Wedding | 沙漠沙丘婚礼 |
| Tropical Beach Wedding | 热带海滩婚礼 |

#### ⚔️ 奇幻风格（3 种）
| 主题 | 中文 |
|------|------|
| Game of Thrones Fantasy | 权力的游戏奇幻 |
| Harry Potter Magic | 哈利波特魔法 |
| Superhero Epic | 超级英雄史诗 |

#### 🏔️ 冒险风格（3 种）
| 主题 | 中文 |
|------|------|
| Mountain Summit | 山顶冒险 |
| Hot Air Balloon Adventure | 热气球探险 |
| Ski Resort Winter | 滑雪度假村冬季 |

#### 🌏 文化风格（3 种）
| 主题 | 中文 |
|------|------|
| Indian Cultural Wedding | 印度文化婚礼 |
| Traditional Chinese Wedding | 传统中式婚礼 |
| Traditional Malay Wedding | 传统马来婚礼 |

#### 🎉 其他风格（4 种）
| 主题 | 中文 | 分类 |
|------|------|------|
| Elegant Garden Party | 优雅花园派对 | party |
| Romantic Garden Party | 浪漫花园派对 | party |
| Halloween Spooky | 万圣节恐怖 | seasonal |
| Winter Wonderland | 冬日仙境 | seasonal |
| Singapore Coffee Shop | 新加坡咖啡店 | local |

### 3. AI 图片生成
- ⚡ 使用 **Gemini 2.5 Flash** 模型驱动
- 🔄 三路 API 故障转移，保障稳定性
- ⏱️ 生成时间约 30-120 秒
- 🖼️ 输出尺寸：1080x1920 竖屏格式
- 🔒 严格保留人脸特征（写实风格）

### 4. 图片预览与保存
- ✨ 高清预览生成效果
- 👍 喜欢则继续，不满意可重新选主题
- 💾 保存到个人资产库
- 📤 自动发送通知到飞书群

### 5. 个人资产库
- 🖼️ 查看所有历史生成记录
- ⬇️ 下载高清图片
- 🗑️ 删除不需要的记录

### 6. 公开画廊
- 🏛️ 展示所有用户作品
- 🆕 实时更新

---

## 📱 用户流程

```
登录验证
    ↓
拍照 / 上传照片
    ↓
选择最佳照片
    ↓
选择主题风格（29种）
    ↓
AI 生成图片（30-120秒）
    ↓
预览效果
    ├─ 喜欢 → 发送飞书通知 → 完成 ✨
    └─ 不满意 → 重新选择主题
```

---

## 🎨 界面特色

- 📱 移动端优先设计，适配手机竖屏
- 🎨 紫色/粉色渐变主题
- 🌐 中英文一键切换
- 🔮 流畅的加载动画和过渡效果
- 🧭 拍照页隐藏导航，其他页面左侧竖排导航按钮

---

## 🔧 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Vite | 7 | 构建工具 |
| TailwindCSS | 4 | 样式设计 |
| Zustand | - | 状态管理 |
| React Router | 7 | 页面路由 |
| react-webcam | - | 摄像头调用 |

### 第三方服务

| 服务 | 用途 |
|------|------|
| **Supabase** | 数据库 + 图片存储 |
| **Gemini API** | AI 图片生成 |
| **飞书 WebHook** | 生成完成消息通知 |
| **Google Auth** | 管理员登录验证 |
| **Vercel** | 自动部署托管 |

### API 故障转移策略

```
主用：  https://undyapi.com/v1beta
备用1： https://vip.undyingapi.com/v1beta
备用2： https://vip.undyingapi.site/v1beta
```

---

## 📂 项目结构

```
dreamsnap/
├── public/
│   ├── previewImage/        # AI 参考图（29张）
│   ├── themeImage/          # 主题预览图（29张）
│   ├── themes/              # 主题缩略图
│   └── frames/              # 水印图片
├── src/
│   ├── components/
│   │   ├── PhotoCapture.tsx      # 拍照/上传
│   │   ├── PhotoSelection.tsx    # 照片选择
│   │   ├── ThemeSelection.tsx    # 主题选择
│   │   ├── AIGeneration.tsx      # AI 生成
│   │   └── ImagePreview.tsx      # 预览
│   ├── pages/
│   │   ├── LoginPage.tsx         # 登录页
│   │   ├── AssetsPage.tsx        # 资产库
│   │   └── GalleryPage.tsx       # 画廊
│   ├── lib/
│   │   ├── themes.ts             # 主题配置（29种）
│   │   ├── gemini.ts             # AI 生成逻辑
│   │   ├── feishu.ts             # 飞书通知
│   │   ├── i18n.ts               # 中英文翻译
│   │   └── supabase.ts           # 数据库操作
│   ├── contexts/
│   │   ├── AuthContext.tsx       # 登录认证
│   │   └── LanguageContext.tsx   # 语言切换
│   ├── stores/
│   │   └── appStore.ts           # 全局状态
│   └── App.tsx                   # 主路由
├── CHANGELOG.md             # 更新日志
├── vercel.json              # Vercel 部署配置
├── vite.config.ts           # 构建配置
└── package.json
```

---

## ⚙️ 环境变量配置

```env
# Supabase
VITE_SUPABASE_URL=https://piixpofklisorumvrenm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# 飞书机器人 WebHook
VITE_FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# Gemini AI
VITE_GEMINI_API_KEY=your_api_key
VITE_GEMINI_BASE_URL=https://undyapi.com/v1beta
VITE_GEMINI_BACKUP_URL_1=https://vip.undyingapi.com/v1beta
VITE_GEMINI_BACKUP_URL_2=https://vip.undyingapi.site/v1beta
```

---

## 🚀 本地开发

```bash
# 克隆项目
git clone https://github.com/zhaogongbei/dreamsnap.git
cd dreamsnap

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 填写 .env.local 中的各项配置

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

---

## 📊 功能状态

| 功能模块 | 状态 | 最后更新 |
|---------|:----:|---------|
| 拍照/上传 | ✅ | 2026-03-28 |
| AI 图片生成 | ✅ | 2026-03-28 |
| 主题风格（29种） | ✅ | 2026-03-30 |
| 中英文切换 | ✅ | 2026-03-28 |
| 个人资产库 | ✅ | 2026-03-28 |
| 公开画廊 | ✅ | 2026-01-10 |
| 飞书通知 | ✅ | 2026-03-28 |
| 管理员登录 | ✅ | 2026-01-05 |
| Vercel 自动部署 | ✅ | 2026-03-28 |

---

## 📋 更新历史摘要

| 日期 | 版本 | 主要更新 |
|------|------|---------|
| 2026-03-30 | v1.3 | 新增 9 个动漫风格主题，总计 29 种 |
| 2026-03-28 | v1.2 | 飞书集成、中英文国际化、修复摄像头黑屏、Vercel 部署 |
| 2026-01-10 | v1.1 | 画廊实时更新、SuccessPage 优化 |
| 2026-01-03 | v1.0 | 项目初始化，基础功能完成 |

> 完整更新日志见 [CHANGELOG.md](./CHANGELOG.md)

---

*DreamSnap — 让每张照片都成为艺术 ✨*
