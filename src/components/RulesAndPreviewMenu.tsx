import React, { useState, useRef } from 'react';
import {
  Sliders,
  Building,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  DoorOpen,
  LayoutGrid,
  FileText,
  Armchair,
  Save,
  Building2,
  Users,
  Info,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { Student, Room, ExamSettings, ExamScheduleItem } from '../types';
import { DEFAULT_PEMDA_LOGO, DEFAULT_SCHOOL_LOGO } from '../utils/defaultLogos';
import {
  exportAttendancePdfForRoom,
  exportDoorPosterPdf,
  exportExamCardsPdf,
  exportSingleStudentCardPdf,
} from '../utils/exportPdf';
import { exportAllocationToExcel } from '../utils/exportExcel';

interface RulesAndPreviewMenuProps {
  settings: ExamSettings;
  rooms: Room[];
  students: Student[];
  schedules?: ExamScheduleItem[];
  onUpdateSettings: (newSettings: ExamSettings) => void;
  onUpdateRooms: (newRooms: Room[]) => void;
}

export const RulesAndPreviewMenu: React.FC<RulesAndPreviewMenuProps> = ({
  settings,
  rooms,
  students,
  schedules = [],
  onUpdateSettings,
  onUpdateRooms,
}) => {
  // Sub-tabs in Menu Aturan
  const [subTab, setSubTab] = useState<'rules-chairs' | 'rules-kop' | 'preview'>('preview');

  // Preview sub-options
  const [previewDocType, setPreviewDocType] = useState<'door' | 'seating' | 'attendance' | 'card'>('door');
  const [selectedPreviewRoomId, setSelectedPreviewRoomId] = useState<string>(rooms[0]?.id || '');
  const [selectedPreviewStudentId, setSelectedPreviewStudentId] = useState<string>(students[0]?.id || '');
  const [previewZoom, setPreviewZoom] = useState<'fit' | '100%'>('fit');

  // Form states for Kop & Rules
  const [formData, setFormData] = useState<ExamSettings>({ ...settings });
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // File upload refs
  const fileInputPemdaRef = useRef<HTMLInputElement>(null);
  const fileInputSchoolRef = useRef<HTMLInputElement>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedPreviewRoomId) || rooms[0];
  const roomStudents = selectedRoom
    ? students
        .filter((s) => s.roomId === selectedRoom.id)
        .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0))
    : [];

  const selectedStudent =
    students.find((s) => s.id === selectedPreviewStudentId) ||
    roomStudents[0] ||
    students[0];

  const showFeedback = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSettings(formData);
    showFeedback('Pengaturan aturan & identitas kop surat berhasil disimpan!');
  };

  // Chair rules: Apply uniform capacity to all rooms
  const handleApplyUniformCapacity = () => {
    const updatedRooms = rooms.map((r) => ({
      ...r,
      capacity: formData.defaultRoomCapacity,
      columns: formData.defaultRoomColumns,
    }));
    onUpdateRooms(updatedRooms);
    onUpdateSettings({
      ...formData,
      uniformCapacityMode: true,
    });
    showFeedback(
      `Aturan berhasil diterapkan! Seluruh ${rooms.length} ruangan kini berkapasitas ${formData.defaultRoomCapacity} kursi (${formData.defaultRoomColumns} kolom).`
    );
  };

  // Image Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'pemda' | 'school') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (target === 'pemda') {
          setFormData((prev) => ({ ...prev, logoLeftPemda: result }));
          onUpdateSettings({ ...settings, logoLeftPemda: result });
          showFeedback('Logo Kiri (Pemda) berhasil diunggah!');
        } else {
          setFormData((prev) => ({ ...prev, logoRightSchool: result }));
          onUpdateSettings({ ...settings, logoRightSchool: result });
          showFeedback('Logo Kanan (Sekolah) berhasil diunggah!');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Menu Aturan & Pratinjau Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Konfigurasi aturan kapasitas kursi, identitas kop surat (dua logo), dan pratinjau langsung dokumen resmi
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setSubTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              subTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tampilan / Preview Dokumen</span>
          </button>

          <button
            onClick={() => setSubTab('rules-chairs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              subTab === 'rules-chairs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>Aturan Kursi Ruang</span>
          </button>

          <button
            onClick={() => setSubTab('rules-kop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              subTab === 'rules-kop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Kop & Logo Sekolah</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {savedFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. ATURAN JUMLAH KURSI TIAP RUANG                        */}
      {/* ======================================================== */}
      {subTab === 'rules-chairs' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Aturan & Standar Jumlah Kursi Tiap Ruangan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standarisasi kapasitas tempat duduk, jumlah kolom meja, dan batas maksimal peserta per ruangan ujian
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Kapasitas Standar per Ruang
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.defaultRoomCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultRoomCapacity: parseInt(e.target.value, 10) || 20,
                      })
                    }
                    className="w-24 px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600">kursi / ruang</span>
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  Standar POS Ujian umumnya menetapkan 20 s/d 24 kursi per ruang agar jarak antar siswa terjaga.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Jumlah Kolom Tata Letak Meja
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={formData.defaultRoomColumns}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultRoomColumns: parseInt(e.target.value, 10) || 4,
                      })
                    }
                    className="w-24 px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600">kolom meja</span>
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  Format 4 kolom (4 x 6 baris) atau 5 kolom (5 x 5 baris) memudahkan pengawas memantau seluruh baris.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Batas Maksimal Kursi per Ruang
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={formData.maxSeatRule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSeatRule: parseInt(e.target.value, 10) || 30,
                      })
                    }
                    className="w-24 px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600">maksimal kursi</span>
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  Peringatan otomatis jika panitia memasukkan kapasitas melebihi ambang batas ini.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2 text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Terapkan Serentak ke Semua Ruangan</span>
                  <p className="text-2xs text-amber-800 mt-0.5">
                    Klik tombol di samping untuk menyamakan kapasitas seluruh {rooms.length} ruang menjadi {formData.defaultRoomCapacity} kursi & {formData.defaultRoomColumns} kolom.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyUniformCapacity}
                className="px-4 py-2 font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-md whitespace-nowrap shadow-xs transition-colors shrink-0"
              >
                Terapkan ke Semua Ruang
              </button>
            </div>

            {/* Current Rooms Configuration Table */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Konfigurasi Kursi Saat Ini per Ruangan ({rooms.length} Ruangan)
              </h3>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Kode</th>
                      <th className="py-2 px-3">Nama Ruang</th>
                      <th className="py-2 px-3">Lokasi / Gedung</th>
                      <th className="py-2 px-3 text-center">Kapasitas Kursi</th>
                      <th className="py-2 px-3 text-center">Jumlah Kolom</th>
                      <th className="py-2 px-3 text-center">Tata Letak (Baris x Kolom)</th>
                      <th className="py-2 px-3 text-center">Status Aturan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rooms.map((room) => {
                      const rows = Math.ceil(room.capacity / room.columns);
                      const isOverMax = room.capacity > formData.maxSeatRule;

                      return (
                        <tr key={room.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">
                            {room.code}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">{room.name}</td>
                          <td className="py-2 px-3 text-slate-600">{room.building}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                            {room.capacity}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">
                            {room.columns} Kolom
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600">
                            {rows} baris &times; {room.columns} kolom
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isOverMax ? (
                              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Melebihi Batas POS
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Sesuai Standar
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Aturan Kursi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ATURAN IDENTITAS SEKOLAH UNTUK KOP (DUAL LOGO)        */}
      {/* ======================================================== */}
      {subTab === 'rules-kop' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Aturan Identitas Sekolah & Desain Kop Surat Resmi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi kop surat resmi berlogo ganda: <strong>Logo Kiri (Pemda/Dinas)</strong> dan{' '}
                <strong>Logo Kanan (Sekolah)</strong>
              </p>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputPemdaRef}
              onChange={(e) => handleLogoUpload(e, 'pemda')}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputSchoolRef}
              onChange={(e) => handleLogoUpload(e, 'school')}
              accept="image/*"
              className="hidden"
            />

            {/* Dual Logo Upload Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Left Logo: PEMDA */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900">
                      1. LOGO KIRI (PEMERINTAH DAERAH / DINAS)
                    </span>
                    <span className="text-2xs font-mono text-slate-500">Posisi: Kiri Kop</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-slate-300 bg-white p-2 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={formData.logoLeftPemda || DEFAULT_PEMDA_LOGO}
                        alt="Logo Pemda"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-slate-800">Logo Pemda / Yayasan</p>
                      <p className="text-2xs text-slate-500">
                        Lambang Pemerintah Provinsi / Kabupaten / Dinas Pendidikan / Kemenag.
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => fileInputPemdaRef.current?.click()}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-800 transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Ganti Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, logoLeftPemda: DEFAULT_PEMDA_LOGO }));
                            showFeedback('Logo Kiri dikembalikan ke default Pemda.');
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-transparent rounded transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Logo: SEKOLAH */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900">
                      2. LOGO KANAN (LOGO SATUAN PENDIDIKAN / SEKOLAH)
                    </span>
                    <span className="text-2xs font-mono text-slate-500">Posisi: Kanan Kop</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-slate-300 bg-white p-2 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={formData.logoRightSchool || DEFAULT_SCHOOL_LOGO}
                        alt="Logo Sekolah"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-slate-800">Logo Resmi Sekolah</p>
                      <p className="text-2xs text-slate-500">
                        Lambang Tut Wuri Handayani atau Logo resmi SMA/SMK/SMP bersangkutan.
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => fileInputSchoolRef.current?.click()}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-800 transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Ganti Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, logoRightSchool: DEFAULT_SCHOOL_LOGO }));
                            showFeedback('Logo Kanan dikembalikan ke default Sekolah.');
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-transparent rounded transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* School Text Details */}
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs pt-3 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Pemerintah Daerah / Yayasan (Baris 1 Kop)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.governmentName}
                    onChange={(e) => setFormData({ ...formData, governmentName: e.target.value.toUpperCase() })}
                    placeholder="Contoh: PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none uppercase font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Dinas / Instansi Induk (Baris 2 Kop)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.educationDept}
                    onChange={(e) => setFormData({ ...formData, educationDept: e.target.value.toUpperCase() })}
                    placeholder="Contoh: DINAS PENDIDIKAN DAN KEBUDAYAAN"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none uppercase font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Kegiatan Ujian / Asesmen *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activityName || formData.examTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activityName: e.target.value,
                        examTitle: e.target.value,
                      })
                    }
                    placeholder="Contoh: Penilaian Akhir Semester (PAS) Ganjil"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Pelajaran (TP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan / Sekolah (Baris 3 Utama Tebal)
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value.toUpperCase() })}
                  placeholder="Contoh: SMA NEGERI 1 TELADAN NUSANTARA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none font-bold uppercase text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah (Baris 4 Kop)
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolAddress}
                  onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  placeholder="Contoh: Jl. Pemuda Pendidikan No. 45, Gambir, Jakarta Pusat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Telepon</label>
                  <input
                    type="text"
                    value={formData.schoolPhone}
                    onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                    placeholder="(021) 3840192"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.schoolEmail}
                    onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
                    placeholder="info@sman1teladan.sch.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.schoolWebsite}
                    onChange={(e) => setFormData({ ...formData, schoolWebsite: e.target.value })}
                    placeholder="www.sman1teladan.sch.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="10110"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW OF KOP SURAT */}
              <div className="pt-4">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Pratinjau Hasil Desain Kop Surat Resmi (Garis Ganda & Dua Logo)
                </span>

                <div className="bg-white border border-slate-300 p-6 rounded-lg shadow-xs">
                  <div className="flex items-center justify-between gap-4 pb-3">
                    {/* Left: Pemda Logo */}
                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                      <img
                        src={formData.logoLeftPemda || DEFAULT_PEMDA_LOGO}
                        alt="Logo Pemda"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Center: Kop Typography */}
                    <div className="flex-1 text-center space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900 tracking-wider">
                        {formData.governmentName || 'PEMERINTAH DAERAH'}
                      </p>
                      <p className="text-xs font-bold text-slate-800 tracking-wider">
                        {formData.educationDept || 'DINAS PENDIDIKAN'}
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight font-serif uppercase">
                        {formData.schoolName || 'NAMA SATUAN PENDIDIKAN'}
                      </h3>
                      <p className="text-2xs text-slate-600">
                        {formData.schoolAddress}
                        {formData.schoolPhone ? ` | Telp: ${formData.schoolPhone}` : ''}
                        {formData.postalCode ? ` Kode Pos ${formData.postalCode}` : ''}
                      </p>
                      <p className="text-2xs text-slate-500 font-mono">
                        {formData.schoolEmail ? `Email: ${formData.schoolEmail}` : ''}
                        {formData.schoolWebsite ? ` | Website: ${formData.schoolWebsite}` : ''}
                      </p>
                    </div>

                    {/* Right: School Logo */}
                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                      <img
                        src={formData.logoRightSchool || DEFAULT_SCHOOL_LOGO}
                        alt="Logo Sekolah"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Official Double Border Line Divider */}
                  <div className="w-full border-b-[3px] border-b-black border-double pt-1" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Identitas Kop Surat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAMPILAN / PREVIEW DOKUMEN RESMI (A4 PAPER VIEW)      */}
      {/* ======================================================== */}
      {subTab === 'preview' && (
        <div className="space-y-4">
          {/* Document Type Switcher Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Pilih Dokumen:</span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
                <button
                  onClick={() => setPreviewDocType('door')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    previewDocType === 'door'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DoorOpen className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tempelan Pintu</span>
                </button>

                <button
                  onClick={() => setPreviewDocType('seating')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    previewDocType === 'seating'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                  <span>Denah Tempat Duduk</span>
                </button>

                <button
                  onClick={() => setPreviewDocType('attendance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    previewDocType === 'attendance'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Daftar Hadir Ujian</span>
                </button>

                <button
                  onClick={() => setPreviewDocType('card')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    previewDocType === 'card'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kartu Peserta Ujian</span>
                </button>
              </div>
            </div>

            {/* Dynamic Selector: Student if 'card', Room if others */}
            <div className="flex flex-wrap items-center gap-2">
              {previewDocType === 'card' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Pilih Siswa:</span>
                  <select
                    value={selectedPreviewStudentId}
                    onChange={(e) => setSelectedPreviewStudentId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none max-w-[210px] truncate"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nis} - {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Pilih Ruangan:</span>
                  <select
                    value={selectedPreviewRoomId}
                    onChange={(e) => setSelectedPreviewRoomId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code}) - {r.capacity} Kursi
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={() => {
                  if (previewDocType === 'door' && selectedRoom) exportDoorPosterPdf(selectedRoom, students, settings);
                  if (previewDocType === 'attendance' && selectedRoom) exportAttendancePdfForRoom(selectedRoom, students, settings);
                  if (previewDocType === 'seating') window.print();
                  if (previewDocType === 'card') {
                    if (selectedStudent) {
                      exportSingleStudentCardPdf(selectedStudent, settings, schedules);
                    } else {
                      exportExamCardsPdf(students, settings, schedules);
                    }
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
                title="Unduh PDF Resmi Dokumen Ini"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{previewDocType === 'card' ? 'Unduh Kartu PDF' : 'Unduh PDF'}</span>
              </button>

              {previewDocType === 'card' && (
                <button
                  onClick={() => exportExamCardsPdf(students, settings, schedules)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
                  title="Unduh Seluruh Kartu Siswa"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Semua Siswa</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
                title="Cetak via Browser"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>

          {/* REALISTIC A4 SHEET VIEWPORT */}
          <div className="bg-slate-200/70 p-4 sm:p-8 rounded-xl overflow-x-auto flex justify-center">
            <div className="bg-white shadow-xl border border-slate-300 max-w-[850px] w-full min-h-[1100px] p-8 sm:p-12 text-slate-900 font-sans">
              {/* --- KOP SURAT RESMI BERSAMA DUA LOGO (Untuk Dokumen Pintu, Denah, dan Absensi) --- */}
              {previewDocType !== 'card' && (
                <>
                  <div className="flex items-center justify-between gap-4 pb-3">
                    {/* Logo Kiri: Pemda */}
                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                      <img
                        src={settings.logoLeftPemda || DEFAULT_PEMDA_LOGO}
                        alt="Logo Pemda"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Kop Text */}
                    <div className="flex-1 text-center space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 tracking-widest uppercase">
                        {settings.governmentName}
                      </p>
                      <p className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                        {settings.educationDept}
                      </p>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-serif tracking-tight uppercase">
                        {settings.schoolName}
                      </h2>
                      <p className="text-2xs text-slate-600">
                        {settings.schoolAddress}
                        {settings.schoolPhone ? ` | Telp: ${settings.schoolPhone}` : ''}
                        {settings.postalCode ? ` Kode Pos ${settings.postalCode}` : ''}
                      </p>
                      <p className="text-2xs text-slate-500 font-mono">
                        {settings.schoolEmail ? `Email: ${settings.schoolEmail}` : ''}
                        {settings.schoolWebsite ? ` | Website: ${settings.schoolWebsite}` : ''}
                      </p>
                    </div>

                    {/* Logo Kanan: Sekolah */}
                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                      <img
                        src={settings.logoRightSchool || DEFAULT_SCHOOL_LOGO}
                        alt="Logo Sekolah"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Double Line Border */}
                  <div className="w-full border-b-[3px] border-b-black border-double mb-5" />
                </>
              )}

              {/* ======================================================== */}
              {/* DOC 1 PREVIEW: TEMPELAN PINTU RUANG UJIAN                */}
              {/* ======================================================== */}
              {previewDocType === 'door' && (
                <div className="space-y-4">
                  {/* Big Room Header Title */}
                  <div className="bg-slate-900 text-white p-4 rounded-md text-center space-y-1">
                    <span className="text-2xs uppercase tracking-widest text-slate-300 font-mono">
                      DAFTAR TEMPELAN PINTU RUANG UJIAN
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {selectedRoom?.name.toUpperCase()} ({selectedRoom?.code})
                    </h1>
                    <p className="text-xs text-slate-300">
                      {settings.examTitle} &middot; Tahun Ajaran {settings.academicYear}
                    </p>
                  </div>

                  {/* Room Info Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-100 p-3 rounded-md border border-slate-200">
                    <div>
                      <span className="text-2xs text-slate-500 block">LOKASI / GEDUNG</span>
                      <strong className="text-slate-900">{selectedRoom?.building}</strong>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-500 block">ATURAN KAPASITAS</span>
                      <strong className="text-slate-900 font-mono">
                        {roomStudents.length} / {selectedRoom?.capacity} Kursi Terisi
                      </strong>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-500 block">RENTANG NIS</span>
                      <strong className="text-slate-900 font-mono">
                        {roomStudents.length > 0
                          ? `${roomStudents[0].nis} - ${roomStudents[roomStudents.length - 1].nis}`
                          : '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-500 block">SESI UJIAN</span>
                      <strong className="text-slate-900">{settings.examSession}</strong>
                    </div>
                  </div>

                  {/* Notice Box for Students */}
                  <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-2xs text-amber-900">
                    <strong>Pemberitahuan Peserta:</strong> Denah di bawah mengikuti aturan kapasitas {selectedRoom?.capacity} meja ({selectedRoom?.columns} kolom). Pastikan Anda duduk di nomor meja yang sesuai dengan NIS dan Nomor Peserta. Harap siapkan Kartu Tanda Peserta sebelum memasuki ruangan.
                  </div>

                  {/* Table of Students conforming to Chair Rules */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800 text-white font-semibold">
                        <tr>
                          <th className="py-2 px-3 text-center w-20">No Meja</th>
                          <th className="py-2 px-3">No. Peserta</th>
                          <th className="py-2 px-3">NIS</th>
                          <th className="py-2 px-3">Nama Lengkap Siswa</th>
                          <th className="py-2 px-3">Kelas</th>
                          <th className="py-2 px-3 text-center w-12">L/P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Array.from({ length: selectedRoom?.capacity || 24 }).map((_, idx) => {
                          const seatNo = idx + 1;
                          const st = roomStudents.find((s) => s.seatNumber === seatNo);

                          if (st) {
                            return (
                              <tr key={seatNo} className="hover:bg-slate-50">
                                <td className="py-1.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-100">
                                  Meja {String(seatNo).padStart(2, '0')}
                                </td>
                                <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                                  {st.participantNo}
                                </td>
                                <td className="py-1.5 px-3 font-mono text-slate-700">
                                  {st.nis}
                                </td>
                                <td className="py-1.5 px-3 font-semibold text-slate-900">
                                  {st.name}
                                </td>
                                <td className="py-1.5 px-3 text-slate-700">
                                  {st.className}
                                </td>
                                <td className="py-1.5 px-3 text-center font-mono font-semibold">
                                  {st.gender}
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={seatNo} className="bg-slate-50/50 text-slate-400">
                              <td className="py-1.5 px-3 text-center font-mono text-slate-400">
                                Meja {String(seatNo).padStart(2, '0')}
                              </td>
                              <td className="py-1.5 px-3 font-mono">-</td>
                              <td className="py-1.5 px-3 font-mono">-</td>
                              <td className="py-1.5 px-3 italic text-slate-500 font-medium">
                                [ KURSI KOSONG / TERSEDIA ]
                              </td>
                              <td className="py-1.5 px-3">-</td>
                              <td className="py-1.5 px-3 text-center">-</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer note */}
                  <div className="pt-4 flex justify-between items-end text-xs text-slate-600 border-t border-slate-200">
                    <div>
                      <span>Dicetak dari Sistem Administrasi Ujian Resmi</span>
                      <p className="text-2xs text-slate-400">Harap ditempel di daun pintu masuk ruang ujian.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{settings.schoolName}</p>
                      <p className="text-2xs">Panitia Penyelenggara Ujian</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* DOC 2 PREVIEW: DENAH TEMPAT DUDUK (PHYSICAL SEAT GRID)   */}
              {/* ======================================================== */}
              {previewDocType === 'seating' && (
                <div className="space-y-4">
                  <div className="text-center pb-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
                      DENAH TATA LETAK TEMPAT DUDUK PESERTA
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      {selectedRoom?.name.toUpperCase()} &middot; {selectedRoom?.building} &middot; Kapasitas {selectedRoom?.capacity} Meja
                    </p>
                  </div>

                  {/* Blackboard & Invigilator Desk */}
                  <div className="space-y-2">
                    <div className="w-full bg-slate-800 text-white text-center py-2 rounded font-mono text-xs font-bold uppercase tracking-wider">
                      [ PAPAN TULIS DEPAN KELAS ]
                    </div>

                    <div className="w-64 mx-auto bg-amber-50 border border-amber-300 rounded p-2 text-center text-xs text-amber-900">
                      <strong>MEJA PENGAWAS RUANG</strong>
                      <p className="text-2xs truncate">
                        {selectedRoom?.invigilator1} {selectedRoom?.invigilator2 ? `& ${selectedRoom.invigilator2}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Desk Grid */}
                  <div
                    className="grid gap-2.5 py-4"
                    style={{
                      gridTemplateColumns: `repeat(${selectedRoom?.columns || 4}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: selectedRoom?.capacity || 24 }).map((_, idx) => {
                      const seatNo = idx + 1;
                      const student = roomStudents.find((s) => s.seatNumber === seatNo);

                      if (student) {
                        return (
                          <div
                            key={seatNo}
                            className="border border-slate-300 rounded p-2 text-left bg-slate-50/80 shadow-2xs space-y-1"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                              <span className="font-mono text-2xs font-bold text-slate-900">
                                Meja {String(seatNo).padStart(2, '0')}
                              </span>
                              <span className="font-mono text-2xs font-bold text-slate-700">
                                ({student.gender})
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-950 truncate leading-tight" title={student.name}>
                              {student.name}
                            </p>
                            <div className="flex items-center justify-between text-2xs text-slate-600 font-mono">
                              <span>{student.nis}</span>
                              <span className="font-sans font-medium">{student.className}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={seatNo}
                          className="border border-dashed border-slate-300 rounded p-2 text-left bg-white text-slate-300 flex flex-col justify-between"
                        >
                          <span className="font-mono text-2xs">Meja {String(seatNo).padStart(2, '0')}</span>
                          <span className="text-2xs text-center italic py-2">(Kosong)</span>
                          <span className="text-2xs text-slate-300 font-mono">Tersedia</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center font-mono text-2xs text-slate-400 uppercase tracking-widest pt-2">
                    [ PINTU MASUK / BELAKANG KELAS ]
                  </div>

                  {/* Supervisor Signature Block */}
                  <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Pengawas Ruang 1</p>
                      <div className="h-14" />
                      <p className="font-bold underline">({selectedRoom?.invigilator1})</p>
                    </div>
                    <div>
                      <p>Petugas Ruang,</p>
                      <p className="font-bold">Pengawas Ruang 2</p>
                      <div className="h-14" />
                      <p className="font-bold underline">({selectedRoom?.invigilator2 || '.....................................'})</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* DOC 3 PREVIEW: DAFTAR HADIR & BERITA ACARA UJIAN         */}
              {/* ======================================================== */}
              {previewDocType === 'attendance' && (
                <div className="space-y-4">
                  <div className="text-center pb-1">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
                      DAFTAR HADIR PESERTA & BERITA ACARA UJIAN
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      {settings.examTitle} &middot; TAHUN AJARAN {settings.academicYear}
                    </p>
                  </div>

                  {/* Official Metadata */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs py-2 border-y border-slate-300">
                    <div className="flex">
                      <span className="w-28 text-slate-600">Mata Pelajaran</span>
                      <span>: .................................................</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Ruang Ujian</span>
                      <span className="font-bold">: {selectedRoom?.name} ({selectedRoom?.code})</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Hari / Tanggal</span>
                      <span>: {settings.examDate}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Gedung / Lokasi</span>
                      <span>: {selectedRoom?.building}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Waktu / Sesi</span>
                      <span>: {settings.examSession}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Aturan Kursi</span>
                      <span className="font-semibold">: Kapasitas {selectedRoom?.capacity} Meja (Terisi: {roomStudents.length}, Kosong: {Math.max(0, (selectedRoom?.capacity || 0) - roomStudents.length)})</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Pengawas Ruang</span>
                      <span className="truncate">: {selectedRoom?.invigilator1}</span>
                    </div>
                  </div>

                  {/* Attendance Table with Staggered Signature lines conforming to Chair Rules */}
                  <div className="border border-slate-400 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                        <tr>
                          <th className="py-2 px-2 text-center w-10 border-r border-slate-300">No</th>
                          <th className="py-2 px-2 text-center w-12 border-r border-slate-300">Kursi</th>
                          <th className="py-2 px-2 border-r border-slate-300">No. Peserta</th>
                          <th className="py-2 px-2 border-r border-slate-300">NIS</th>
                          <th className="py-2 px-2 border-r border-slate-300">Nama Lengkap Siswa</th>
                          <th className="py-2 px-2 text-center w-10 border-r border-slate-300">L/P</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kelas</th>
                          <th className="py-2 px-2 text-center w-40" colSpan={2}>
                            Tanda Tangan Peserta
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {Array.from({ length: selectedRoom?.capacity || 24 }).map((_, idx) => {
                          const seatNo = idx + 1;
                          const st = roomStudents.find((s) => s.seatNumber === seatNo);
                          const isOdd = seatNo % 2 !== 0;

                          if (st) {
                            return (
                              <tr key={seatNo} className="hover:bg-slate-50">
                                <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">
                                  {seatNo}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-300">
                                  {String(seatNo).padStart(2, '0')}
                                </td>
                                <td className="py-1.5 px-2 font-mono font-semibold border-r border-slate-300">
                                  {st.participantNo}
                                </td>
                                <td className="py-1.5 px-2 font-mono border-r border-slate-300">
                                  {st.nis}
                                </td>
                                <td className="py-1.5 px-2 font-medium text-slate-900 border-r border-slate-300">
                                  {st.name}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">
                                  {st.gender}
                                </td>
                                <td className="py-1.5 px-2 border-r border-slate-300">
                                  {st.className}
                                </td>
                                <td className="py-1.5 px-2 w-20 text-slate-500 border-r border-slate-200">
                                  {isOdd ? `${seatNo}. ....................` : ''}
                                </td>
                                <td className="py-1.5 px-2 w-20 text-slate-500">
                                  {!isOdd ? `${seatNo}. ....................` : ''}
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={seatNo} className="bg-slate-50/50 text-slate-400">
                              <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">
                                {seatNo}
                              </td>
                              <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">
                                {String(seatNo).padStart(2, '0')}
                              </td>
                              <td className="py-1.5 px-2 font-mono border-r border-slate-300">-</td>
                              <td className="py-1.5 px-2 font-mono border-r border-slate-300">-</td>
                              <td className="py-1.5 px-2 italic text-slate-500 font-medium border-r border-slate-300">
                                [ KURSI KOSONG / TERSEDIA ]
                              </td>
                              <td className="py-1.5 px-2 text-center border-r border-slate-300">-</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                              <td className="py-1.5 px-2 text-center text-slate-300 border-r border-slate-200">
                                ----------
                              </td>
                              <td className="py-1.5 px-2 text-center text-slate-300">
                                ----------
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Attendance Count Summary */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                    <div className="space-y-1 text-slate-700">
                      <p>Aturan Kapasitas Ruang : <strong>{selectedRoom?.capacity} Meja ({selectedRoom?.columns} Kolom)</strong></p>
                      <p>Jumlah Peserta Terisi / Terdaftar : <strong>{roomStudents.length} Orang</strong></p>
                      <p>Jumlah Kursi Kosong / Tersedia : <strong>{Math.max(0, (selectedRoom?.capacity || 0) - roomStudents.length)} Meja</strong></p>
                    </div>
                    <div className="space-y-1 text-slate-700 text-right">
                      <p>Jumlah Peserta Hadir : <strong>......... Orang</strong></p>
                      <p>Jumlah Peserta Tidak Hadir : <strong>......... Orang</strong></p>
                    </div>
                  </div>

                  {/* Dual Signatures */}
                  <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Pengawas Ruang 1</p>
                      <div className="h-16" />
                      <p className="font-bold underline">({selectedRoom?.invigilator1})</p>
                      <p className="text-2xs text-slate-500">NIP. .................................................</p>
                    </div>

                    <div>
                      <p>Petugas Ujian,</p>
                      <p className="font-bold">Pengawas Ruang 2</p>
                      <div className="h-16" />
                      <p className="font-bold underline">({selectedRoom?.invigilator2 || '...............................................'})</p>
                      <p className="text-2xs text-slate-500">NIP. .................................................</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* DOC 4 PREVIEW: KARTU PESERTA UJIAN (A4 SHEET)            */}
              {/* ======================================================== */}
              {previewDocType === 'card' && (
                <div className="space-y-6">
                  {/* Top info badge */}
                  <div className="bg-slate-100 border border-slate-300 rounded p-2.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span>
                        Format Cetak Standar: <strong>2 Kartu per Lembar Kertas A4</strong> (Siap Potong & Dilaminasi)
                      </span>
                    </div>
                    <span className="font-mono text-2xs text-slate-500">
                      Siswa Terpilih: <strong>{selectedStudent?.name}</strong> (NIS: {selectedStudent?.nis})
                    </span>
                  </div>

                  {/* Render 2 stacked cards as they would physically appear on the A4 page */}
                  {[
                    selectedStudent,
                    students.find((s) => s.id !== selectedStudent?.id) || selectedStudent,
                  ].map((cardStudent, cardIdx) => {
                    if (!cardStudent) return null;
                    return (
                      <React.Fragment key={cardIdx}>
                        {/* The Exam Card Container */}
                        <div className="border-2 border-slate-800 rounded-lg p-5 bg-white shadow-2xs space-y-4">
                          {/* Card Kop Surat with Dual Logos */}
                          <div className="flex items-center justify-between gap-3 border-b-2 border-slate-800 pb-2.5">
                            {/* Logo Kiri Pemda */}
                            <div className="w-12 h-12 flex items-center justify-center shrink-0">
                              <img
                                src={settings.logoLeftPemda || DEFAULT_PEMDA_LOGO}
                                alt="Logo Pemda"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>

                            {/* Center Kop Typography */}
                            <div className="flex-1 text-center space-y-0.5">
                              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                {settings.schoolName}
                              </h3>
                              <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider font-serif">
                                KARTU PESERTA UJIAN
                              </h2>
                              <p className="text-2xs font-semibold text-slate-700 uppercase">
                                {settings.activityName || settings.examTitle} - TAHUN PELAJARAN {settings.academicYear}
                              </p>
                            </div>

                            {/* Logo Kanan Sekolah */}
                            <div className="w-12 h-12 flex items-center justify-center shrink-0">
                              <img
                                src={settings.logoRightSchool || DEFAULT_SCHOOL_LOGO}
                                alt="Logo Sekolah"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>

                          {/* Student Identity Grid & Photo */}
                          <div className="flex gap-4 items-start">
                            {/* 2x3 Photo Box */}
                            <div className="w-20 h-26 rounded border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-1 shrink-0">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-1">
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="text-3xs font-bold text-slate-400 uppercase">Pas Foto</span>
                              <span className="text-3xs text-slate-400">2 x 3 cm</span>
                            </div>

                            {/* Identity Fields */}
                            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              <div className="flex items-baseline">
                                <span className="w-24 text-slate-500 text-2xs">No. Peserta</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="font-mono font-bold text-slate-950 text-2xs">
                                  {cardStudent.participantNo || 'UJN-001'}
                                </span>
                              </div>

                              <div className="flex items-baseline">
                                <span className="w-24 text-slate-500 text-2xs">Ruang / Meja</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="font-mono font-bold text-slate-950 text-2xs">
                                  {cardStudent.roomName || 'Ruang 01'} (Meja {String(cardStudent.seatNumber || 1).padStart(2, '0')})
                                </span>
                              </div>

                              <div className="flex items-baseline">
                                <span className="w-24 text-slate-500 text-2xs">NIS / NISN</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="font-mono font-semibold text-slate-900 text-2xs">
                                  {cardStudent.nis} / {cardStudent.nisn || '-'}
                                </span>
                              </div>

                              <div className="flex items-baseline">
                                <span className="w-24 text-slate-500 text-2xs">Kelas / Rombel</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="font-semibold text-slate-900 text-2xs">
                                  {cardStudent.className}
                                </span>
                              </div>

                              <div className="flex items-baseline col-span-2">
                                <span className="w-24 text-slate-500 text-2xs">Nama Peserta</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="font-bold text-slate-950 uppercase text-xs">
                                  {cardStudent.name}
                                </span>
                              </div>

                              <div className="flex items-baseline">
                                <span className="w-24 text-slate-500 text-2xs">Jenis Kelamin</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="text-slate-800 text-2xs">
                                  {cardStudent.gender === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}
                                </span>
                              </div>

                              <div className="flex items-baseline">
                                <span className="w-24 text-slate-500 text-2xs">Sesi Ujian</span>
                                <span className="text-slate-400 mr-2 text-2xs">:</span>
                                <span className="text-slate-800 text-2xs">
                                  {settings.examSession}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Timetable AutoTable with TTD/Paraf Pengawas Ruang */}
                          <div className="border border-slate-300 rounded overflow-hidden">
                            <table className="w-full text-left text-2xs">
                              <thead className="bg-slate-900 text-white font-semibold">
                                <tr>
                                  <th className="py-1 px-2 w-7 text-center">No</th>
                                  <th className="py-1 px-2 w-32">Hari / Tanggal</th>
                                  <th className="py-1 px-2 w-28 text-center">Waktu</th>
                                  <th className="py-1 px-2">Mata Pelajaran Ujian</th>
                                  <th className="py-1 px-2 w-28 text-center bg-slate-800">
                                    Paraf Pengawas
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {(schedules.length > 0
                                  ? schedules.slice(0, 6)
                                  : [
                                      { id: '1', day: 'Senin', date: '20 Oktober 2026', time: '07.30 - 09.30', subject: 'Bahasa Indonesia' },
                                      { id: '2', day: 'Senin', date: '20 Oktober 2026', time: '10.00 - 11.30', subject: 'Pendidikan Agama' },
                                      { id: '3', day: 'Selasa', date: '21 Oktober 2026', time: '07.30 - 09.30', subject: 'Matematika Wajib' },
                                      { id: '4', day: 'Selasa', date: '21 Oktober 2026', time: '10.00 - 11.30', subject: 'Pendidikan Pancasila' },
                                      { id: '5', day: 'Rabu', date: '22 Oktober 2026', time: '07.30 - 09.30', subject: 'Bahasa Inggris' },
                                      { id: '6', day: 'Rabu', date: '22 Oktober 2026', time: '10.00 - 11.30', subject: 'Sejarah Indonesia' },
                                    ]
                                ).map((sch, schIdx) => (
                                  <tr key={sch.id} className="hover:bg-slate-50">
                                    <td className="py-1 px-2 text-center font-mono text-slate-500 border-r border-slate-200">
                                      {schIdx + 1}
                                    </td>
                                    <td className="py-1 px-2 font-medium text-slate-800 border-r border-slate-200">
                                      {sch.day}, {sch.date}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-600 border-r border-slate-200">
                                      {sch.time}
                                    </td>
                                    <td className="py-1 px-2 font-semibold text-slate-900 border-r border-slate-200">
                                      {sch.subject}
                                    </td>
                                    <td className="py-1 px-2 text-center bg-slate-50/70">
                                      <div className="w-14 h-5 mx-auto border border-dashed border-slate-300 rounded flex items-center justify-center text-3xs text-slate-400 font-mono">
                                        paraf
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Bottom Official Signatures */}
                          <div className="grid grid-cols-2 gap-6 text-xs text-center pt-1">
                            <div>
                              <p className="text-slate-600 text-2xs">Peserta Ujian,</p>
                              <div className="h-11" />
                              <p className="font-bold underline text-2xs uppercase">
                                ({cardStudent.name})
                              </p>
                              <p className="text-3xs text-slate-400 font-mono">NIS: {cardStudent.nis}</p>
                            </div>

                            <div>
                              <p className="text-slate-600 text-2xs">
                                Jakarta, {settings.examDate.split('-')[0].trim() || '20 Oktober 2026'}
                              </p>
                              <p className="font-bold text-slate-800 text-2xs">Ketua Panitia Ujian,</p>
                              <div className="h-9" />
                              <p className="font-bold underline text-2xs">
                                {settings.committeeHead}
                              </p>
                              <p className="text-3xs text-slate-500 font-mono">NIP. {settings.committeeNip}</p>
                            </div>
                          </div>
                        </div>

                        {/* Scissor Cutting Guideline Line between Card 1 and Card 2 */}
                        {cardIdx === 0 && (
                          <div className="py-2 flex items-center justify-center gap-2 text-2xs font-mono text-slate-400">
                            <span className="flex-1 border-b border-dashed border-slate-300" />
                            <span>✂ - - - - - - Gunting Di Sini - - - - - - ✂</span>
                            <span className="flex-1 border-b border-dashed border-slate-300" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
