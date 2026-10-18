import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  DoorOpen,
  CreditCard,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
} from 'lucide-react';
import { Student, Room, ExamSettings, ExamScheduleItem } from '../types';
import { exportAllocationToExcel, exportStudentTemplateExcel } from '../utils/exportExcel';
import {
  exportAttendancePdfForRoom,
  exportAllRoomsAttendancePdf,
  exportDoorPosterPdf,
  exportExamCardsPdf,
  exportSchedulePdf,
} from '../utils/exportPdf';

interface ExportCenterProps {
  students: Student[];
  rooms: Room[];
  settings: ExamSettings;
  schedules?: ExamScheduleItem[];
}

export const ExportCenter: React.FC<ExportCenterProps> = ({
  students,
  rooms,
  settings,
  schedules = [],
}) => {
  const [selectedRoomForAttendance, setSelectedRoomForAttendance] = useState<string>('ALL');
  const [selectedRoomForDoor, setSelectedRoomForDoor] = useState<string>(rooms[0]?.id || '');
  const [selectedRoomForCards, setSelectedRoomForCards] = useState<string>('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const allocatedCount = students.filter((s) => s.roomId).length;
  const isAllocated = allocatedCount > 0;

  const showSuccess = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Handlers
  const handleExportExcel = () => {
    try {
      exportAllocationToExcel(students, rooms, settings);
      showSuccess('File Excel (.xlsx) berhasil diunduh dengan lembar Rekapitulasi & Per-Ruangan!');
    } catch (e: unknown) {
      alert('Gagal mengekspor Excel: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleExportAttendancePdf = () => {
    try {
      if (selectedRoomForAttendance === 'ALL') {
        exportAllRoomsAttendancePdf(rooms, students, settings);
        showSuccess('File PDF Daftar Hadir seluruh ruangan berhasil digabung dan diunduh!');
      } else {
        const targetRoom = rooms.find((r) => r.id === selectedRoomForAttendance);
        if (targetRoom) {
          exportAttendancePdfForRoom(targetRoom, students, settings);
          showSuccess(`Daftar Hadir PDF untuk ${targetRoom.name} berhasil diunduh!`);
        }
      }
    } catch (e: unknown) {
      alert('Gagal mengekspor PDF: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleExportDoorPosterPdf = () => {
    try {
      const targetRoom = rooms.find((r) => r.id === selectedRoomForDoor);
      if (targetRoom) {
        exportDoorPosterPdf(targetRoom, students, settings);
        showSuccess(`Tempelan Pintu PDF untuk ${targetRoom.name} berhasil diunduh!`);
      }
    } catch (e: unknown) {
      alert('Gagal mengekspor PDF: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleExportCardsPdf = () => {
    try {
      const roomId = selectedRoomForCards === 'ALL' ? undefined : selectedRoomForCards;
      exportExamCardsPdf(students, settings, schedules, roomId);
      showSuccess('Kartu Peserta Ujian lengkap dengan jadwal & tanda tangan pengawas berhasil diunduh!');
    } catch (e: unknown) {
      alert('Gagal mengekspor Kartu Peserta: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleExportSchedulePdf = () => {
    try {
      exportSchedulePdf(schedules, settings);
      showSuccess('Jadwal Pelaksanaan Ujian resmi berhasil diunduh dalam format PDF!');
    } catch (e: unknown) {
      alert('Gagal mengekspor Jadwal PDF: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pusat Ekspor & Pencetakan Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Unduh laporan rekapitulasi, daftar hadir resmi, kartu ujian, dan tempelan pintu dalam format Excel dan PDF
          </p>
        </div>

        <button
          onClick={handleBrowserPrint}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Cetak Halaman Ini</span>
        </button>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {!isAllocated && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">Perhatian: Siswa belum dialokasikan ke ruangan!</p>
            <p className="mt-0.5 text-xs text-amber-800">
              Silakan jalankan fitur "Pembagian Otomatis" di tab Dashboard terlebih dahulu agar nomor kursi, ruang, dan nomor peserta terisi sebelum melakukan ekspor.
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXCEL EXPORT SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Ekspor Format Excel (.xlsx)</h2>
                <p className="text-xs text-slate-500">
                  Workbook lengkap multi-sheet untuk pengolahan data panitia
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">File Excel mencakup lembar kerja:</p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>
                  <strong className="text-slate-800">Sheet Rekapitulasi:</strong> Ringkasan daya tampung, keterisian, rentang NIS, & nama pengawas.
                </li>
                <li>
                  <strong className="text-slate-800">Sheet Master Data:</strong> Seluruh {students.length} siswa dengan nomor peserta dan ruangan.
                </li>
                <li>
                  <strong className="text-slate-800">Sheet Tiap Ruangan ({rooms.length} Sheet):</strong> Daftar hadir per ruang dilengkapi format kolom tanda tangan.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={exportStudentTemplateExcel}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
            >
              Unduh Template Siswa
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel Lengkap (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* PDF ATTENDANCE LIST SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Daftar Hadir Ujian (PDF)</h2>
                <p className="text-xs text-slate-500">
                  Format resmi berita acara & tanda tangan pengawas ruangan
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Ruangan yang Diekspor:
                </label>
                <select
                  value={selectedRoomForAttendance}
                  onChange={(e) => setSelectedRoomForAttendance(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                >
                  <option value="ALL">Semua Ruangan (Digabung Jadi 1 File PDF)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) - {r.building}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-slate-600">
                Dilengkapi kop sekolah resmi ({settings.schoolName}), nomor kursi urut, kolom paraf bersilang (1... 2...), serta kolom tanda tangan Pengawas 1 dan Pengawas 2.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleExportAttendancePdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Daftar Hadir PDF</span>
            </button>
          </div>
        </div>

        {/* PDF DOOR POSTER SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Tempelan Pintu Ruang (PDF)</h2>
                <p className="text-xs text-slate-500">
                  Daftar peserta untuk ditempel di depan pintu masuk ruangan ujian
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Ruang Ujian:
                </label>
                <select
                  value={selectedRoomForDoor}
                  onChange={(e) => setSelectedRoomForDoor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) - {r.building}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-slate-600">
                Ukuran teks besar dan kontras tinggi memudahkan siswa memeriksa nomor kursi, nomor peserta, dan nama dari luar ruangan sebelum memasuki kelas.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleExportDoorPosterPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Tempelan Pintu PDF</span>
            </button>
          </div>
        </div>

        {/* PDF STUDENT EXAM CARDS SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Kartu Peserta Ujian (PDF)</h2>
                <p className="text-xs text-slate-500">
                  Kartu resmi per siswa siap potong (4 kartu per lembar kertas A4)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cetak Untuk:
                </label>
                <select
                  value={selectedRoomForCards}
                  onChange={(e) => setSelectedRoomForCards(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                >
                  <option value="ALL">Seluruh Siswa Teralokasi ({allocatedCount} Kartu)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Hanya {r.name} ({students.filter((s) => s.roomId === r.id).length} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-slate-600">
                Dilengkapi identitas lengkap siswa (NIS/NISN, nama, kelas, ruang & nomor meja), jadwal mata pelajaran lengkap dengan <strong>kolom paraf pengawas ruang</strong>, pas foto 2x3, tanda tangan panitia, dan batas gunting resmi.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleExportCardsPdf}
              disabled={!isAllocated}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Kartu Peserta PDF</span>
            </button>
          </div>
        </div>

        {/* PDF EXAM SCHEDULE SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Jadwal Pelaksanaan Ujian (PDF)</h2>
                <p className="text-xs text-slate-500">
                  Dokumen resmi jadwal ujian dengan Kop Surat, dual logo, dan pengesahan
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-slate-600 space-y-1">
                <p>
                  Memuat seluruh daftar <strong className="text-slate-900">{schedules.length} mata pelajaran</strong>, hari/tanggal, jam/sesi ujian, dan kolom tanda tangan resmi Kepala Sekolah serta Ketua Panitia Ujian.
                </p>
                <p className="text-2xs text-slate-500 font-mono">
                  {settings.activityName || settings.examTitle} &middot; TP {settings.academicYear}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleExportSchedulePdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Jadwal Ujian PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
