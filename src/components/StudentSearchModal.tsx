import React, { useState } from 'react';
import { Search, MapPin, Armchair, CreditCard, User, Building2, CheckCircle2, Download, Calendar, Printer } from 'lucide-react';
import { Student, Room, ExamSettings, ExamScheduleItem } from '../types';
import { exportSingleStudentCardPdf } from '../utils/exportPdf';

interface StudentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  rooms: Room[];
  settings: ExamSettings;
  schedules?: ExamScheduleItem[];
  initialStudent?: Student | null;
}

export const StudentSearchModal: React.FC<StudentSearchModalProps> = ({
  isOpen,
  onClose,
  students,
  rooms,
  settings,
  schedules = [],
  initialStudent,
}) => {
  const [query, setQuery] = useState(initialStudent?.nis || '');

  if (!isOpen) return null;

  // Find student by NIS or Name
  const matchedStudent = query.trim()
    ? students.find(
        (s) =>
          s.nis.toLowerCase() === query.trim().toLowerCase() ||
          s.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : initialStudent;

  const room = matchedStudent?.roomId
    ? rooms.find((r) => r.id === matchedStudent.roomId)
    : null;

  const handleDownloadCard = () => {
    if (matchedStudent) {
      exportSingleStudentCardPdf(matchedStudent, settings, schedules);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pencarian Lokasi & Kartu Ujian Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ketik Nomor Induk Siswa (NIS) atau nama untuk melihat kartu peserta, ruang, nomor meja, dan jadwal ujian
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-base font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan NIS (contoh: 240105) atau Nama..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 focus:outline-none font-mono"
          />
        </div>

        {/* Search Result */}
        {matchedStudent ? (
          <div className="space-y-4">
            {/* Visual Card */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
              {/* Card Header with Dual Logos */}
              <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white rounded p-1 flex items-center justify-center shrink-0">
                    <img
                      src={settings.logoRightSchool}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase tracking-wider text-slate-300 block">
                      KARTU PESERTA UJIAN RESMI
                    </span>
                    <h3 className="text-sm font-bold truncate text-white">{matchedStudent.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-mono font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 block">
                    NIS: {matchedStudent.nis}
                  </span>
                  <span className="text-3xs text-slate-400 mt-0.5 block">
                    TP {settings.academicYear}
                  </span>
                </div>
              </div>

              {/* Sub-header title */}
              <div className="bg-slate-100 border-b border-slate-200 px-3.5 py-1.5 flex justify-between items-center text-2xs text-slate-700">
                <span className="font-semibold">{settings.activityName || settings.examTitle}</span>
                <span className="font-mono text-slate-500">{matchedStudent.participantNo || 'NO. PESERTA BELUM DISET'}</span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {matchedStudent.roomId ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                        <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider block">
                          RUANG UJIAN
                        </span>
                        <span className="text-lg font-bold text-emerald-950 font-mono mt-0.5 block">
                          {matchedStudent.roomName}
                        </span>
                        <span className="text-2xs text-emerald-700 block mt-0.5 truncate">
                          {room?.building || 'Gedung Sekolah'}
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                        <span className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">
                          NOMOR MEJA / KURSI
                        </span>
                        <span className="text-lg font-bold text-slate-950 font-mono mt-0.5 block">
                          Meja {String(matchedStudent.seatNumber || 1).padStart(2, '0')}
                        </span>
                        <span className="text-2xs text-slate-500 block mt-0.5">
                          {matchedStudent.participantNo}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs pt-1 border-t border-slate-100">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Kelas / Rombel:</span>
                        <span className="font-semibold text-slate-900">{matchedStudent.className}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Jenis Kelamin:</span>
                        <span className="font-medium text-slate-800">{matchedStudent.gender === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Sesi Pelaksanaan:</span>
                        <span className="font-medium text-slate-800">{settings.examSession}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Pengawas Ruang:</span>
                        <span className="font-medium text-slate-800 truncate" title={room?.invigilator1}>
                          {room?.invigilator1 || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Schedule on card */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Jadwal Ujian & Kolom Paraf Pengawas
                        </span>
                        <span className="text-3xs text-slate-400">Wajib diparaf saat ujian berlangsung</span>
                      </div>

                      <div className="border border-slate-200 rounded-md overflow-hidden text-2xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-1 px-2 w-7 text-center">No</th>
                              <th className="py-1 px-2">Mata Pelajaran</th>
                              <th className="py-1 px-2 w-24">Hari & Jam</th>
                              <th className="py-1 px-2 w-20 text-center">TTD Pengawas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {(schedules.length > 0 ? schedules.slice(0, 5) : [
                              { id: '1', day: 'Senin', date: '20 Okt', time: '07.30 - 09.30', subject: 'Bahasa Indonesia' },
                              { id: '2', day: 'Selasa', date: '21 Okt', time: '07.30 - 09.30', subject: 'Matematika Wajib' },
                              { id: '3', day: 'Rabu', date: '22 Okt', time: '07.30 - 09.30', subject: 'Bahasa Inggris' },
                            ]).map((sch, i) => (
                              <tr key={sch.id} className="hover:bg-slate-50">
                                <td className="py-1 px-2 text-center text-slate-400">{i + 1}</td>
                                <td className="py-1 px-2 font-sans font-medium text-slate-900">{sch.subject}</td>
                                <td className="py-1 px-2 text-slate-500 text-3xs">{sch.day}, {sch.time}</td>
                                <td className="py-1 px-2 text-center">
                                  <div className="w-12 h-5 mx-auto border border-dashed border-slate-300 rounded bg-slate-50" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom Signature Box */}
                    <div className="grid grid-cols-2 gap-4 pt-2 text-2xs text-center border-t border-slate-100">
                      <div>
                        <span className="text-slate-500 block">Tanda Tangan Siswa</span>
                        <div className="h-9" />
                        <span className="font-semibold text-slate-900 block border-t border-slate-300 pt-0.5 mx-4">
                          {matchedStudent.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Ketua Panitia Ujian</span>
                        <div className="h-9" />
                        <span className="font-semibold text-slate-900 block border-t border-slate-300 pt-0.5 mx-4">
                          {settings.committeeHead}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-xs text-amber-700 bg-amber-50 rounded-lg border border-amber-200 p-4">
                    <p className="font-bold">Siswa Ditemukan Namun Belum Dialokasikan</p>
                    <p className="text-2xs text-amber-600 mt-1">
                      Silakan hubungi panitia ujian atau jalankan alokasi otomatis di tab Dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : query.trim() ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            Tidak ditemukan siswa dengan NIS atau Nama "{query}".
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Ketik nomor NIS siswa di atas untuk melihat detail ruang, nomor meja, dan jadwal ujian.
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div>
            {matchedStudent && matchedStudent.roomId && (
              <button
                onClick={handleDownloadCard}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh Kartu Ujian (PDF)</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

