import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

export default function ReceiptUpload({ onUpload, onDone, onManual, hasBill, needsReplaceConfirm, onContinue }) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) await requestUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) await requestUpload(e.dataTransfer.files[0]);
  };

  // Replacing a receipt only asks first when there is something to lose.
  const requestUpload = async (file) => {
    if (hasBill && needsReplaceConfirm) setPendingFile(file);
    else await uploadFile(file);
  };

  const handleManual = async () => {
    setUploading(true);
    setFailed(false);
    try {
      await onManual();
      onDone();
    } catch (error) {
      console.error('Could not start a manual bill:', error);
      setFailed(true);
      setUploading(false);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setFailed(false);
    try {
      const data = await onUpload(file);
      setUploading(false);
      setItemCount(data?.items?.length ?? 0);
      setDone(true);
      setTimeout(() => onDone(), 700);
    } catch (error) {
      console.error('Upload failed:', error);
      setFailed(true);
      setUploading(false);
    }
  };

  const isActive = dragActive || done;
  const dropzoneStyle = {
    border: `2px dashed ${isActive || uploading ? '#00FDDC' : '#2E5674'}`,
    background: dragActive ? '#00FDDC26' : '#1C3A54',
    borderRadius: 24,
    padding: '72px 40px',
    textAlign: 'center',
    cursor: uploading || done ? 'default' : 'pointer',
    transition: '0.2s',
  };

  return (
    <div className="fade-up mx-auto" style={{ maxWidth: 540, paddingTop: 16 }}>
      <h1 className="font-extrabold" style={{ fontSize: 34, letterSpacing: '-0.5px', marginBottom: 8 }}>
        Split the bill.
      </h1>
      <p className="text-gray-400" style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 40 }}>
        Upload a receipt and AI extracts every item automatically.
      </p>

      <div
        style={dropzoneStyle}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="receipt-upload"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={uploading || done}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center" style={{ gap: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '3px solid #2E5674', borderTopColor: '#00FDDC',
              animation: 'spin .7s linear infinite',
            }} />
            <p className="font-semibold text-gray-400">Scanning with AI…</p>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            <div
              className="scale-in flex items-center justify-center font-extrabold"
              style={{ width: 52, height: 52, borderRadius: '50%', background: '#00FDDC', color: '#111', fontSize: 22 }}
            >
              ✓
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#00FDDC' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} found!
            </p>
          </div>
        ) : failed ? (
          <div role="alert" className="flex flex-col items-center" style={{ gap: 12 }}>
            <p className="font-bold" style={{ fontSize: 16, color: '#ff6b5e' }}>Couldn't read that receipt.</p>
            <p className="text-gray-400" style={{ fontSize: 13 }}>Check the photo and try again, or enter the items yourself.</p>
            <label
              htmlFor="receipt-upload"
              className="cursor-pointer font-bold"
              style={{ marginTop: 4, padding: '10px 22px', borderRadius: 12, fontSize: 14, background: '#254862', color: '#A0C4DC' }}
            >
              Try again
            </label>
          </div>
        ) : (
          <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
            <svg
              width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="#A0C4DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginBottom: 20 }}
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="font-bold" style={{ fontSize: 18, marginBottom: 8 }}>
              Drop your receipt here
            </p>
            <p className="text-gray-400" style={{ fontSize: 13 }}>
              or click to browse · PNG, JPG, HEIC up to 10MB
            </p>
          </label>
        )}
      </div>

      {!uploading && !done && (
        <div className="flex flex-col items-center" style={{ gap: 14, marginTop: 20 }}>
          <button
            onClick={handleManual}
            className="font-semibold"
            style={{ fontSize: 14, color: '#00FDDC', background: 'none', textDecoration: 'underline' }}
          >
            Enter items manually
          </button>
          {hasBill && (
            <button
              onClick={onContinue}
              className="accent-hover font-bold"
              style={{ padding: '14px 32px', borderRadius: 14, fontSize: 15, background: '#00FDDC', color: '#111' }}
            >
              Continue with current bill →
            </button>
          )}
        </div>
      )}

      {pendingFile && (
        <ConfirmDialog
          title="Replace receipt?"
          confirmLabel="Replace"
          onCancel={() => setPendingFile(null)}
          onConfirm={async () => {
            const file = pendingFile;
            setPendingFile(null);
            await uploadFile(file);
          }}
        >
          Items and assignments will be cleared. People are kept.
        </ConfirmDialog>
      )}

      <p className="text-center text-gray-500" style={{ fontSize: 12, marginTop: 16 }}>
        Powered by Claude AI
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
