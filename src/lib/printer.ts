// 打印功能模块

export interface PrinterConfig {
  paperSize: 'A4' | 'A5' | '4x6' | '6x8' | 'custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quality: 'draft' | 'normal' | 'high';
  copies: number;
}

const DEFAULT_CONFIG: PrinterConfig = {
  paperSize: '4x6',
  orientation: 'portrait',
  margins: { top: 10, right: 10, bottom: 10, left: 10 },
  quality: 'high',
  copies: 1,
};

/**
 * 打印图片
 */
export async function printImage(
  imageBase64: string,
  config: Partial<PrinterConfig> = {}
): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return new Promise((resolve, reject) => {
    try {
      // 创建隐藏的 iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document');
      }

      // 获取纸张尺寸
      const paperDimensions = getPaperDimensions(finalConfig.paperSize);
      const { width, height } = finalConfig.orientation === 'landscape'
        ? { width: paperDimensions.height, height: paperDimensions.width }
        : paperDimensions;

      // 构建 HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>打印照片</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: ${width}mm ${height}mm;
              margin: ${finalConfig.margins.top}mm ${finalConfig.margins.right}mm ${finalConfig.margins.bottom}mm ${finalConfig.margins.left}mm;
            }
            
            body {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }
            
            .print-container {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${imageBase64}" alt="打印照片">
          </div>
          <script>
            window.onload = function() {
              // 打印多份
              for (let i = 1; i < ${finalConfig.copies}; i++) {
                window.print();
              }
              // 最后一份打印后关闭
              window.print();
              setTimeout(() => {
                window.close();
              }, 100);
            };
          </script>
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // 等待图片加载后打印
      const img = iframeDoc.querySelector('img') as HTMLImageElement;
      if (img) {
        img.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
              resolve();
            }, 500);
          }, 100);
        };
        img.onerror = () => {
          document.body.removeChild(iframe);
          reject(new Error('Failed to load image for printing'));
        };
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 获取纸张尺寸（毫米）
 */
function getPaperDimensions(paperSize: string): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    'A4': { width: 210, height: 297 },
    'A5': { width: 148, height: 210 },
    '4x6': { width: 101.6, height: 152.4 }, // 4x6 英寸
    '6x8': { width: 152.4, height: 203.2 }, // 6x8 英寸
    'custom': { width: 100, height: 150 },
  };
  return sizes[paperSize] || sizes['4x6'];
}

/**
 * 检查打印机可用性
 */
export function isPrintingSupported(): boolean {
  return typeof window !== 'undefined' && !!window.print;
}

/**
 * 获取系统打印机列表（需要浏览器支持）
 */
export async function getPrinters(): Promise<string[]> {
  // 注意：大多数浏览器出于安全原因不允许直接访问打印机列表
  // 这里返回一个模拟的列表，实际使用时需要用户手动选择
  return ['默认打印机', '彩色打印机', '黑白打印机'];
}

/**
 * 打印预览
 */
export function openPrintPreview(imageBase64: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print preview window');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印预览</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          background: #f0f0f0;
          font-family: Arial, sans-serif;
        }
        .preview-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        .controls {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        button {
          padding: 10px 20px;
          font-size: 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .print-btn {
          background: #4CAF50;
          color: white;
        }
        .print-btn:hover {
          background: #45a049;
        }
        .close-btn {
          background: #f44336;
          color: white;
        }
        .close-btn:hover {
          background: #da190b;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <img src="${imageBase64}" alt="打印预览">
        <div class="controls">
          <button class="print-btn" onclick="window.print()">打印</button>
          <button class="close-btn" onclick="window.close()">关闭</button>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}
