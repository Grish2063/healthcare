import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Config ── //
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ACCEPTED_EXT = '.pdf,.jpg,.jpeg,.png';

const RECORD_TYPES = ['Lab result', 'Scan / imaging', 'Prescription', 'Referral letter', 'Other'];

const PATIENTS = [
  'John Doe',
  'Jane Smith',
  'Bob Johnson',
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconType(file) {
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return 'image';
  return 'file';
}

function validate(formData, files) {
  const errors = {};
  if (!formData.patient) {
    errors.patient = 'Please select a patient';
  }
  if (files.length === 0) {
    errors.files = 'Add at least one file to upload';
  }
  return errors;
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = {
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    color: '#64748b',
  },
};

const modalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  .urm-overlay {
    font-family: 'DM Sans', sans-serif;
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(8, 15, 30, 0.55);
    backdrop-filter: blur(6px);
    transition: opacity 0.2s ease;
    opacity: 0;
  }
  .urm-overlay.urm-visible { opacity: 1; }

  .urm-card {
    background: #ffffff;
    border-radius: 20px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(10, 25, 60, 0.18), 0 0 0 1px rgba(180,200,240,0.2);
    transform: translateY(18px) scale(0.98);
    transition: transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease;
    opacity: 0;
    position: relative;
  }
  .urm-card.urm-visible {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .urm-header {
    background: linear-gradient(135deg, #7c2d12 0%, #16213e 100%);
    padding: 28px 32px 24px;
    position: relative;
    overflow: hidden;
    border-radius: 20px 20px 0 0;
  }
  .urm-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .urm-eyebrow {
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(253,186,116,0.85);
    font-weight: 500;
    margin-bottom: 6px;
  }
  .urm-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #ffffff;
    line-height: 1.2;
    margin: 0;
  }
  .urm-sub {
    font-size: 13px;
    color: rgba(254,215,170,0.75);
    margin: 4px 0 0;
  }
  .urm-close-btn {
    position: absolute;
    top: 20px; right: 20px;
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.7);
    transition: all 0.15s ease;
  }
  .urm-close-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
  .urm-close-btn:focus-visible { outline: 2px solid #fb923c; outline-offset: 2px; }

  .urm-body { padding: 28px 32px 8px; }

  .urm-section-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 14px;
  }
  .urm-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 22px 0;
  }
  .urm-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .urm-input {
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1e293b;
    background: #f8fafc;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  .urm-input:focus {
    border-color: #f97316;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }
  .urm-input-error {
    border-color: #f43f5e !important;
    background: #fff5f7 !important;
  }

  .urm-dropzone {
    border: 1.5px dashed #cbd5e1;
    border-radius: 12px;
    padding: 36px 20px;
    text-align: center;
    background: #f8fafc;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .urm-dropzone:hover,
  .urm-dropzone:focus-visible {
    border-color: #fb923c;
    background: #fff7ed;
    outline: none;
  }
  .urm-dropzone.urm-dragover {
    border-color: #f97316;
    background: #fff7ed;
  }
  .urm-dropzone.urm-input-error {
    border-color: #f43f5e;
    background: #fff5f7;
  }
  .urm-dropzone-icon {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: #ffedd5;
    color: #ea580c;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }
  .urm-dropzone-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px;
  }
  .urm-dropzone-hint {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
  }

  .urm-file-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 12px;
  }
  .urm-file-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .urm-file-icon-pdf { background: #fee2e2; color: #dc2626; }
  .urm-file-icon-image { background: #dbeafe; color: #2563eb; }
  .urm-file-icon-file { background: #f1f5f9; color: #64748b; }
  .urm-file-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    word-break: break-all;
  }
  .urm-file-meta {
    font-size: 11px;
    color: #94a3b8;
    margin: 2px 0 0;
  }
  .urm-file-remove {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #64748b;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .urm-file-remove:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  .urm-file-remove:focus-visible { outline: 2px solid #f97316; outline-offset: 2px; }

  .urm-file-size-error {
    font-size: 11px;
    color: #f43f5e;
    font-weight: 500;
    margin: 2px 0 0;
  }

  .urm-error {
    font-size: 11.5px;
    color: #f43f5e;
    font-weight: 500;
    margin: 0;
  }

  .urm-api-error {
    margin: 0 32px 8px;
    padding: 10px 14px;
    background: #fff5f7;
    border: 1.5px solid #f43f5e;
    border-radius: 10px;
    font-size: 13px;
    color: #f43f5e;
    font-weight: 500;
  }
  .urm-dirty-warn {
    margin: 0 32px 8px;
    padding: 10px 14px;
    background: #fffbeb;
    border: 1.5px solid #f59e0b;
    border-radius: 10px;
    font-size: 13px;
    color: #b45309;
    font-weight: 500;
  }

  .urm-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 32px 28px;
  }
  .urm-btn {
    padding: 11px 24px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    display: flex; align-items: center; gap: 8px;
  }
  .urm-btn:focus-visible { outline: 2px solid #f97316; outline-offset: 2px; }
  .urm-btn-ghost { background: #f1f5f9; color: #64748b; }
  .urm-btn-ghost:hover:not(:disabled) { background: #e2e8f0; color: #475569; }
  .urm-btn-primary {
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    min-width: 152px;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(249,115,22,0.35);
  }
  .urm-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #ea580c, #c2410c);
    box-shadow: 0 6px 18px rgba(249,115,22,0.4);
    transform: translateY(-1px);
  }
  .urm-btn-primary:disabled, .urm-btn-ghost:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
  .urm-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: urm-spin 0.6s linear infinite;
    flex-shrink: 0;
  }
  @keyframes urm-spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .urm-grid2 { grid-template-columns: 1fr; }
    .urm-body { padding: 20px 20px 8px; }
    .urm-header { padding: 22px 20px 18px; }
    .urm-footer { padding: 12px 20px 20px; }
    .urm-api-error, .urm-dirty-warn { margin: 0 20px 8px; }
  }
`;

const EMPTY_FORM = { patient: '', recordType: 'Lab result' };


function UploadRecord({ onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const isDirty = useRef(false);
  const firstFieldRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleAttemptClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    isDirty.current = true;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const addFiles = useCallback((incoming) => {
    const list = Array.from(incoming);
    if (list.length === 0) return;

    isDirty.current = true;
    setFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const additions = list
        .filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
        .map((f) => ({
          file: f,
          id: `${f.name}-${f.size}-${f.lastModified}`,
          name: f.name,
          size: f.size,
          type: f.type,
          tooLarge: f.size > MAX_FILE_SIZE_MB * 1024 * 1024,
          unsupported: ACCEPTED_TYPES.length > 0 && f.type && !ACCEPTED_TYPES.includes(f.type),
        }));
      return [...prev, ...additions];
    });
    setErrors((prev) => ({ ...prev, files: '' }));
    if (apiError) setApiError('');
  }, [apiError]);

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (id) => {
    isDirty.current = true;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAttemptClose = useCallback(() => {
    if (isDirty.current) {
      setShowDirtyWarning(true);
      setTimeout(() => setShowDirtyWarning(false), 3500);
      return;
    }
    triggerClose();
  }, []);

  const triggerClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const hasBlockingFileErrors = files.some((f) => f.tooLarge || f.unsupported);

  const handleSubmit = async () => {
    const validationErrors = validate(formData, files);
    if (Object.keys(validationErrors).length > 0 || hasBlockingFileErrors) {
      setErrors(validationErrors);
      if (validationErrors.patient) {
        document.getElementById('patient')?.focus();
      }
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      await onSave({
        patient: formData.patient,
        recordType: formData.recordType,
        files: files.map((f) => f.file),
      });
      isDirty.current = false;
      triggerClose();
    } catch (err) {
      setApiError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{modalStyles}</style>

      <div
        className={`urm-overlay${visible ? ' urm-visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="urm-title"
        aria-describedby="urm-desc"
        onClick={(e) => e.target === e.currentTarget && handleAttemptClose()}
      >
        <div className={`urm-card${visible ? ' urm-visible' : ''}`}>

          {/* Header */}
          <div className="urm-header">
            <button
              className="urm-close-btn"
              onClick={handleAttemptClose}
              aria-label="Close modal"
              disabled={saving}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="urm-eyebrow">Medical Records</div>
            <h2 id="urm-title" className="urm-title">Upload Records</h2>
            <p id="urm-desc" className="urm-sub">Attach lab results, scans, or documents to a patient file</p>
          </div>

          {/* Body */}
          <div className="urm-body">

            <p className="urm-section-label">Patient &amp; record type</p>
            <div className="urm-grid2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="patient" style={styles.label}>
                  Patient <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <select
                  ref={firstFieldRef}
                  id="patient"
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.patient}
                  aria-describedby={errors.patient ? 'patient-err' : undefined}
                  className={`urm-input${errors.patient ? ' urm-input-error' : ''}`}
                >
                  <option value="">Select patient…</option>
                  {PATIENTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.patient && (
                  <p id="patient-err" role="alert" aria-live="polite" className="urm-error">⚠ {errors.patient}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="recordType" style={styles.label}>Record type</label>
                <select
                  id="recordType"
                  name="recordType"
                  value={formData.recordType}
                  onChange={handleChange}
                  className="urm-input"
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropzone */}
            <div
              className={`urm-dropzone${dragOver ? ' urm-dragover' : ''}${errors.files ? ' urm-input-error' : ''}`}
              role="button"
              tabIndex={0}
              aria-describedby={errors.files ? 'files-err' : 'files-hint'}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="urm-dropzone-icon" aria-hidden="true">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
                </svg>
              </div>
              <p className="urm-dropzone-title">Drag files here or click to browse</p>
              <p id="files-hint" className="urm-dropzone-hint">PDF, JPG, PNG up to {MAX_FILE_SIZE_MB}MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXT}
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>
            {errors.files && (
              <p id="files-err" role="alert" aria-live="polite" className="urm-error" style={{ marginTop: 6 }}>⚠ {errors.files}</p>
            )}

            {/* Selected files */}
            {files.length > 0 && (
              <>
                <div className="urm-divider" />
                <p className="urm-section-label">Selected files ({files.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                  {files.map((f) => {
                    const kind = fileIconType(f);
                    return (
                      <div key={f.id} className="urm-file-row">
                        <div className={`urm-file-icon urm-file-icon-${kind}`} aria-hidden="true">
                          {kind === 'pdf' && (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
                            </svg>
                          )}
                          {kind === 'image' && (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                            </svg>
                          )}
                          {kind === 'file' && (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="urm-file-name">{f.name}</p>
                          <p className="urm-file-meta">{formatSize(f.size)}</p>
                          {f.tooLarge && <p className="urm-file-size-error">⚠ Exceeds {MAX_FILE_SIZE_MB}MB limit</p>}
                          {f.unsupported && <p className="urm-file-size-error">⚠ Unsupported file type</p>}
                        </div>
                        <button
                          type="button"
                          className="urm-file-remove"
                          onClick={() => handleRemoveFile(f.id)}
                          aria-label={`Remove ${f.name}`}
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>

          {/* API Error */}
          {apiError && (
            <div role="alert" aria-live="assertive" className="urm-api-error">
              ⚠ {apiError}
            </div>
          )}

          {/* Dirty state warning */}
          {showDirtyWarning && (
            <div role="status" aria-live="polite" className="urm-dirty-warn">
              ⚠ You have unsaved changes — are you sure you want to close?
            </div>
          )}

          {/* Footer */}
          <div className="urm-footer">
            <button
              className="urm-btn urm-btn-ghost"
              onClick={handleAttemptClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="urm-btn urm-btn-primary"
              onClick={handleSubmit}
              disabled={saving || hasBlockingFileErrors}
              type="button"
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <span className="urm-spinner" aria-hidden="true" />
                  Uploading…
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
                  </svg>
                  Upload {files.length > 0 ? `(${files.length})` : ''}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default UploadRecord;
