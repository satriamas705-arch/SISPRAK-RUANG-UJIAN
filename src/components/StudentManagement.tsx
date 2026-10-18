import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Student } from '../types';
import { exportStudentTemplateExcel, parseStudentsFromExcel } from '../utils/exportExcel';
import { sampleStudents } from '../utils/sampleData';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onImportStudents: (imported: Student[]) => void;
  onLoadSampleStudents: () => void;
  onClearAllStudents: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onImportStudents,
  onLoadSampleStudents,
  onClearAllStudents,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('X MIPA 1');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');

  const openAddModal = () => {
    setEditingStudent(null);
    setFormNis('');
    setFormNisn('');
    setFormName('');
    setFormClass('X MIPA 1');
    setFormGender('L');
    setIsAddModalOpen(true);
  };

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormNis(st.nis);
    setFormNisn(st.nisn || '');
    setFormName(st.name);
    setFormClass(st.className);
    setFormGender(st.gender);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNis.trim() || !formName.trim()) {
      return;
    }

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        nis: formNis.trim(),
        nisn: formNisn.trim() || undefined,
        name: formName.trim(),
        className: formClass.trim(),
        gender: formGender,
      });
    } else {
      onAddStudent({
        nis: formNis.trim(),
        nisn: formNisn.trim() || undefined,
        name: formName.trim(),
        className: formClass.trim(),
        gender: formGender,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const parsed = await parseStudentsFromExcel(file);
      onImportStudents(parsed);
      setImportSuccess(`Berhasil mengimpor ${parsed.length} siswa dari file Excel!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal membaca file Excel';
      setImportError(errorMsg);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Kelola Master Data Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Tambah manual, impor dari Excel (.xlsx/.csv), atau gunakan template resmi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={exportStudentTemplateExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
            title="Download Template Format Excel untuk Siswa"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Template Excel</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-700" />
            <span>{isImporting ? 'Mengimpor...' : 'Impor Excel / CSV'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{importSuccess}</span>
          </div>
          <button onClick={() => setImportSuccess(null)} className="text-emerald-700 font-bold">
            &times;
          </button>
        </div>
      )}

      {importError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-lg p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{importError}</span>
          </div>
          <button onClick={() => setImportError(null)} className="text-rose-700 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Quick sample bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Total Siswa Terdaftar: <strong className="text-slate-900 font-mono">{students.length}</strong> orang
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSampleStudents}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center gap-1.5"
            title="Muat 80 data siswa sampel untuk 4 kelas"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Muat Data Sampel (80 Siswa)</span>
          </button>

          {students.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Yakin ingin menghapus semua data siswa?')) {
                  onClearAllStudents();
                }
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Semua Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3">NIS</th>
                <th className="py-2.5 px-3">NISN</th>
                <th className="py-2.5 px-3">Nama Lengkap</th>
                <th className="py-2.5 px-3 w-12 text-center">L/P</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3 text-right pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Belum ada data siswa.</p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Klik "Tambah Siswa", "Impor Excel / CSV", atau "Muat Data Sampel" di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                      {student.nis}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">
                      {student.nisn || '-'}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      <span
                        className={`font-semibold ${
                          student.gender === 'L' ? 'text-sky-700' : 'text-rose-700'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {student.className}
                    </td>
                    <td className="py-2 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Edit Siswa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Induk Siswa (NIS) *
                </label>
                <input
                  type="text"
                  required
                  value={formNis}
                  onChange={(e) => setFormNis(e.target.value)}
                  placeholder="Contoh: 240101"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NISN (Opsional)
                </label>
                <input
                  type="text"
                  value={formNisn}
                  onChange={(e) => setFormNisn(e.target.value)}
                  placeholder="Contoh: 0089123401"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nama Lengkap Siswa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas / Rombel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="Contoh: X MIPA 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
