import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Field config ──── //
const REQUIRED_FIELDS = ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone'];

function validate(formData) {
  const errors = {};

  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!formData.dob) {
    errors.dob = 'Date of birth is required';
  } else {
    const dob = new Date(formData.dob);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 130);
    if (dob > today) {
      errors.dob = 'Date of birth cannot be in the future';
    } else if (dob < minDate) {
      errors.dob = 'Enter a valid date of birth';
    }
  }

  if (!formData.gender) {
    errors.gender = 'Please select a gender';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[+\d\s\-().]{7,20}$/.test(formData.phone)) {
    errors.phone = 'Enter a valid phone number (7–20 digits)';
  }

  return errors;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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

  .apm-overlay {
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
  .apm-overlay.apm-visible { opacity: 1; }

  .apm-card {
    background: #ffffff;
    border-radius: 20px;
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(10, 25, 60, 0.18), 0 0 0 1px rgba(180,200,240,0.2);
    transform: translateY(18px) scale(0.98);
    transition: transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease;
    opacity: 0;
    position: relative;
  }
  .apm-card.apm-visible {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .apm-header {
    background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
    padding: 28px 32px 24px;
    position: relative;
    overflow: hidden;
    border-radius: 20px 20px 0 0;
  }
  .apm-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .apm-eyebrow {
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(147,197,253,0.8);
    font-weight: 500;
    margin-bottom: 6px;
  }
  .apm-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #ffffff;
    line-height: 1.2;
    margin: 0;
  }
  .apm-sub {
    font-size: 13px;
    color: rgba(191,219,254,0.7);
    margin: 4px 0 0;
  }
  .apm-close-btn {
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
  .apm-close-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
  .apm-close-btn:focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; }

  .apm-body { padding: 28px 32px 8px; }

  .apm-section-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 14px;
  }
  .apm-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 22px 0;
  }
  .apm-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .apm-grid1 { display: grid; grid-template-columns: 1fr; margin-bottom: 16px; }

  .apm-input {
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
  }
  .apm-input:focus {
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .apm-input:focus-visible { outline: none; }
  .apm-input-error {
    border-color: #f43f5e !important;
    background: #fff5f7 !important;
  }
  .apm-input-error:focus {
    box-shadow: 0 0 0 3px rgba(244,63,94,0.1) !important;
  }
  .apm-select { cursor: pointer; }

  .apm-textarea {
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1e293b;
    background: #f8fafc;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    min-height: 80px;
  }
  .apm-textarea:focus {
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .apm-error {
    font-size: 11.5px;
    color: #f43f5e;
    font-weight: 500;
    margin: 0;
  }
  .apm-hint {
    font-size: 11px;
    color: #94a3b8;
    margin: 0;
  }

  .apm-api-error {
    margin: 0 32px 8px;
    padding: 10px 14px;
    background: #fff5f7;
    border: 1.5px solid #f43f5e;
    border-radius: 10px;
    font-size: 13px;
    color: #f43f5e;
    font-weight: 500;
  }
  .apm-dirty-warn {
    margin: 0 32px 8px;
    padding: 10px 14px;
    background: #fffbeb;
    border: 1.5px solid #f59e0b;
    border-radius: 10px;
    font-size: 13px;
    color: #b45309;
    font-weight: 500;
  }

  .apm-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 32px 28px;
  }
  .apm-btn {
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
  .apm-btn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
  .apm-btn-ghost {
    background: #f1f5f9;
    color: #64748b;
  }
  .apm-btn-ghost:hover:not(:disabled) { background: #e2e8f0; color: #475569; }
  .apm-btn-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    min-width: 152px;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  .apm-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    box-shadow: 0 6px 18px rgba(37,99,235,0.4);
    transform: translateY(-1px);
  }
  .apm-btn-primary:disabled, .apm-btn-ghost:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
  .apm-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: apm-spin 0.6s linear infinite;
    flex-shrink: 0;
  }
  @keyframes apm-spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .apm-grid2 { grid-template-columns: 1fr; }
    .apm-body { padding: 20px 20px 8px; }
    .apm-header { padding: 22px 20px 18px; }
    .apm-footer { padding: 12px 20px 20px; }
    .apm-api-error, .apm-dirty-warn { margin: 0 20px 8px; }
  }
