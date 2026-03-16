import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { Home, Users, ClipboardList, AlertTriangle, RefreshCw } from 'lucide-react';

const statCards = [
  { key: 'totalHouses', label: 'Total Houses', icon: Home, color: 'blue' },
  { key: 'totalStudents', label: 'Total Students', icon: Users, color: 'emerald' },
  { key: 'totalVisits', label: 'Total Visits', icon: ClipboardList, color: 'violet' },
  { key: 'highRiskPatients', label: 'High Risk', icon: AlertTriangle, color: 'red' },
];

const colorMap = {
  blue:     { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: 'bg-blue-100' },
  emerald:  { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
  violet:   { bg: 'bg-violet-50',  text: 'text-violet-600',  icon: 'bg-violet-100' },
  red:      { bg: 'bg-red-50',     text: 'text-red-600',     icon: 'bg-red-100' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>;
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"><RefreshCw size={16} className="inline mr-2" />Retry</button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 text-sm">Overview of the health monitoring system</p>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh"><RefreshCw size={20} className="text-gray-500" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => {
          const c = colorMap[color];
          return (
            <div key={key} className={`${c.bg} rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${c.icon} p-2.5 rounded-lg`}>
                  <Icon size={20} className={c.text} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${c.text}`}>{data?.[key] ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
