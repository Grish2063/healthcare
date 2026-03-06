import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function AddPatientModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    condition: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave(formData);
    setSaving(false);
    handleClose();
  };

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div className="apm-field-group">
      <label className="apm-label">
        {label}{required && <span className="apm-required"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`apm-input${errors[name] ? ' apm-input-error' : ''}`}
      />
      {errors[name] && <p className="apm-error-msg">⚠ {errors[name]}</p>}
    </div>
  );

  return (
    <>
      <style>{`
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
          box-shadow: 0 32px 80px rgba(10, 25, 60, 0.18), 0 0 0 1px rgba(180,200,240,0.25);
          transform: translateY(18px) scale(0.98);
          transition: transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease;
          opacity: 0;
        }
        .apm-card.apm-visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        /* Header */
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
        .apm-header::after {
          content: '';
          position: absolute;
          bottom: -60px; left: 30%;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(99,179,237,0.07);
          pointer-events: none;
        }
        .apm-header-eyebrow {
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(147,197,253,0.8);
          font-weight: 500;
          margin-bottom: 6px;
        }
        .apm-header-title {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #ffffff;
          line-height: 1.2;
        }
        .apm-header-sub {
          font-size: 13px;
          color: rgba(191, 219, 254, 0.7);
          margin-top: 4px;
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
        .apm-close-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        /* Body */
        .apm-body { padding: 28px 32px 8px; }

        .apm-section-title {
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
          margin: 6px 0 22px;
        }
        .apm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .apm-grid-1 { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }

        .apm-field-group { display: flex; flex-direction: column; gap: 6px; }
        .apm-label {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #64748b;
        }
        .apm-required { color: #f43f5e; }

        .apm-input, .apm-select, .apm-textarea {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.15s ease;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          appearance: none;
          -webkit-appearance: none;
        }
        .apm-input:focus, .apm-select:focus, .apm-textarea:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .apm-input-error, .apm-select-error {
          border-color: #f43f5e !important;
          background: #fff5f7 !important;
        }
        .apm-input-error:focus, .apm-select-error:focus {
          box-shadow: 0 0 0 3px rgba(244,63,94,0.1) !important;
        }
        .apm-error-msg {
          font-size: 11.5px;
          color: #f43f5e;
          font-weight: 500;
          margin: 0;
        }
        .apm-textarea {
          resize: none;
          min-height: 80px;
        }

        /* Footer */
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
        .apm-btn-ghost {
          background: #f1f5f9;
          color: #64748b;
        }
        .apm-btn-ghost:hover { background: #e2e8f0; color: #475569; }
        .apm-btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          min-width: 148px;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }
        .apm-btn-primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          box-shadow: 0 6px 18px rgba(37,99,235,0.4);
          transform: translateY(-1px);
        }
        .apm-btn-primary:disabled {
          opacity: 0.7;
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
      `}</style>

      <div
        className={`apm-overlay${visible ? ' apm-visible' : ''}`}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className={`apm-card${visible ? ' apm-visible' : ''}`}>

          {/* Header */}
          <div className="apm-header">
            <button className="apm-close-btn" onClick={handleClose} aria-label="Close">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="apm-header-eyebrow">Patient Registry</div>
            <div className="apm-header-title">New Patient</div>
            <div className="apm-header-sub">Fill in the patient's information below</div>
          </div>

          {/* Body */}
          <div className="apm-body">

            <p className="apm-section-title">Personal Information</p>
            <div className="apm-grid-2">
              <Field label="First Name" name="firstName" placeholder="John" required />
              <Field label="Last Name" name="lastName" placeholder="Doe" required />
            </div>
            <div className="apm-grid-2" style={{ marginBottom: 0 }}>
              <Field label="Date of Birth" name="dob" type="date" required />
              <div className="apm-field-group">
                <label className="apm-label">Gender <span className="apm-required">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`apm-select${errors.gender ? ' apm-select-error' : ''}`}
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
                {errors.gender && <p className="apm-error-msg">⚠ {errors.gender}</p>}
              </div>
            </div>

            <div className="apm-divider" style={{ marginTop: 22 }} />
            <p className="apm-section-title">Contact Details</p>

            <div className="apm-grid-1">
              <Field label="Email Address" name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="apm-grid-2" style={{ marginBottom: 0 }}>
              <Field label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" required />
              <Field label="Address" name="address" placeholder="123 Main St, City" />
            </div>

            <div className="apm-divider" style={{ marginTop: 22 }} />
            <p className="apm-section-title">Medical Notes</p>

            <div className="apm-field-group" style={{ marginBottom: 4 }}>
              <label className="apm-label">
                Condition / Notes <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                placeholder="Primary diagnosis or reason for visit..."
                className="apm-textarea"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="apm-footer">
            <button className="apm-btn apm-btn-ghost" onClick={handleClose} disabled={saving}>
              Cancel
            </button>
            <button className="apm-btn apm-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <span className="apm-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register Patient
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddPatientModal, setShowPatientModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSavePatient = (data) => {
    console.log('New patient:', data);
    // TODO: replace with your real API call, e.g.:
    // await api.post('/patients', data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showAddPatientModal && (
        <AddPatientModal
          onClose={() => setShowPatientModal(false)}
          onSave={handleSavePatient}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Healthcare Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard! 🎉
          </h2>
          <p className="text-gray-600">
            You have successfully logged in. Here's your healthcare management overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">Total Patients</p>
                <p className="text-4xl font-bold mt-2">30</p>
                <p className="text-blue-100 text-sm mt-2">↑ 12% from last month</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Appointments Today</p>
                <p className="text-4xl font-bold mt-2">12</p>
                <p className="text-green-100 text-sm mt-2">4 pending, 8 completed</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold">Pending Tasks</p>
                <p className="text-4xl font-bold mt-2">8</p>
                <p className="text-purple-100 text-sm mt-2">3 urgent, 5 normal</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">JD</div>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">New patient registered</p>
                <p className="text-gray-600 text-sm">John Doe was added to the system</p>
                <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">JS</div>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">Appointment completed</p>
                <p className="text-gray-600 text-sm">Jane Smith - General Checkup</p>
                <p className="text-gray-500 text-xs mt-1">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">BJ</div>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">Lab results uploaded</p>
                <p className="text-gray-600 text-sm">Bob Johnson - Blood Test Results</p>
                <p className="text-gray-500 text-xs mt-1">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowPatientModal(true)}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition border-2 border-transparent hover:border-blue-500"
            >
              <svg className="w-10 h-10 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="font-semibold text-gray-900">Add Patient</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition border-2 border-transparent hover:border-green-500">
              <svg className="w-10 h-10 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold text-gray-900">New Appointment</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition border-2 border-transparent hover:border-purple-500">
              <svg className="w-10 h-10 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-gray-900">Upload Records</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition border-2 border-transparent hover:border-orange-500">
              <svg className="w-10 h-10 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

