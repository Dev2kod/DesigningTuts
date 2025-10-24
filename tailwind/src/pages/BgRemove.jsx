import { useState, useRef } from 'react';
import { Upload, Download, X, ImageIcon, RefreshCw, Info, PaintBucket } from 'lucide-react';

export default function BgRemoverApp() {
  const [apiKey, setApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showColorReplace, setShowColorReplace] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  const removeBg = async () => {
    if (!selectedFile || !apiKey) {
      setError('Please provide both an API key and an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', selectedFile);

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setProcessedImage(url);
      } else {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `${selectedFile.name.split('.')[0]}-no-bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedImage(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 p-6 font-inter">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-fadeIn">✨ Background Remover Pro</h1>
          <p className="text-gray-600 text-sm">Remove or replace image backgrounds instantly with AI magic</p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* API Key Input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Remove.bg API Key</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Info className="w-5 h-5 text-gray-400 hover:text-indigo-500 cursor-pointer" title="Get a free key at remove.bg/api" />
            </div>
          </div>

          {/* Upload or Preview */}
          {!selectedFile ? (
            <label
              onClick={() => fileInputRef.current.click()}
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Original Image */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Original
                  </h3>
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-64 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className={`object-contain w-full h-full ${loading ? 'animate-pulse opacity-70' : ''}`}
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Processed Image */}
                {processedImage && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Result
                    </h3>
                    <div
                      className="relative rounded-lg overflow-hidden border border-gray-200"
                      style={{
                        backgroundColor: showColorReplace ? bgColor : 'transparent',
                        backgroundImage: showColorReplace
                          ? 'none'
                          : 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px',
                      }}
                    >
                      <img src={processedImage} alt="Processed" className="w-full h-64 object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={removeBg}
                  disabled={loading || !apiKey}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Processing...' : 'Remove Background'}
                </button>

                {processedImage && (
                  <>
                    <button
                      onClick={downloadImage}
                      className="flex items-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>

                    <button
                      onClick={() => setShowColorReplace(!showColorReplace)}
                      className="flex items-center gap-2 bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-all"
                    >
                      <PaintBucket className="w-5 h-5" />
                      {showColorReplace ? 'Hide BG Color' : 'Add BG Color'}
                    </button>

                    {showColorReplace && (
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="rounded-md border border-gray-300 w-10 h-10 cursor-pointer"
                      />
                    )}
                  </>
                )}

                <button
                  onClick={reset}
                  className="flex items-center gap-2 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>💡 Tip:</strong> Get your free Remove.bg API key from{' '}
          <a href="https://remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
            remove.bg/api
          </a>{' '}
          — 50 free credits every month!
        </div>
      </div>
    </div>
  );
}
