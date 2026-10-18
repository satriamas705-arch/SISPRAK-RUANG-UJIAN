import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Printer,
  Sparkles,
  CheckCircle2,
  Layers,
  Save,
  Download,
} from 'lucide-react';
import { ExamScheduleItem, ExamSettings } from '../types';
import { defaultExamSchedule } from '../utils/sampleData';
import { exportSchedulePdf } from '../utils/exportPdf';

interface ScheduleManagementProps {
  schedules: ExamScheduleItem[];
  settings: ExamSettings;
  onAddSchedule: (item: Omit<ExamScheduleItem, 'id'>) => void;
  onEditSchedule: (item: ExamScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onResetSchedule: () => void;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  schedules,
  settings,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onResetSchedule,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamScheduleItem | null>(null);

  // Form states
  const [formDay, setFormDay] = useState('Senin');
  const [formDate, setFormDate] = useState('20 Oktober 2026');
  const [formTime, setFormTime] = useState('07.30 - 09.30 WIB');
  const [formSubject, setFormSubject] = useState('');
  const [formGrade, setFormGrade] = useState('Semua Kelas');
  const [formRoomNotes, setFormRoomNotes] = useState('Sesi 1');

  const openAddModal = () => {
    setEditingItem(null);
    setFormDay('Senin');
    setFormDate('20 Oktober 2026');
    setFormTime('07.30 - 09.30 WIB');
    setFormSubject('');
    setFormGrade('Semua Kelas');
    setFormRoomNotes('Sesi 1');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExamScheduleItem) => {
    setEditingItem(item);
    setFormDay(item.day);
    setFormDate(item.date);
    setFormTime(item.time);
    setFormSubject(item.subject);
    setFormGrade(item.grade);
    setFormRoomNotes(item.roomNotes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) return;

    if (editingItem) {
      onEditSchedule({
        ...editingItem,
        day: formDay,
        date: formDate.trim(),
        time: formTime.trim(),
        subject: formSubject.trim(),
        grade: formGrade.trim(),
        roomNotes: formRoomNotes.trim() || undefined,
      });
    } else {
      onAddSchedule({
        day: formDay,
        date: formDate.trim(),
        time: formTime.trim(),
        subject: formSubject.trim(),
        grade: formGrade.trim(),
        roomNotes: formRoomNotes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Jadwal Pelaksanaan Ujian
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            <strong className="text-slate-900">{settings.activityName || settings.examTitle}</strong> &middot; Tahun Pelajaran <strong className="text-slate-900 font-mono">{settings.academicYear}</strong> &middot; Jadwal otomatis dicetak pada Kartu Peserta Ujian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportSchedulePdf(schedules, settings)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh PDF Jadwal Resmi</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Layar</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-600">
            Total Mata Pelajaran: <strong className="text-slate-900 font-mono">{schedules.length}</strong> Mapel
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            Tahun Pelajaran: <strong className="text-slate-900 font-mono">{settings.academicYear}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            Nama Kegiatan: <strong className="text-slate-900">{settings.activityName || settings.examTitle}</strong>
          </span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset jadwal ke daftar mata pelajaran standar ujian?')) {
              onResetSchedule();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Muat Jadwal Standar (8 Mapel)</span>
        </button>
      </div>

      {/* Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-32">Hari / Tanggal</th>
                <th className="py-2.5 px-3 w-40">Waktu / Sesi</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3 w-32">Tingkat / Kelas</th>
                <th className="py-2.5 px-3 w-28 text-center">Sesi</th>
                <th className="py-2.5 px-3 text-right pr-4 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Belum ada jadwal ujian.</p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Klik "Tambah Mata Pelajaran" atau "Muat Jadwal Standar" di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                schedules.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{item.day}</span>
                      <span className="text-2xs text-slate-500">{item.date}</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {item.time}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.subject}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {item.grade}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 border border-slate-200 text-slate-800">
                        {item.roomNotes || 'Sesi 1'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Edit Jadwal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSchedule(item.id)}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                          title="Hapus Jadwal"
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

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Mata Pelajaran Ujian' : 'Tambah Jadwal Ujian Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari *
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Contoh: 20 Oktober 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Contoh: Bahasa Indonesia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Waktu / Jam Ujian *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="Contoh: 07.30 - 09.30 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sesi Ujian
                  </label>
                  <input
                    type="text"
                    value={formRoomNotes}
                    onChange={(e) => setFormRoomNotes(e.target.value)}
                    placeholder="Contoh: Sesi 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat / Kelas
                </label>
                <input
                  type="text"
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                  placeholder="Contoh: Semua Kelas / Kelas X"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Jadwal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
