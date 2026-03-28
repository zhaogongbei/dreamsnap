-- 修复 RLS 策略问题
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 删除旧策略
DROP POLICY IF EXISTS "Allow anonymous insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous insert on gallery_photos" ON public.gallery_photos;

-- 2. 创建新策略 - 允许所有用户（包括匿名）插入
CREATE POLICY "Allow all insert on leads" ON public.leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all insert on gallery_photos" ON public.gallery_photos
  FOR INSERT
  WITH CHECK (true);

-- 3. 允许所有用户读取 gallery_photos（用于画廊展示）
DROP POLICY IF EXISTS "Allow authenticated read on gallery_photos" ON public.gallery_photos;
CREATE POLICY "Allow all read on gallery_photos" ON public.gallery_photos
  FOR SELECT
  USING (true);

-- 4. 如果上面的策略还不行，可以临时禁用 RLS（不推荐用于生产环境）
-- 取消下面的注释来禁用 RLS
-- ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.gallery_photos DISABLE ROW LEVEL SECURITY;

-- 完成！
