import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const APPOINTMENT_TYPES = [
  { value: 'checkup',   label: 'Checkup',   color: 'blue'   },
  { value: 'followup',  label: 'Follow-up', color: 'green'  },
  { value: 'urgent',    label: 'Urgent',    color: 'amber'  },
  { value: 'procedure', label: 'Procedure', color: 'purple' },
  { value: 'lab',       label: 'Lab work',  color: 'gray'   },
];

const DURATIONS = ['15 minutes', '30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours'];

const CHIP_COLORS = {
  blue:   { bg: '#E6F1FB', border: '#B5D4F4', text: '#0C447C' },
  green:  { bg: '#EAF3DE', border: '#C0DD97', text: '#3B6D11' },
  amber:  { bg: '#FAEEDA', border: '#FAC775', text: '#854F0B' },
  purple: { bg: '#EEEDFE', border: '#CECBF6', text: '#3C3489' },
  gray:   { bg: '#F1EFE8', border: '#D3D1C7', text: '#5F5E5A' },
};

const EMPTY_FORM = {
  patientName: '',
  date: '',
  time: '',
  type: '',
  duration: '30 minutes',
  doctor: '',
  notes: '',
};

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(formData) {
  const errors = {};
  if (!formData.patientName.trim()) errors.patientName = 'Patient name is required';
  if (!formData.date)               errors.date        = 'Date is required';
  else {
    const selected = new Date(formData.date);
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    if (selected < today) errors.date = 'Date cannot be in the past';
  }
  if (!formData.time)               errors.time        = 'Time is required';
  if (!formData.type)               errors.type        = 'Please select an appointment type';
  if (!formData.doctor.trim())      errors.doctor      = 'Assigned doctor is required';
  return errors;
}

// ─── NewAppointmentModal ──────────────────────────────────────────────────────
/**
 * Props:
 *  - onClose:  () => void         — called when the modal should unmount
 *  - onSave:   (data) => Promise  — receives form data; throw to show an API error
 *  - patients: string[]           — optional list of existing patient names for suggestions
 */
