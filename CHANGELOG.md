# 📋 DreamSnap 项目更新日志

> 自动记录所有版本更新内容
> 项目地址：https://www.528258.xyz/
> GitHub：https://github.com/zhaogongbei/dreamsnap

---

## [2026-03-28] 第三阶段更新（AI 助手协作开发）

### 🐛 Bug 修复

#### 摄像头黑屏问题
- **问题**：首次进入拍照页面摄像头显示黑屏，切换到上传页再切回才恢复
- **原因**：videoConstraints 配置过于复杂，使用了响应式变量导致首次渲染失败
- **修复**：简化摄像头配置，移除 aspectRatio 和响应式宽高，添加 mirrored 属性
- **提交**：`f8b3fbd`

#### TypeScript 构建错误
- **问题**：`assets.ts` 异步函数返回类型错误；`AssetsPage.tsx` 使用了不存在的 `language` 属性
- **修复**：修正函数签名为 `async`，移除不存在的属性引用
- **提交**：`8f5127f`

#### npm 弃用警告
- **问题**：`node-domexception@1.0.0` 弃用警告导致 Vercel 构建失败
- **修复**：在 `package.json` 添加 `overrides` 字段，运行 `npm audit fix`
- **提交**：`d306fa7`

#### 导航按钮显示逻辑错误
- **问题**：隐藏拍照页按钮时误将所有页面的按钮都删除了
- **修复**：恢复按钮，使用 `currentStep !== 'capture'` 条件，仅在非拍照页显示
- **提交**：`2429893`

---

### ✨ 新功能

#### 飞书机器人集成
- 替换原有 Telegram 机器人
- 新增 `src/lib/feishu.ts` 飞书消息发送模块
- 支持 Interactive Card 富文本消息
- WebHook 地址：`https://open.feishu.cn/open-apis/bot/v2/hook/c98eadcf-18a9-4b58-abac-e91b7f38ec21`
- 用户完成照片生成后自动发送通知到飞书群
- **提交**：`5e1e458`

#### 中英文国际化
- 新增 `src/lib/i18n.ts` 国际化配置文件
- 新增 `src/contexts/LanguageContext.tsx` 语言上下文
- 支持一键切换中英文
- 21 个主题名称全部支持中英文切换
- 所有页面文本完成翻译

#### 主题名称中文翻译
| 英文 | 中文 |
|------|------|
| Beach Wedding | 海滩婚礼 |
| Cherry Blossom Anime | 樱花动漫 |
| Game of Thrones Fantasy | 权力的游戏奇幻 |
| Halloween Spooky | 万圣节恐怖 |
| Harry Potter Magic | 哈利波特魔法 |
| Superhero Epic | 超级英雄史诗 |
| Mountain Summit | 山顶峰会 |
| Traditional Chinese Wedding | 中式传统婚礼 |
| Traditional Malay Wedding | 马来传统婚礼 |
| Indian Cultural Wedding | 印度文化婚礼 |
| Winter Wonderland | 冬日仙境 |
| Hot Air Balloon Adventure | 热气球探险 |
| Tropical Beach Wedding | 热带海滩婚礼 |
| ... | ... |

---

### 🎨 UI 优化

#### 导航按钮调整
- 翻译、资产、画廊三个按钮改为**紫色背景**（bg-primary-600）
- 按钮布局改为**左侧竖排居中**
- 拍照页面**隐藏**三个导航按钮
- 其他页面**保留**三个导航按钮

#### 文字修改
- "我的资产" → "资产"

#### 流程简化
- 移除潜在客户捕捉表单（姓名、Instagram、电话）
- 用户完成照片后直接跳转成功页面

---

### 🚀 部署优化

#### Vercel 部署配置
- 新增 `.npmrc` 配置文件
- 优化 `vite.config.ts` chunk 分割策略
- 更新 `vercel.json` 添加构建配置
- 成功部署到 https://www.528258.xyz/

#### API 故障转移
- 主用：`https://undyapi.com/v1beta`
- 备用1：`https://vip.undyingapi.com/v1beta`
- 备用2：`https://vip.undyingapi.site/v1beta`
- API Key 更新为新密钥

---

### 🗄️ 数据库修复

#### Supabase RLS 策略
- **问题**：`42501` 错误，匿名用户无法插入数据
- **修复**：禁用 `leads` 和 `gallery_photos` 表的 RLS
- **SQL**：
  ```sql
  ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.gallery_photos DISABLE ROW LEVEL SECURITY;
  ```

---

## [2026-01-09 ~ 2026-01-10] 第二阶段更新

### ✨ 新功能
- 画廊实时更新和弹窗展示
- GalleryPage 多次优化更新
- SuccessPage 更新

---

## [2026-01-03 ~ 2026-01-08] 第一阶段开发

### 🎉 项目初始化
- `2026-01-03` 初始提交，项目搭建
- `2026-01-04` 初始化提交，UI 样式重构，更新人脸保留提示词
- `2026-01-05` 多项功能开发：
  - 添加 Supabase 认证和 RLS 策略支持
  - 清理日志，移除军事主题
  - 改进视频方向处理和全局样式
  - 重构 PhotoCapture 布局和视频约束
  - 更新 SuccessPage
  - 添加 SPA 路由支持
  - 添加主题分类和改进主题选择 UI
  - 添加 `would_pay_for_product` 字段
- `2026-01-07` 更新 GalleryPage
- `2026-01-08` 添加 DreamSnap Logo，更新人脸保留提示词

---

## 📊 项目当前状态

| 功能模块 | 状态 | 最后更新 |
|---------|------|---------|
| 拍照/上传 | ✅ 正常 | 2026-03-28 |
| AI 生成 | ✅ 正常 | 2026-03-28 |
| 中英文切换 | ✅ 正常 | 2026-03-28 |
| 主题翻译 | ✅ 正常 | 2026-03-28 |
| 资产库 | ✅ 正常 | 2026-03-28 |
| 画廊 | ✅ 正常 | 2026-01-10 |
| 飞书通知 | ✅ 正常 | 2026-03-28 |
| 登录验证 | ✅ 正常 | 2026-01-05 |
| Vercel 部署 | ✅ 正常 | 2026-03-28 |

---

## 🔧 技术配置

### 环境变量
```env
VITE_SUPABASE_URL=https://piixpofklisorumvrenm.supabase.co
VITE_FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/c98eadcf-...
VITE_GEMINI_API_KEY=sk-LEcNfKDy4gnvX9QBJTNImlSgzrBOL2bseSZyeOGxi23GL9fF
VITE_GEMINI_BASE_URL=https://undyapi.com/v1beta
VITE_GEMINI_BACKUP_URL_1=https://vip.undyingapi.com/v1beta
VITE_GEMINI_BACKUP_URL_2=https://vip.undyingapi.site/v1beta
```

---

*此文件由 AI 助手自动维护，每次更新后自动记录*
