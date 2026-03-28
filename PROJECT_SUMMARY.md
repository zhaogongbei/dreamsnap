# DreamSnap 项目总结

## 📋 项目概述

**DreamSnap** 是一个 AI 驱动的活动摄影 Web 应用，使用 Google Gemini 2.5 Flash Image 将普通照片转换为艺术风格的图片。

**项目地址**: http://localhost:5176  
**技术栈**: React 19 + TypeScript + Vite + Tailwind CSS  
**数据库**: Supabase (PostgreSQL)  
**AI 引擎**: Google Gemini 2.5 Flash Image  

---

## 🎯 核心功能

### 1. **拍照/上传**
- ✅ 实时相机拍摄（5张连拍）
- ✅ 从相册上传照片
- ✅ 支持前后摄像头切换
- ✅ 自适应竖屏/横屏

### 2. **AI 图片生成**
- ✅ 10+ 艺术风格主题（婚礼、复古、童话、动漫等）
- ✅ Google Gemini 2.5 Flash Image 驱动
- ✅ 自动压缩图片（减少上传时间）
- ✅ 300秒超时保护
- ✅ 详细的生成进度显示

### 3. **我的资产**
- ✅ 本地 localStorage 存储生成历史
- ✅ 最多保存 50 条记录
- ✅ 45MB 存储空间
- ✅ 自动压缩图片节省空间
- ✅ 支持下载和删除单条记录
- ✅ 存储统计显示

### 4. **画廊展示**
- ✅ 实时展示所有用户生成的照片
- ✅ 自动滚动播放
- ✅ 新照片弹出提示
- ✅ 每 60 秒随机重排

### 5. **用户信息收集**
- ✅ 姓名、Instagram、手机号
- ✅ 同意书确认
- ✅ 国家代码选择

### 6. **多语言支持**
- ✅ 中文 / 英文切换
- ✅ 自动检测浏览器语言
- ✅ 语言偏好保存

### 7. **管理员功能**
- ✅ Supabase Auth 登录
- ✅ 受保护的路由

---

## 🔧 后台配置

### Supabase 数据库表

#### 1. **leads** 表（用户信息）
```sql
- id: UUID (主键)
- created_at: 时间戳
- full_name: 姓名
- instagram_handle_1: Instagram 账号 1
- instagram_handle_2: Instagram 账号 2
- phone_number: 手机号
- country_code: 国家代码
- consent_given: 同意书
- event_id: 活动 ID
- theme_selected: 选择的主题
```

#### 2. **gallery_photos** 表（生成的照片）
```sql
- id: UUID (主键)
- created_at: 时间戳
- image_url: 照片 URL (Supabase Storage)
- caption: 照片说明
- full_name: 用户姓名
- theme_selected: 使用的主题
- event_id: 活动 ID
```

### 环境变量配置

```env
# Supabase
VITE_SUPABASE_URL=https://piixpofklisorumvrenm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_bakYYZx5RQ8HlTBm3uQhig_V5wJUp0b

# Google Gemini API
VITE_GEMINI_API_KEY=sk-msh4al2ybPkpwa5S42cuFpJiG54CRpTodjBMaaYlB5N72Tc2
VITE_GEMINI_BASE_URL=https://88996.cloud/v1beta

# Telegram (可选)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id

# App
VITE_EVENT_ID=default_event
VITE_WATERMARK_IMAGE_URL=/frames/default-frame.png
```

---

## 📊 我做的所有更新

### 第一阶段：基础设置
1. ✅ 克隆 DreamSnap 项目
2. ✅ 安装依赖 (npm install)
3. ✅ 配置 Supabase 凭证
4. ✅ 创建数据库表 (leads, gallery_photos)