function AppointmentModal({ onClose, onSave, patients = [] }) {
  const [formData, setFormData]           = useState(EMPTY_FORM);
  const [errors, setErrors]               = useState({});
  const [saving, setSaving]               = useState(false);
  const [visible, setVisible]             = useState(false);
  const [apiError, setApiError]           = useState('');
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);
  const [suggestions, setSuggestions]     = useState([]);
  const isDirty    = useRef(false);
  const firstField = useRef(null);

  const today    = new Date().toISOString().split('T')[0];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    firstField.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleAttemptClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    isDirty.current = true;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');

    // patient autocomplete
    if (name === 'patientName' && value.trim() && patients.length) {
      const q = value.toLowerCase();
      setSuggestions(patients.filter((p) => p.toLowerCase().includes(q)).slice(0, 5));
    } else if (name === 'patientName') {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (name) => {
    isDirty.current = true;
    setFormData((prev) => ({ ...prev, patientName: name }));
    setSuggestions([]);
    if (errors.patientName) setErrors((prev) => ({ ...prev, patientName: '' }));
  };

  const selectType = (value) => {
    isDirty.current = true;
    setFormData((prev) => ({ ...prev, type: value }));
    if (errors.type) setErrors((prev) => ({ ...prev, type: '' }));
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
      const firstErr = ['patientName', 'date', 'time', 'type', 'doctor'].find((f) => validationErrors[f]);
      if (firstErr) {
        const el = document.getElementById(`nam-${firstErr}`);
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
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
        className={`nam-overlay${visible ? ' nam-visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nam-title"
        aria-describedby="nam-desc"
        onClick={(e) => e.target === e.currentTarget && handleAttemptClose()}
      >
        <div className={`nam-card${visible ? ' nam-visible' : ''}`}>

          {/* ── Header ── */}
          <div className="nam-header">
            <button className="nam-close-btn" onClick={handleAttemptClose} aria-label="Close modal" disabled={saving}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="nam-eyebrow">Scheduling</div>
            <h2 id="nam-title" className="nam-title">New appointment</h2>
            <p id="nam-desc" className="nam-sub">Fill in the appointment details below</p>
          </div>

          {/* ── Body ── */}
          <div className="nam-body">

            {/* Patient */}
            <p className="nam-section-label">Patient</p>
            <div className="nam-field" style={{ position: 'relative' }}>
              <label htmlFor="nam-patientName" className="nam-label">
                Patient name <span className="nam-req" aria-hidden="true">*</span>
              </label>
              <div className="nam-input-wrap">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true" className="nam-input-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  ref={firstField}
                  id="nam-patientName"
                  name="patientName"
                  type="text"
                  placeholder="Search or enter patient name…"
                  autoComplete="off"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.patientName}
                  aria-describedby={errors.patientName ? 'nam-patientName-err' : undefined}
                  className={`nam-input nam-input-icon-pad${errors.patientName ? ' nam-input-error' : ''}`}
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="nam-suggestions" role="listbox">
                  {suggestions.map((s) => (
                    <li key={s} role="option" className="nam-suggestion-item" onMouseDown={() => selectSuggestion(s)}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {errors.patientName && (
                <p id="nam-patientName-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.patientName}</p>
              )}
            </div>

            <div className="nam-divider" />

            {/* Appointment details */}
            <p className="nam-section-label">Appointment details</p>

            {/* Date + Time */}
            <div className="nam-grid2">
              <div className="nam-field">
                <label htmlFor="nam-date" className="nam-label">
                  Date <span className="nam-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="nam-date"
                  name="date"
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? 'nam-date-err' : undefined}
                  className={`nam-input${errors.date ? ' nam-input-error' : ''}`}
                />
                {errors.date && (
                  <p id="nam-date-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.date}</p>
                )}
              </div>

              <div className="nam-field">
                <label htmlFor="nam-time" className="nam-label">
                  Time <span className="nam-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="nam-time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.time}
                  aria-describedby={errors.time ? 'nam-time-err' : undefined}
                  className={`nam-input${errors.time ? ' nam-input-error' : ''}`}
                />
                {errors.time && (
                  <p id="nam-time-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.time}</p>
                )}
              </div>
            </div>

            {/* Type */}
            <div className="nam-field">
              <div className="nam-label" id="nam-type-label">
                Appointment type <span className="nam-req" aria-hidden="true">*</span>
              </div>
              <div
                className="nam-chips"
                role="group"
                aria-labelledby="nam-type-label"
                aria-required="true"
              >
                {APPOINTMENT_TYPES.map(({ value, label, color }) => {
                  const c = CHIP_COLORS[color];
                  const selected = formData.type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectType(value)}
                      aria-pressed={selected}
                      className="nam-chip"
                      style={{
                        background: selected ? c.bg : 'transparent',
                        borderColor: selected ? c.border : 'var(--nam-border)',
                        color: selected ? c.text : 'var(--nam-text-muted)',
                        fontWeight: selected ? 600 : 400,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p role="alert" aria-live="polite" className="nam-error">⚠ {errors.type}</p>
              )}
            </div>

            {/* Duration + Doctor */}
            <div className="nam-grid2">
              <div className="nam-field">
                <label htmlFor="nam-duration" className="nam-label">Duration</label>
                <select
                  id="nam-duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="nam-input nam-select"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="nam-field">
                <label htmlFor="nam-doctor" className="nam-label">
                  Assigned doctor <span className="nam-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="nam-doctor"
                  name="doctor"
                  type="text"
                  placeholder="Dr. Name"
                  autoComplete="off"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.doctor}
                  aria-describedby={errors.doctor ? 'nam-doctor-err' : undefined}
                  className={`nam-input${errors.doctor ? ' nam-input-error' : ''}`}
                />
                {errors.doctor && (
                  <p id="nam-doctor-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.doctor}</p>
                )}
              </div>
            </div>

            <div className="nam-divider" />

            {/* Notes */}
            <p className="nam-section-label">Notes</p>
            <div className="nam-field" style={{ marginBottom: 4 }}>
              <label htmlFor="nam-notes" className="nam-label">
                Reason for visit{' '}
                <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
                  (optional)
                </span>
              </label>
              <textarea
                id="nam-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Describe the purpose of this visit…"
                aria-describedby="nam-notes-hint"
                className="nam-textarea"
              />
              <p id="nam-notes-hint" className="nam-hint">This field is optional</p>
            </div>

          </div>

          {/* API Error */}
          {apiError && (
            <div role="alert" aria-live="assertive" className="nam-api-error">
              ⚠ {apiError}
            </div>
          )}

          {/* Dirty warning */}
          {showDirtyWarning && (
            <div role="status" aria-live="polite" className="nam-dirty-warn">
              ⚠ You have unsaved changes — are you sure you want to close?
            </div>
          )}

          {/* Footer */}
          <div className="nam-footer">
            <button className="nam-btn nam-btn-ghost" onClick={handleAttemptClose} disabled={saving} type="button">
              Cancel
            </button>
            <button className="nam-btn nam-btn-primary" onClick={handleSubmit} disabled={saving} type="button" aria-busy={saving}>
              {saving ? (
                <>
                  <span className="nam-spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book appointment
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const modalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  :root {
    --nam-border: #e2e8f0;
    --nam-text-muted: #64748b;
  }

  .nam-overlay {
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
  .nam-overlay.nam-visible { opacity: 1; }

  .nam-card {
    background: #ffffff;
    border-radius: 20px;
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(10,25,60,0.18), 0 0 0 1px rgba(180,200,240,0.2);
    transform: translateY(18px) scale(0.98);
    transition: transform 0.25s cubic-bezier(0.34,1.3,0.64,1), opacity 0.2s ease;
    opacity: 0;
    position: relative;
  }
  .nam-card.nam-visible { transform: translateY(0) scale(1); opacity: 1; }

  .nam-header {
    background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
    padding: 28px 32px 24px;
    position: relative;
    overflow: hidden;
    border-radius: 20px 20px 0 0;
  }
  .nam-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .nam-eyebrow {
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(147,197,253,0.8);
    font-weight: 500;
    margin-bottom: 6px;
  }
  .nam-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #ffffff;
    line-height: 1.2;
    margin: 0;
  }
  .nam-sub {
    font-size: 13px;
    color: rgba(191,219,254,0.7);
    margin: 4px 0 0;
  }
  .nam-close-btn {
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
  .nam-close-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
  .nam-close-btn:focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; }

  .nam-body { padding: 28px 32px 8px; }

  .nam-section-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 14px;
  }
  .nam-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 22px 0;
  }
  .nam-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .nam-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }

  .nam-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #64748b;
  }
  .nam-req { color: #f43f5e; }

  .nam-input-wrap { position: relative; display: flex; align-items: center; }
  .nam-input-icon {
    position: absolute;
    left: 13px;
    color: #94a3b8;
    pointer-events: none;
  }
  .nam-input-icon-pad { padding-left: 38px !important; }

  .nam-input {
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
  .nam-input:focus {
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .nam-input-error {
    border-color: #f43f5e !important;
    background: #fff5f7 !important;
  }
  .nam-input-error:focus { box-shadow: 0 0 0 3px rgba(244,63,94,0.1) !important; }
  .nam-select { cursor: pointer; }

  .nam-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .nam-chip {
    padding: 6px 14px;
    border-radius: 99px;
    border: 1.5px solid;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: transparent;
  }
  .nam-chip:hover { opacity: 0.85; }
  .nam-chip:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

  .nam-suggestions {
    position: absolute;
    top: calc(100% - 6px);
    left: 0; right: 0;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(10,25,60,0.1);
    z-index: 10;
    list-style: none;
    margin: 0;
    padding: 4px;
    max-height: 180px;
    overflow-y: auto;
  }
  .nam-suggestion-item {
    padding: 9px 12px;
    font-size: 14px;
    color: #1e293b;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.1s;
  }
  .nam-suggestion-item:hover { background: #f1f5f9; }

  .nam-textarea {
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
  .nam-textarea:focus {
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .nam-error { font-size: 11.5px; color: #f43f5e; font-weight: 500; margin: 0; }
  .nam-hint  { font-size: 11px; color: #94a3b8; margin: 0; }

  .nam-api-error {
    margin: 0 32px 8px;
    padding: 10px 14px;
    background: #fff5f7;
    border: 1.5px solid #f43f5e;
    border-radius: 10px;
    font-size: 13px;
    color: #f43f5e;
    font-weight: 500;
  }
  .nam-dirty-warn {
    margin: 0 32px 8px;
    padding: 10px 14px;
    background: #fffbeb;
    border: 1.5px solid #f59e0b;
    border-radius: 10px;
    font-size: 13px;
    color: #b45309;
    font-weight: 500;
  }

  .nam-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 32px 28px;
  }
  .nam-btn {
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
  .nam-btn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
  .nam-btn-ghost { background: #f1f5f9; color: #64748b; }
  .nam-btn-ghost:hover:not(:disabled) { background: #e2e8f0; color: #475569; }
  .nam-btn-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    min-width: 164px;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  .nam-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    box-shadow: 0 6px 18px rgba(37,99,235,0.4);
    transform: translateY(-1px);
  }
  .nam-btn-primary:disabled,
  .nam-btn-ghost:disabled  { opacity: 0.65; cursor: not-allowed; transform: none; }

  .nam-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: nam-spin 0.6s linear infinite;
    flex-shrink: 0;
  }
  @keyframes nam-spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .nam-grid2 { grid-template-columns: 1fr; }
    .nam-body   { padding: 20px 20px 8px; }
    .nam-header { padding: 22px 20px 18px; }
    .nam-footer { padding: 12px 20px 20px; flex-direction: column; }
    .nam-btn-primary { min-width: unset; width: 100%; justify-content: center; }
    .nam-api-error, .nam-dirty-warn { margin: 0 20px 8px; }
  }
`;

export default AppointmentModal;