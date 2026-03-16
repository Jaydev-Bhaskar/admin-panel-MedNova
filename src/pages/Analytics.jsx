import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const riskColor = (level) => {
  switch ((level || '').toUpperCase()) {
    case 'HIGH': return '#ef4444';
    case 'MODERATE': return '#f59e0b';
    default: return '#22c55e';
  }
};

const createIcon = (color) => L.divIcon({
  className: '',
  html: `<svg width="28" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

const periods = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '3months', label: '3 Months' },
  { key: 'all', label: 'All Time' },
];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');

  const fetchData = async (p) => {
    setLoading(true); setError('');
    try {
      const res = await getAnalytics(p);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(period); }, [period]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>;
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={() => fetchData(period)} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"><RefreshCw size={16} className="inline mr-2" />Retry</button>
    </div>
  );

  const ncd = data?.ncdDistribution || {};
  const risk = data?.riskDistribution || {};
  const bmi = data?.bmiDistribution || {};
  const houses = data?.houses || [];

  const ncdChartData = [
    { name: 'Hypertension', value: ncd.hypertension || 0, fill: '#ef4444' },
    { name: 'Diabetes', value: ncd.diabetes || 0, fill: '#f59e0b' },
    { name: 'Obesity', value: ncd.obesity || 0, fill: '#f97316' },
    { name: 'Normal', value: ncd.normal || 0, fill: '#22c55e' },
  ];

  const riskTotal = Object.values(risk).reduce((s, r) => s + (r?.count || 0), 0) || 1;

  const mapCenter = houses.length > 0
    ? [houses.reduce((s, h) => s + h.latitude, 0) / houses.length,
       houses.reduce((s, h) => s + h.longitude, 0) / houses.length]
    : [20.5937, 78.9629];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Health Analytics</h2>
          <p className="text-gray-500 text-sm">{data?.totalVisits || 0} total visits recorded</p>
        </div>
        <button onClick={() => fetchData(period)} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={20} className="text-gray-500" /></button>
      </div>

      {/* Period Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === key ? 'bg-cyan-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* NCD Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">NCD Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ncdChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {ncdChartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Risk Level Distribution</h3>
          <div className="space-y-4">
            {[
              { key: 'normal', label: 'Normal', color: 'emerald' },
              { key: 'moderate', label: 'Moderate', color: 'amber' },
              { key: 'high', label: 'High Risk', color: 'red' },
            ].map(({ key, label, color }) => {
              const stat = risk[key] || { count: 0, percentage: 0 };
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`text-sm font-medium text-${color}-600`}>{stat.percentage}% ({stat.count})</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${color}-500 rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BMI Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">BMI Distribution</h3>
          <div className="space-y-3">
            {[
              { key: 'underweight', label: 'Underweight', color: '#3b82f6' },
              { key: 'normal', label: 'Normal', color: '#22c55e' },
              { key: 'overweight', label: 'Overweight', color: '#f59e0b' },
              { key: 'obese', label: 'Obese', color: '#ef4444' },
            ].map(({ key, label, color }) => {
              const count = bmi[key] || 0;
              const total = Object.values(bmi).reduce((s, v) => s + v, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Visits Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Visits</h3>
          {(data?.dailyVisits?.length || 0) === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No visit data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(data?.dailyVisits || []).map(d => ({ date: d.date?.slice(5), count: d.count }))}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* House Risk Map */}
      {houses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">House Risk Map</h3>
            <div className="flex gap-4">
              {[['Low', '#22c55e'], ['Moderate', '#f59e0b'], ['High', '#ef4444']].map(([label, c]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
            <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {houses.map((h) => (
                <Marker key={h.id} position={[h.latitude, h.longitude]} icon={createIcon(riskColor(h.riskLevel))}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{h.address}</p>
                      <p>Risk: <span style={{ color: riskColor(h.riskLevel), fontWeight: 600 }}>{h.riskLevel}</span></p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