### 第二阶段：API 集成
5. ✅ 修改 Gemini API 调用方式
   - 从官方 SDK 改为 axios 直接调用
   - 支持自定义 API 端点 (https://88996.cloud)
   - 添加详细的调试日志

6. ✅ 增加 API 超时时间
   - 从 120 秒增加到 300 秒（5分钟）
   - 适应复杂图片生成

### 第三阶段：功能增强
7. ✅ 添加相册上传功能
   - 在拍照页面添加"从相册上传"按钮
   - 支持多文件选择
   - 自动转换为 base64

8. ✅ 改进 AI 生成流程
   - 自动压缩图片（1MB 以下）
   - 显示生成进度和计时器
   - 生成失败时显示错误详情
   - 支持重试

9. ✅ 创建本地资产管理系统
   - 新建 `src/lib/assets.ts` - 资产存储工具
   - 新建 `src/pages/AssetsPage.tsx` - 资产页面
   - 支持查看、下载、删除历史记录
   - 显示存储统计（已用/总容量）
   - 自动压缩图片节省空间

10. ✅ 改进图片预览页面
    - 添加"保存到我的资产"按钮
    - 显示保存状态和错误提示
    - 支持异步保存

### 第四阶段：国际化
11. ✅ 实现中英文切换
    - 新建 `src/lib/i18n.ts` - 翻译配置
    - 新建 `src/contexts/LanguageContext.tsx` - 语言上下文
    - 创建 `LanguageSwitcher` 组件
    - 自动检测浏览器语言
    - 保存语言偏好到 localStorage

12. ✅ 翻译所有页面
    - LoginPage - 登录页面
    - PhotoCapture - 拍照页面
    - AssetsPage - 资产页面
    - GalleryPage - 画廊页面
    - 所有按钮、提示、错误信息

### 第五阶段：UI/UX 改进
13. ✅ 改进 Gallery 页面
    - 添加空状态提示（没有照片时）
    - 添加加载状态
    - 添加错误处理
    - 添加返回首页按钮
    - 添加语言切换

14. ✅ 优化导航
    - 在拍照页面添加"我的资产"和"画廊"快捷按钮
    - 添加语言切换按钮
    - 所有页面都支持返回首页

15. ✅ 改进错误处理
    - AI 生成失败时显示具体错误信息
    - 资产保存失败时显示错误提示
    - 添加重试按钮

---

## 📁 项目结构

```
dreamsnap/
├── src/
│   ├── components/
│   │   ├── PhotoCapture.tsx          # 拍照/上传组件
│   │   ├── PhotoSelection.tsx        # 照片选择
│   │   ├── ThemeSelection.tsx        # 主题选择
│   │   ├── AIGeneration.tsx          # AI 生成（改进版）
│   │   ├── ImagePreview.tsx          # 图片预览（新增保存功能）
│   │   ├── LeadCaptureForm.tsx       # 用户信息表单
│   │   ├── ProtectedRoute.tsx        # 受保护路由
│   │   └── LogoutButton.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx           # 认证上下文
│   │   └── LanguageContext.tsx       # 语言上下文（新增）
│   ├── lib/
│   │   ├── gemini.ts                 # Gemini API（改进版）
│   │   ├── supabase.ts               # Supabase 操作
│   │   ├── assets.ts                 # 资产管理（新增）
│   │   ├── i18n.ts                   # 翻译配置（新增）
│   │   ├── imageUtils.ts
│   │   ├── telegram.ts
│   │   └── themes.ts
│   ├── pages/
│   │   ├── LoginPage.tsx             # 登录页面
│   │   ├── GalleryPage.tsx           # 画廊页面（改进版）
│   │   ├── SuccessPage.tsx           # 成功页面
│   │   └── AssetsPage.tsx            # 资产页面（新增）
│   ├── stores/
│   │   └── appStore.ts               # Zustand 状态管理
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx                       # 主应用（改进版）
│   └── main.tsx
├── .env.local                        # 环境变量
├── package.json
└── vite.config.ts
```

---

## 🚀 启动方式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:5176
```

---

## 📊 数据流

```
用户上传/拍照
    ↓
选择主题
    ↓
AI 生成图片 (Gemini API)
    ↓
预览图片
    ↓
保存到我的资产 (localStorage)
    ↓
填写用户信息
    ↓
保存到 Supabase (leads 表)
    ↓
上传到 Supabase Storage
    ↓
保存到 gallery_photos 表
    ↓
显示在画廊
```

---

## 🔐 安全性

- ✅ Supabase Auth 管理员认证
- ✅ Row Level Security (RLS) 配置
- ✅ 匿名用户只能插入数据，不能修改/删除
- ✅ API Key 存储在环境变量

---

## 📈 性能优化

- ✅ 图片自动压缩（1MB 以下）
- ✅ localStorage 存储限制（45MB）
- ✅ 自动删除超过 50 条的旧记录
- ✅ 图片缩略图压缩（0.5 质量）
- ✅ 生成图片压缩（0.7 质量）

---

## 🎨 主题列表

1. Classic Wedding Portrait - 经典婚礼肖像
2. Vintage Romance - 复古浪漫
3. Fairytale Fantasy - 童话幻想
4. Beach Sunset - 海滩日落
5. Garden Party - 花园派对
6. Black & White Elegance - 黑白优雅
7. Watercolor Art - 水彩艺术
8. Cinematic Movie Poster - 电影海报
9. Anime Illustrated - 动漫插画
10. Cultural Traditional - 文化传统

---

## 📝 使用流程

### 用户流程
1. 登录（管理员账号）
2. 拍照或上传照片
3. 选择照片
4. 选择艺术风格
5. 等待 AI 生成（30-120秒）
6. 预览生成的图片
7. 可选：保存到我的资产
8. 填写姓名、Instagram、手机号
9. 提交
10. 照片自动上传到画廊

### 管理员流程
1. 在 Supabase 控制台查看 leads 表（用户信息）
2. 在 Supabase 控制台查看 gallery_photos 表（生成的照片）
3. 在 Supabase Storage 查看上传的图片

---

## 🐛 已知问题 & 解决方案

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 生成超时 | API 响应慢 | 增加超时到 300 秒 |
| 图片太大 | 原始照片分辨率高 | 自动压缩到 1MB |
| 资产保存失败 | localStorage 满 | 自动删除旧记录，显示错误提示 |
| 黑屏 | 没有照片 | 添加空状态提示 |

---

## 💡 未来改进方向

- [ ] 支持更多语言（日语、韩语等）
- [ ] 添加照片编辑功能（裁剪、滤镜）
- [ ] 支持 IndexedDB 扩大存储空间
- [ ] 添加分享到社交媒体功能
- [ ] 支持批量生成
- [ ] 添加照片水印自定义
- [ ] 支持离线模式
- [ ] 添加分析统计

---

## 📞 技术支持

**项目位置**: `C:\Users\Administrator\.qclaw\workspace\dreamsnap`

**运行端口**: 5176 (可能自动递增到 5177, 5178 等)

**主要文件**:
- `.env.local` - 环境变量配置
- `src/App.tsx` - 主应用入口
- `src/lib/gemini.ts` - AI 生成核心
- `src/lib/assets.ts` - 资产管理核心

---

**最后更新**: 2026-03-27 14:20 GMT+8
