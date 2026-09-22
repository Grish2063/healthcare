import { useMemo, useState } from 'react';

const REPORT_CATEGORIES = ['All', 'Patients', 'Appointments', 'Lab Results'];

const MOCK_REPORTS = [
  {
    id: 1,
    category: 'Patients',
    title: 'Monthly Patient Registrations',
    description: '30 new patients registered this month',
    date: '2026-09-01',
  },
  {
    id: 2,
    category: 'Appointments',
    title: 'Appointments Summary',
    description: '12 appointments today, 4 pending, 8 completed',
    date: '2026-09-14',
  },
  {
    id: 3,
    category: 'Lab Results',
    title: 'Pending Lab Results',
    description: '3 results awaiting review',
    date: '2026-09-13',
  },
  {
    id: 4,
    category: 'Patients',
    title: 'Patient Demographics Breakdown',
    description: 'Age and gender distribution report',
    date: '2026-08-28',
  },
];

const CATEGORY_BADGE = {
  Patients: 'bg-blue-100 text-blue-700',
  Appointments: 'bg-green-100 text-green-700',
  'Lab Results': 'bg-purple-100 text-purple-700',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Report row ── //
function ReportRow({ report, onView, onDownload }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              CATEGORY_BADGE[report.category] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {report.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(report.date)}</span>
        </div>
        <p className="text-gray-900 font-semibold">{report.title}</p>
        <p className="text-gray-600 text-sm">{report.description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          onClick={() => onView?.(report)}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          View
        </button>
        <button
          onClick={() => onDownload?.(report)}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          Download
        </button>
      </div>
    </div>
  );
}

// ─── ViewReportsModal ───────────────────────────────────
function ViewReportsModal({ onClose, reports = MOCK_REPORTS }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredReports = useMemo(() => {
    if (activeCategory === 'All') return reports;
    return reports.filter((r) => r.category === activeCategory);
  }, [reports, activeCategory]);

  const handleView = (report) => {
    // TODO: hook up to a real report viewer / detail route
    console.log('Viewing report:', report);
  };

  const handleDownload = (report) => {
    // TODO: hook up to a real export/download endpoint
    console.log('Downloading report:', report);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {REPORT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                activeCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Report list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredReports.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No reports in this category yet.
            </p>
          ) : (
            filteredReports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onView={handleView}
                onDownload={handleDownload}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewReportsModal;
