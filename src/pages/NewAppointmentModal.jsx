import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Field config ───//
const REQUIRED_FIELDS = ['patientName', 'doctor', 'date', 'timeSlot', 'reason'];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM',
];

const DOCTORS = [
  'Dr. Sarah Mitchell — General Physician',
  'Dr. Alan Reyes — Cardiologist',
  'Dr. Priya Nair — Pediatrician',
  'Dr. James Okafor — Orthopedic',
  'Dr. Lena Kaur — Dermatologist',
];

const APPOINTMENT_TYPES = ['General Checkup', 'Follow-up', 'Consultation', 'Lab Review', 'Emergency'];

function validate(formData) {
  const errors = {};

  if (!formData.patientName.trim()) {
    errors.patientName = 'Patient name is required';
  }

  if (!formData.doctor) {
    errors.doctor = 'Please select a doctor';
  }

  if (!formData.date) {
    errors.date = 'Appointment date is required';
  } else {
    const selected = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.date = 'Date cannot be in the past';
    }
  }

  if (!formData.timeSlot) {
    errors.timeSlot = 'Please select a time slot';
  }

  if (!formData.reason.trim()) {
    errors.reason = 'Reason for visit is required';
  }

  return errors;
}

// ─── Styles ──//
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
    box-shadow: 0 32px 80px rgba(10, 25, 60, 0.18), 0 0 0 1px rgba(180,200,240,0.2);
    transform: translateY(18px) scale(0.98);
    transition: transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease;
    opacity: 0;
    position: relative;
  }
  .nam-card.nam-visible {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .nam-header {
    background: linear-gradient(135deg, #14532d 0%, #16213e 100%);
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
    color: rgba(134,239,172,0.8);
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
    color: rgba(187,247,208,0.7);
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
  .nam-close-btn:focus-visible { outline: 2px solid #4ade80; outline-offset: 2px; }

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
  .nam-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .nam-grid1 { display: grid; grid-template-columns: 1fr; margin-bottom: 16px; }

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
    border-color: #22c55e;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
  }
  .nam-input:focus-visible { outline: none; }
  .nam-input-error {
    border-color: #f43f5e !important;
    background: #fff5f7 !important;
  }
  .nam-input-error:focus {
    box-shadow: 0 0 0 3px rgba(244,63,94,0.1) !important;
  }
  .nam-select { cursor: pointer; }

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
    border-color: #22c55e;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
  }

  .nam-slot-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .nam-slot-btn {
    padding: 8px 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: #475569;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .nam-slot-btn:hover { border-color: #86efac; background: #f0fdf4; }
  .nam-slot-btn.nam-slot-selected {
    background: #16a34a;
    border-color: #16a34a;
    color: #fff;
  }
  .nam-slot-btn:focus-visible { outline: 2px solid #22c55e; outline-offset: 2px; }

  .nam-error {
    font-size: 11.5px;
    color: #f43f5e;
    font-weight: 500;
    margin: 0;
  }
  .nam-hint {
    font-size: 11px;
    color: #94a3b8;
    margin: 0;
  }

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
  .nam-btn:focus-visible { outline: 2px solid #22c55e; outline-offset: 2px; }
  .nam-btn-ghost {
    background: #f1f5f9;
    color: #64748b;
  }
  .nam-btn-ghost:hover:not(:disabled) { background: #e2e8f0; color: #475569; }
  .nam-btn-primary {
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: white;
    min-width: 152px;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(22,163,74,0.35);
  }
  .nam-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #15803d, #166534);
    box-shadow: 0 6px 18px rgba(22,163,74,0.4);
    transform: translateY(-1px);
  }
  .nam-btn-primary:disabled, .nam-btn-ghost:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
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
    .nam-slot-grid { grid-template-columns: repeat(3, 1fr); }
    .nam-body { padding: 20px 20px 8px; }
    .nam-header { padding: 22px 20px 18px; }
    .nam-footer { padding: 12px 20px 20px; }
    .nam-api-error, .nam-dirty-warn { margin: 0 20px 8px; }
  }
`;

// ─── Empty form state ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  patientName: '',
  doctor: '',
  date: '',
  timeSlot: '',
  type: 'General Checkup',
  reason: '',
};

// ─── NewAppointmentModal ────────────────────────────────────────────────────
/**
 * Props:
 *  - onClose: () => void        — called when the modal should unmount
 *  - onSave:  (data) => Promise — receives form data; throw to show an API error
 */
function NewAppointmentModal({ onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);
  const isDirty = useRef(false);
  const firstFieldRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

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

  const handleSlotSelect = (slot) => {
    isDirty.current = true;
    setFormData((prev) => ({ ...prev, timeSlot: slot }));
    if (errors.timeSlot) setErrors((prev) => ({ ...prev, timeSlot: '' }));
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
        className={`nam-overlay${visible ? ' nam-visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nam-title"
        aria-describedby="nam-desc"
        onClick={(e) => e.target === e.currentTarget && handleAttemptClose()}
      >
        <div className={`nam-card${visible ? ' nam-visible' : ''}`}>

          {/* Header */}
          <div className="nam-header">
            <button
              className="nam-close-btn"
              onClick={handleAttemptClose}
              aria-label="Close modal"
              disabled={saving}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="nam-eyebrow">Appointment Booking</div>
            <h2 id="nam-title" className="nam-title">New Appointment</h2>
            <p id="nam-desc" className="nam-sub">Schedule a visit for a patient</p>
          </div>

          {/* Body */}
          <div className="nam-body">

            {/* Patient & Doctor */}
            <p className="nam-section-label">Patient &amp; doctor</p>
            <div className="nam-grid1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="patientName" style={styles.label}>
                  Patient name <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  ref={firstFieldRef}
                  id="patientName"
                  name="patientName"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.patientName}
                  aria-describedby={errors.patientName ? 'patientName-err' : undefined}
                  className={`nam-input${errors.patientName ? ' nam-input-error' : ''}`}
                />
                {errors.patientName && (
                  <p id="patientName-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.patientName}</p>
                )}
              </div>
            </div>

            <div className="nam-grid1" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="doctor" style={styles.label}>
                  Doctor <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <select
                  id="doctor"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.doctor}
                  aria-describedby={errors.doctor ? 'doctor-err' : undefined}
                  className={`nam-input nam-select${errors.doctor ? ' nam-input-error' : ''}`}
                >
                  <option value="">Select a doctor…</option>
                  {DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
                {errors.doctor && (
                  <p id="doctor-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.doctor}</p>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="nam-divider" />
            <p className="nam-section-label">Schedule</p>

            <div className="nam-grid2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="date" style={styles.label}>
                  Date <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? 'date-err' : undefined}
                  className={`nam-input${errors.date ? ' nam-input-error' : ''}`}
                />
                {errors.date && (
                  <p id="date-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.date}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor="type" style={styles.label}>Appointment type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="nam-input nam-select"
                >
                  {APPOINTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
              <label style={styles.label} id="timeSlot-label">
                Time slot <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
              </label>
              <div
                id="timeSlot"
                className="nam-slot-grid"
                role="group"
                aria-labelledby="timeSlot-label"
                aria-invalid={!!errors.timeSlot}
                aria-describedby={errors.timeSlot ? 'timeSlot-err' : undefined}
              >
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    aria-pressed={formData.timeSlot === slot}
                    className={`nam-slot-btn${formData.timeSlot === slot ? ' nam-slot-selected' : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.timeSlot && (
                <p id="timeSlot-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.timeSlot}</p>
              )}
            </div>

            {/* Reason */}
            <div className="nam-divider" />
            <p className="nam-section-label">Reason for visit</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 4 }}>
              <label htmlFor="reason" style={styles.label}>
                Notes <span style={{ color: '#f43f5e' }} aria-hidden="true">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Symptoms, follow-up context, or reason for the visit…"
                required
                aria-required="true"
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? 'reason-err' : undefined}
                className={`nam-textarea${errors.reason ? ' nam-input-error' : ''}`}
              />
              {errors.reason && (
                <p id="reason-err" role="alert" aria-live="polite" className="nam-error">⚠ {errors.reason}</p>
              )}
            </div>

          </div>

          {/* API Error */}
          {apiError && (
            <div role="alert" aria-live="assertive" className="nam-api-error">
              ⚠ {apiError}
            </div>
          )}

          {/* Dirty state warning */}
          {showDirtyWarning && (
            <div role="status" aria-live="polite" className="nam-dirty-warn">
              ⚠ You have unsaved changes — are you sure you want to close?
            </div>
          )}

          {/* Footer */}
          <div className="nam-footer">
            <button
              className="nam-btn nam-btn-ghost"
              onClick={handleAttemptClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="nam-btn nam-btn-primary"
              onClick={handleSubmit}
              disabled={saving}
              type="button"
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <span className="nam-spinner" aria-hidden="true" />
                  Booking…
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

export default NewAppointmentModal;