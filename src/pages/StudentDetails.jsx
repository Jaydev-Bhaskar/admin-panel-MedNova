import { useState, useEffect } from 'react';
import { getStudents, resetStudentPassword } from '../services/api';
import { Users, Search, RotateCcw, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function StudentDetails() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [resetting, setResetting] = useState(null);

  const fetchStudents = async () => {
    setLoading(true); setError('');
    try {
      const res = await getStudents();
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleReset = async (studentId) => {
    if (!confirm(`Reset password for ${studentId}? New password will be their Student ID.`)) return;
    setResetting(studentId);
    try {
      await resetStudentPassword(studentId);
      alert(`Password for ${studentId} has been reset to their Student ID.`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(null);
    }
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
          <p className="text-gray-500 text-sm">{students.length} students registered</p>
        </div>
        <button onClick={fetchStudents} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={20} className="text-gray-500" /></button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          placeholder="Search by name, ID, or email..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Password</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No students found</td></tr>
              ) : filtered.map((s) => (
                <tr key={s._id || s.studentId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{s.studentId}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-600">
                        {showPasswords[s.studentId] ? (s.plainPassword || s.studentId) : '••••••'}
                      </span>
                      <button onClick={() => togglePassword(s.studentId)} className="text-gray-400 hover:text-gray-600">
                        {showPasswords[s.studentId] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleReset(s.studentId)}
                      disabled={resetting === s.studentId}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={12} />
                      {resetting === s.studentId ? 'Resetting...' : 'Reset'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