`;

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  condition: '',
};

// ─── AddPatientModal ──────────────────────────────────────────────────────────
/**
 * Props:
 *  - onClose: () => void        — called when the modal should unmount
 *  - onSave:  (data) => Promise — receives form data; throw to show an API error
 */
function AddPatientModal({ onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);
  const isDirty = useRef(false);
  const firstFieldRef = useRef(null);

  // Date constraints
  const today = new Date().toISOString().split('T')[0];
  const minDob = new Date();
  minDob.setFullYear(minDob.getFullYear() - 130);
  const minDobStr = minDob.toISOString().split('T')[0];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    firstFieldRef.current?.focus();
  }, []);

  // Escape key handler
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

  const handleSubmit = async () => {
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrField = REQUIRED_FIELDS.find((f) => validationErrors[f]);
      if (firstErrField) {
        const el = document.getElementById(firstErrField);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      await onSave(formData);
      isDirty.current = false;
      triggerClose();
    } catch (err) {
      setApiError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{modalStyles}</style>

      <div
        className={`apm-overlay${visible ? ' apm-visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apm-title"
        aria-describedby="apm-desc"
        onClick={(e) => e.target === e.currentTarget && handleAttemptClose()}
      >
        <div className={`apm-card${visible ? ' apm-visible' : ''}`}>

          {/* Header */}
          <div className="apm-header">
            <button
              className="apm-close-btn"
              onClick={handleAttemptClose}
              aria-label="Close modal"
              disabled={saving}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="apm-eyebrow">Patient Registration</div>
            <h2 id="apm-title" className="apm-title">New Patient</h2>
            <p id="apm-desc" className="apm-sub">Fill in the patient's information below</p>
          </div>

          {/* Body */}
          <div className="apm-body">

            {/* Personal Information */}
            <p className="apm-section-label">Personal information</p>
            <div className="apm-grid2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="firstName" style={styles.label}>
                  First name <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  ref={firstFieldRef}
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-err' : undefined}
                  className={`apm-input${errors.firstName ? ' apm-input-error' : ''}`}
                />
                {errors.firstName && (
                  <p id="firstName-err" role="alert" aria-live="polite" className="apm-error">⚠ {errors.firstName}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="lastName" style={styles.label}>
                  Last name <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-err' : undefined}
                  className={`apm-input${errors.lastName ? ' apm-input-error' : ''}`}
                />
                {errors.lastName && (
                  <p id="lastName-err" role="alert" aria-live="polite" className="apm-error">⚠ {errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="apm-grid2" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="dob" style={styles.label}>
                  Date of birth <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  autoComplete="bday"
                  min={minDobStr}
                  max={today}
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.dob}
                  aria-describedby={errors.dob ? 'dob-err' : undefined}
                  className={`apm-input${errors.dob ? ' apm-input-error' : ''}`}
                />
                {errors.dob && (
                  <p id="dob-err" role="alert" aria-live="polite" className="apm-error">⚠ {errors.dob}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="gender" style={styles.label}>
                  Gender <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  autoComplete="sex"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.gender}
                  aria-describedby={errors.gender ? 'gender-err' : undefined}
                  className={`apm-input apm-select${errors.gender ? ' apm-input-error' : ''}`}
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p id="gender-err" role="alert" aria-live="polite" className="apm-error">⚠ {errors.gender}</p>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="apm-divider" />
            <p className="apm-section-label">Contact details</p>

            <div className="apm-grid1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="email" style={styles.label}>
                  Email address <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-err' : undefined}
                  className={`apm-input${errors.email ? ' apm-input-error' : ''}`}
                />
                {errors.email && (
                  <p id="email-err" role="alert" aria-live="polite" className="apm-error">⚠ {errors.email}</p>
                )}
              </div>
            </div>

            <div className="apm-grid2" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="phone" style={styles.label}>
                  Phone number <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={`phone-hint${errors.phone ? ' phone-err' : ''}`}
                  className={`apm-input${errors.phone ? ' apm-input-error' : ''}`}
                />
                <p id="phone-hint" className="apm-hint">Digits, spaces, +, –, ( ) allowed</p>
                {errors.phone && (
                  <p id="phone-err" role="alert" aria-live="polite" className="apm-error">⚠ {errors.phone}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="address" style={styles.label}>Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City"
                  autoComplete="street-address"
                  value={formData.address}
                  onChange={handleChange}
                  className="apm-input"
                />
              </div>
            </div>

            {/* Medical Notes */}
            <div className="apm-divider" />
            <p className="apm-section-label">Medical notes</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 4 }}>
              <label htmlFor="condition" style={styles.label}>
                Condition / notes{' '}
                <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
                  (optional)
                </span>
              </label>
              <textarea
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                placeholder="Primary diagnosis or reason for visit…"
                aria-describedby="condition-hint"
                className="apm-textarea"
              />
              <p id="condition-hint" className="apm-hint">This field is optional</p>
            </div>

          </div>

          {/* API Error */}
          {apiError && (
            <div role="alert" aria-live="assertive" className="apm-api-error">
              ⚠ {apiError}
            </div>
          )}

          {/* Dirty state warning */}
          {showDirtyWarning && (
            <div role="status" aria-live="polite" className="apm-dirty-warn">
              ⚠ You have unsaved changes — are you sure you want to close?
            </div>
          )}

          {/* Footer */}
          <div className="apm-footer">
            <button
              className="apm-btn apm-btn-ghost"
              onClick={handleAttemptClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="apm-btn apm-btn-primary"
              onClick={handleSubmit}
              disabled={saving}
              type="button"
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <span className="apm-spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register patient
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default AddPatientModal;