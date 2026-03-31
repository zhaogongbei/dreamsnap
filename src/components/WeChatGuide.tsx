import { useEffect, useState } from 'react';

/**
 * 检测是否在微信内置浏览器中打开
 * 如果是，显示引导提示让用户在外部浏览器打开
 */
export const WeChatGuide: React.FC = () => {
  const [isWeChat, setIsWeChat] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isWeChatBrowser = /micromessenger/i.test(ua);
    setIsWeChat(isWeChatBrowser);
  }, []);

  if (!isWeChat || dismissed) return null;

  return (
    <>
      {/* 半透明遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex flex-col items-center justify-start pt-4 px-4">
        {/* 右上角箭头指引 */}
        <div className="self-end mr-2 mb-2 flex flex-col items-center">
          <svg className="w-12 h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <svg className="w-8 h-8 text-white -mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* 提示卡片 */}
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl mt-4">
          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">请在浏览器中打开</h2>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              微信内置浏览器不支持摄像头功能，请点击右上角
              <span className="font-bold text-gray-700"> ··· </span>
              选择
              <span className="font-bold text-primary-600"> 「在浏览器中打开」</span>
              以获得完整体验
            </p>

            {/* 步骤图示 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-sm text-gray-600">点击右上角 <strong>···</strong> 按钮</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-sm text-gray-600">选择 <strong>「在浏览器中打开」</strong></span>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="w-full py-2 text-sm text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              我知道了，继续访问
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
