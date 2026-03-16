import { useState, useEffect } from 'react';
import { getDashboard, runClustering } from '../services/api';
import { Brain, Users, Home, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Clustering() {
  const [stats, setStats] = useState({ totalStudents: 0, totalHouses: 0 });
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRun = async () => {
    setRunning(true); setResult(null); setError('');
    try {
      const res = await runClustering();
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Clustering failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Smart House Assignment</h2>
      <p className="text-gray-500 text-sm mb-6">
        Uses ML-powered geographical clustering to optimally assign houses to students based on proximity.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg"><Users size={24} className="text-emerald-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalStudents}</p>
            <p className="text-sm text-gray-500">Students</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Home size={24} className="text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalHouses}</p>
            <p className="text-sm text-gray-500">Houses</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-violet-800 mb-2 flex items-center gap-2"><Brain size={18} />How it works</h3>
        <ul className="text-sm text-violet-700 space-y-1 list-disc list-inside">
          <li>Groups nearby houses into clusters using KMeans algorithm</li>
          <li>Assigns each student a geographically balanced set of houses</li>
          <li>Each student gets approximately 5 houses to visit</li>
          <li>Minimizes travel distance for field visits</li>
        </ul>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={running || stats.totalStudents === 0 || stats.totalHouses === 0}
        className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        {running ? (
          <><Loader2 size={20} className="animate-spin" /> Running Smart Assignment...</>
        ) : (
          <><Brain size={20} /> Run Smart Assignment</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={20} className="text-emerald-500" />
            <p className="font-semibold text-emerald-800">{result.message}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xl font-bold text-emerald-600">{result.studentsAssigned || 0}</p>
              <p className="text-xs text-gray-500">Students Assigned</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xl font-bold text-blue-600">{result.housesAssigned || result.assignments || 0}</p>
              <p className="text-xs text-gray-500">Houses Assigned</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xl font-bold text-violet-600">{result.totalClusters || 0}</p>
              <p className="text-xs text-gray-500">Clusters</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
