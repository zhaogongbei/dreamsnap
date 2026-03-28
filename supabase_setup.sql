-- DreamSnap 数据库表创建脚本
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 leads 表（用户信息）
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  full_name TEXT NOT NULL,
  instagram_handle_1 TEXT,
  instagram_handle_2 TEXT,
  phone_number TEXT NOT NULL,
  country_code TEXT DEFAULT '+65',
  consent_given BOOLEAN DEFAULT false NOT NULL,
  would_pay_for_product BOOLEAN DEFAULT false,
  theme_selected TEXT,
  event_id TEXT DEFAULT 'default_event'
);

-- 2. 创建 gallery_photos 表（生成的照片）
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  full_name TEXT,
  theme_selected TEXT,
  event_id TEXT DEFAULT 'default_event'
);

-- 3. 启用 RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略（允许匿名用户插入数据）
CREATE POLICY "Allow anonymous insert on leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on gallery_photos" ON public.gallery_photos
  FOR INSERT TO anon
  WITH CHECK (true);

-- 5. 允许认证用户读取数据
CREATE POLICY "Allow authenticated read on leads" ON public.leads
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on gallery_photos" ON public.gallery_photos
  FOR SELECT TO authenticated
  USING (true);

-- 6. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_created_at ON public.gallery_photos(created_at DESC);

-- 完成！
-- 执行此脚本后，DreamSnap 应该可以正常保存用户数据了
