import { useState } from 'react';

export default function ReceiptUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pt-8">
      <h1 className="text-4xl font-bold text-gray-100 mb-3">Split the bill.</h1>
      <p className="text-gray-400 mb-8">
        Upload a receipt and AI extracts every item automatically.
      </p>

      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragActive
            ? 'border-accent bg-accent-dim'
            : 'border-border hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="receipt-upload"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />

        <label
          htmlFor="receipt-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p className="text-lg font-semibold text-gray-100 mb-1">
            {uploading ? 'Uploading...' : 'Drop your receipt here'}
          </p>
          <p className="text-sm text-gray-400">
            or click to browse · PNG, JPG, HEIC up to 10MB
          </p>
        </label>

        {uploading && (
          <div className="absolute inset-0 bg-surface bg-opacity-90 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              <p className="mt-4 text-sm text-gray-400">Processing receipt...</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">Powered by Claude AI</p>
    </div>
  );
}
