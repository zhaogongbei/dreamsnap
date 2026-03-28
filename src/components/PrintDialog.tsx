import { useState } from 'react';
import { printImage, openPrintPreview, PrinterConfig } from '@/lib/printer';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrintDialogProps {
  imageBase64: string;
  onClose: () => void;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

export const PrintDialog: React.FC<PrintDialogProps> = ({
  imageBase64,
  onClose,
  onPrintStart,
  onPrintComplete,
}) => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<PrinterConfig>({
    paperSize: '4x6',
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    quality: 'high',
    copies: 1,
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    try {
      setError(null);
      setIsPrinting(true);
      onPrintStart?.();

      await printImage(imageBase64, config);

      onPrintComplete?.();
      setIsPrinting(false);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Print failed';
      setError(message);
      setIsPrinting(false);
    }
  };

  const handlePreview = () => {
    try {
      openPrintPreview(imageBase64);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Preview failed';
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🖨️ 打印设置</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4 mb-6">
            {/* Paper Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                纸张尺寸
              </label>
              <select
                value={config.paperSize}
                onChange={(e) =>
                  setConfig({ ...config, paperSize: e.target.value as any })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="4x6">4x6 英寸（标准）</option>
                <option value="6x8">6x8 英寸</option>
                <option value="A4">A4</option>
                <option value="A5">A5</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                方向
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orientation"
                    value="portrait"
                    checked={config.orientation === 'portrait'}
                    onChange={(e) =>
                      setConfig({ ...config, orientation: e.target.value as any })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700">竖向</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orientation"
                    value="landscape"
                    checked={config.orientation === 'landscape'}
                    onChange={(e) =>
                      setConfig({ ...config, orientation: e.target.value as any })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700">横向</span>
                </label>
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                打印质量
              </label>
              <select
                value={config.quality}
                onChange={(e) =>
                  setConfig({ ...config, quality: e.target.value as any })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="draft">草稿（快速）</option>
                <option value="normal">普通</option>
                <option value="high">高质量</option>
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                打印份数
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.copies}
                onChange={(e) =>
                  setConfig({ ...config, copies: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Margins */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                边距（毫米）
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="上"
                  value={config.margins.top}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      margins: { ...config.margins, top: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="右"
                  value={config.margins.right}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      margins: { ...config.margins, right: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="下"
                  value={config.margins.bottom}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      margins: { ...config.margins, bottom: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="左"
                  value={config.margins.left}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      margins: { ...config.margins, left: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={isPrinting}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              👁️ 预览
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPrinting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  打印中...
                </>
              ) : (
                <>
                  🖨️ 打印
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            💡 点击"预览"查看打印效果，然后在打印对话框中选择打印机
          </p>
        </div>
      </div>
    </div>
  );
};
