import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, UserCheck, AlertCircle, Eye } from 'lucide-react';
import { Student, Room, ExamSettings, ExamScheduleItem } from '../types';
import { exportSingleStudentCardPdf } from '../utils/exportPdf';

interface StudentListTableProps {
  students: Student[];
  rooms: Room[];
  settings: ExamSettings;
  schedules?: ExamScheduleItem[];
  onViewStudentCard: (student: Student) => void;
}

export const StudentListTable: React.FC<StudentListTableProps> = ({
  students,
  rooms,
  settings,
  schedules = [],
  onViewStudentCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALLOCATED' | 'UNALLOCATED'>('ALL');

  // Unique classes for filter dropdown
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className));
    return Array.from(set).sort();
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesNis = s.nis.toLowerCase().includes(query);
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesParticipant = s.participantNo?.toLowerCase().includes(query);
        if (!matchesNis && !matchesName && !matchesParticipant) return false;
      }

      // Room filter
      if (selectedRoomFilter !== 'ALL' && s.roomId !== selectedRoomFilter) {
        return false;
      }

      // Class filter
      if (selectedClassFilter !== 'ALL' && s.className !== selectedClassFilter) {
        return false;
      }

      // Allocation status
      if (statusFilter === 'ALLOCATED' && !s.roomId) return false;
      if (statusFilter === 'UNALLOCATED' && s.roomId) return false;

      return true;
    });
  }, [students, searchTerm, selectedRoomFilter, selectedClassFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daftar Peserta Ujian
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            <strong className="text-slate-900">{settings.activityName || settings.examTitle}</strong> &middot; Tahun Pelajaran <strong className="text-slate-900 font-mono">{settings.academicYear}</strong> &middot; Alokasi tempat duduk dan nomor peserta
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Menampilkan <span className="font-bold text-slate-900">{filteredStudents.length}</span> dari{' '}
          <span className="font-bold text-slate-900">{students.length}</span> siswa
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan NIS, Nama, atau No. Peserta..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-slate-900 focus:outline-none"
          />
        </div>

        {/* Room Filter Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 whitespace-nowrap">Ruang:</span>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Semua Ruang</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 whitespace-nowrap">Kelas:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Semua Kelas</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ALLOCATED' | 'UNALLOCATED')}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="ALLOCATED">Sudah Dialokasikan</option>
            <option value="UNALLOCATED">Belum Dialokasikan</option>
          </select>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3">No. Peserta</th>
                <th className="py-2.5 px-3">NIS</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3 w-12 text-center">L/P</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Ruang Ujian</th>
                <th className="py-2.5 px-3 text-center">No. Meja</th>
                <th className="py-2.5 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Tidak ditemukan data siswa yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-slate-500 font-mono tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="py-2 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {student.participantNo ? (
                        <span className="text-slate-900">{student.participantNo}</span>
                      ) : (
                        <span className="text-amber-600 font-sans text-2xs italic font-normal">
                          Belum Dialokasi
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {student.nis}
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

                    <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                      {student.className}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      {student.roomName ? (
                        <span className="font-semibold text-slate-800">
                          {student.roomName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-center font-mono tabular-nums whitespace-nowrap">
                      {student.seatNumber ? (
                        <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">
                          Meja {String(student.seatNumber).padStart(2, '0')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewStudentCard(student)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Lihat Kartu Peserta Ujian"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleStudentCardPdf(student, settings, schedules)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Unduh PDF Kartu Ujian Siswa Ini"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
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
    </div>
  );
};
