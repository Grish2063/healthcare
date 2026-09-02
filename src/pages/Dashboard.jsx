import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import AddPatientModal from './AddPatientModel';
import NewAppointmentModal from './NewAppointmentModal';
import UploadRecord from './UploadRecord';

// ─── Helpers ─── //
function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ─── Static data config ─── //
const INITIAL_ACTIVITIES = [
  {
    id: 1,
    initials: 'JD',
    color: 'blue',
    title: 'New patient registered',
    description: 'John Doe was added to the system',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 2,
    initials: 'JS',
    color: 'green',
    title: 'Appointment completed',
    description: 'Jane Smith - General Checkup',
    timestamp: Date.now() - 1000 * 60 * 240,
  },
  {
    id: 3,
    initials: 'BJ',
    color: 'purple',
    title: 'Lab results uploaded',
    description: 'Bob Johnson - Blood Test Results',
    timestamp: Date.now() - 1000 * 60 * 360,
  },
];

const COLOR_CLASSES = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-500',   avatar: 'bg-blue-500'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-500',  avatar: 'bg-green-500'  },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', avatar: 'bg-purple-500' },
};

// ─── Small presentational components ─── //
function StatCard({ label, value, subtext, gradient, iconPath }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} text-white rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-semibold">{label}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
          <p className="text-white/80 text-sm mt-2">{subtext}</p>
        </div>
        <div className="bg-white/20 rounded-full p-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const c = COLOR_CLASSES[activity.color] ?? COLOR_CLASSES.blue;
  return (
    <div className={`flex items-start gap-4 p-4 ${c.bg} rounded-lg border-l-4 ${c.border}`}>
      <div className="flex-shrink-0 mt-1">
        <div className={`w-8 h-8 ${c.avatar} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
          {activity.initials}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-gray-900 font-semibold">{activity.title}</p>
        <p className="text-gray-600 text-sm">{activity.description}</p>
        <p className="text-gray-500 text-xs mt-1">{timeAgo(activity.timestamp)}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ label, iconPath, colorClass, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? 'Coming soon' : undefined}
      className={`flex flex-col items-center justify-center p-6 rounded-lg transition border-2 border-transparent
        ${disabled
          ? 'bg-gray-50 opacity-50 cursor-not-allowed'
          : `${colorClass.bg} ${colorClass.hoverBg} hover:${colorClass.hoverBorder}`}`}
    >
      <svg className={`w-10 h-10 mb-2 ${colorClass.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
      <span className="font-semibold text-gray-900">{label}</span>
    </button>
  );
}

// ─── Dashboard ──────────────────────────────────────────
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [totalPatients, setTotalPatients] = useState(30);
  const [appointmentsToday, setAppointmentsToday] = useState(12);
  const [saveError, setSaveError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSavePatient = useCallback(async (data) => {
    setSaveError(null);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulated API call — replace with real request.
          data ? resolve() : reject(new Error('Missing patient data'));
        }, 800);
      });

      const newActivity = {
        id: Date.now(),
        initials: getInitials(data.firstName, data.lastName),
        color: 'blue',
        title: 'New patient registered',
        description: `${data.firstName} ${data.lastName} was added to the system`,
        timestamp: Date.now(),
      };

      setActivities((prev) => [newActivity, ...prev]);
      setTotalPatients((prev) => prev + 1);
      setShowAddPatientModal(false);
    } catch (err) {
      setSaveError('Could not save patient. Please try again.');
      throw err; // let the modal know the save failed so it can stay open
    }
  }, []);

  const handleSaveAppointment = useCallback(async (data) => {
    setSaveError(null);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          data ? resolve() : reject(new Error('Missing appointment data'));
        }, 800);
      });

      const newActivity = {
        id: Date.now(),
        initials: 'AP',
        color: 'green',
        title: 'New appointment booked',
        description: `Appointment scheduled for ${data.date} at ${data.timeSlot}`,
        timestamp: Date.now(),
      };

      setActivities((prev) => [newActivity, ...prev]);
      setAppointmentsToday((prev) => prev + 1);
      setShowAppointmentModal(false);
    } catch (err) {
      setSaveError('Could not save appointment. Please try again.');
      throw err;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {showAddPatientModal && (
        <AddPatientModal
          onClose={() => setShowAddPatientModal(false)}
          onSave={handleSavePatient}
        />
      )}

      {showAppointmentModal && (
        <NewAppointmentModal
          onClose={() => setShowAppointmentModal(false)}
          onSave={handleSaveAppointment}
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

        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6" role="alert">
            {saveError}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            label="Total Patients"
            value={totalPatients}
            subtext="↑ 12% from last month"
            gradient="from-blue-500 to-blue-600"
            iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <StatCard
            label="Appointments Today"
            value={appointmentsToday}
            subtext="4 pending, 8 completed"
            gradient="from-green-500 to-green-600"
            iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <StatCard
            label="Pending Tasks"
            value={8}
            subtext="3 urgent, 5 normal"
            gradient="from-purple-500 to-purple-600"
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity yet.</p>
            ) : (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <QuickActionButton
              label="Add Patient"
              onClick={() => setShowAddPatientModal(true)}
              iconPath="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600', hoverBg: 'hover:bg-blue-100', hoverBorder: 'border-blue-500' }}
            />
            <QuickActionButton
              label="New Appointment"
              onClick={() => setShowAppointmentModal(true)}
              iconPath="M12 6v6m0 0v6m0-6h6m-6 0H6"
              colorClass={{ bg: 'bg-green-50', text: 'text-green-600', hoverBg: 'hover:bg-green-100', hoverBorder: 'border-green-500' }}
            />
            <QuickActionButton
              label="Upload Records"
              iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600', hoverBg: 'hover:bg-purple-100', hoverBorder: 'border-purple-500' }}
            />
            <QuickActionButton
              label="View Reports"
              disabled
              iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              colorClass={{ bg: 'bg-orange-50', text: 'text-orange-600', hoverBg: 'hover:bg-orange-100', hoverBorder: 'border-orange-500' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;



