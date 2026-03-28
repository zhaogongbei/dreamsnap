import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, deleteAsset, clearAssets, AssetRecord, getStorageStats } from '@/lib/assets';
import { useLanguage, LanguageSwitcher } from '@/contexts/LanguageContext';
import { PrintDialog } from '@/components/PrintDialog';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [stats, setStats] = useState(getStorageStats());
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    setAssets(getAssets());
    setStats(getStorageStats());
  };

  const handleDelete = (id: string) => {
    if (confirm(t.delete + '?')) {
      deleteAsset(id);
      loadAssets();
    }
  };

  const handleClearAll = () => {
    if (confirm(t.clearAllConfirm)) {
      clearAssets();
      loadAssets();
      setShowConfirmClear(false);
    }
  };

  const handleDownload = (imageBase64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageBase64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
              {t.myAssetsTitle}
            </h1>
            <p className="text-gray-600 mt-1">{t.viewHistory}</p>
          </div>
          <div className="flex gap-3">
            <LanguageSwitcher />
            {assets.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {t.clearAll}
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              {t.backToHome}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Storage stats */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t.storageUsed}</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.usedMB.toFixed(1)} MB / {stats.maxMB} MB
              </p>
            </div>
            <div className="flex-1 mx-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-pink-500 transition-all"
                  style={{ width: `${stats.percentUsed}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.percentUsed}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{t.records}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.assetCount}</p>
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        {assets.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-20 h-20 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">{t.noHistory}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              {t.createFirstPhoto}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={asset.generatedImage}
                    alt={asset.themeName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-800 truncate">{asset.themeName}</p>
                  <p className="text-xs text-gray-500">{formatDate(asset.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => { setSelectedAsset(null); setShowPrintDialog(false); }}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedAsset.themeName}</h2>
                  <p className="text-gray-500">{formatDate(selectedAsset.createdAt)}</p>
                </div>
                <button
                  onClick={() => { setSelectedAsset(null); setShowPrintDialog(false); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t.originalPhoto}</p>
                  <img src={selectedAsset.originalPhoto} alt="Original" className="w-full rounded-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t.generatedImage}</p>
                  <img src={selectedAsset.finalImage || selectedAsset.generatedImage} alt="Generated" className="w-full rounded-lg" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    handleDownload(
                      selectedAsset.finalImage || selectedAsset.generatedImage,
                      `dreamsnap-${selectedAsset.themeName}-${Date.now()}.jpg`
                    )
                  }
                  className="btn-primary flex-1"
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t.download}
                </button>
                <button
                  onClick={() => setShowPrintDialog(true)}
                  className="flex-1 px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  🖨️ 打印
                </button>
                <button
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && selectedAsset && (
        <PrintDialog
          imageBase64={selectedAsset.finalImage || selectedAsset.generatedImage}
          onClose={() => setShowPrintDialog(false)}
        />
      )}

      {/* Clear All Confirmation */}
      {showConfirmClear && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmClear(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2">{t.clearAllConfirm}</h3>
            <p className="text-gray-600 mb-6">
              {t.clearAllWarning.replace('{count}', String(assets.length))}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                {t.clearAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
