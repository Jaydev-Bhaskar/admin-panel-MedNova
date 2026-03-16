import { useState } from 'react';
import { uploadStudents } from '../services/api';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadStudents() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
      },
      error: () => setError('Failed to parse CSV file'),
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(''); setResult(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const students = results.data.map((row) => ({
            name: row.name || row.Name,
            studentId: row.studentId || row.student_id || row.StudentID || row.id || row.ID,
            email: row.email || row.Email || '',
          })).filter(s => s.name && s.studentId);

          const res = await uploadStudents(students);
          setResult(res.data);
          setFile(null);
          setPreview([]);
        } catch (err) {
          setError(err.response?.data?.message || 'Upload failed');
        } finally {
          setUploading(false);
        }
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Students</h2>
      <p className="text-gray-500 text-sm mb-6">Upload a CSV file with student data. New students will be created with their Student ID as default password.</p>

      {/* Format info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-blue-800 mb-2">CSV Format</p>
        <code className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">name,studentId,email</code>
        <p className="text-xs text-blue-600 mt-1">Email is optional. Existing Student IDs will be skipped.</p>
      </div>

      {/* Dropzone */}
      <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-colors mb-4">
        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        <FileSpreadsheet size={40} className="mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 font-medium">
          {file ? file.name : 'Click to select CSV file'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Only .csv files are supported</p>
      </label>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-x-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">Preview (first 5 rows)</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {Object.keys(preview[0]).map(k => (
                  <th key={k} className="text-left px-2 py-1 text-gray-500">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="px-2 py-1 text-gray-700">{String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
      >
        <Upload size={18} />
        {uploading ? 'Uploading...' : 'Upload Students'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <CheckCircle size={20} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-emerald-800">{result.message}</p>
            {result.created !== undefined && <p className="text-sm text-emerald-600">Created: {result.created}, Skipped: {result.skipped || 0}</p>}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
