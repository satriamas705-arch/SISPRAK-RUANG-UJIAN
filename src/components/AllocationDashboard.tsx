import React from 'react';
import {
  Users,
  Building2,
  Armchair,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  FileSpreadsheet,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Student, Room, ExamSettings, SortMethod, AllocationSummary } from '../types';
import { AppTab } from './Header';
import { exportAttendancePdfForRoom, exportDoorPosterPdf } from '../utils/exportPdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface AllocationDashboardProps {
  students: Student[];
  rooms: Room[];
  settings: ExamSettings;
  summary: AllocationSummary;
  onUpdateSettings: (newSettings: ExamSettings) => void;
  onRunAllocation: () => void;
  onResetAllocation: () => void;
  onSelectRoomForSeating: (roomId: string) => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const AllocationDashboard: React.FC<AllocationDashboardProps> = ({
  students,
  rooms,
  settings,
  summary,
  onUpdateSettings,
  onRunAllocation,
  onResetAllocation,
  onSelectRoomForSeating,
  onNavigateTab,
}) => {
  const isAllocated = summary.allocatedStudents > 0;
  const isCapacitySufficient = summary.totalCapacity >= summary.totalStudents;

  // Data for Recharts comparison
  const chartData = summary.roomBreakdowns.map((rb) => ({
    name: rb.room.code,
    fullName: rb.room.name,
    building: rb.room.building,
    kapasitas: rb.room.capacity,
    teralokasi: rb.allocatedCount,
    kosong: Math.max(0, rb.room.capacity - rb.allocatedCount),
    rate: rb.occupancyRate,
  }));

  const avgOccupancy =
    summary.totalCapacity > 0
      ? Math.round((summary.allocatedStudents / summary.totalCapacity) * 100)
      : 0;

  const fullRooms = summary.roomBreakdowns.filter(
    (rb) => rb.allocatedCount >= rb.room.capacity && rb.room.capacity > 0
  ).length;

  const CustomChartTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: typeof chartData[0] }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-slate-100">{data.fullName} ({data.name})</span>
            <span className="font-mono text-2xs px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
              {data.rate}% Terisi
            </span>
          </div>
          <p className="text-2xs text-slate-400">{data.building}</p>
          <div className="space-y-1 pt-1 font-mono text-2xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
                Aturan Kapasitas:
              </span>
              <span className="font-bold text-white">{data.kapasitas} Kursi</span>
            </div>
            <div className="flex justify-between items-center text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 border border-slate-500 inline-block" />
                Siswa Teralokasi:
              </span>
              <span className="font-bold text-emerald-400">{data.teralokasi} Siswa</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 inline-block" />
                Kursi Kosong:
              </span>
              <span className="font-bold text-slate-300">{data.kosong} Kursi</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pembagian Ruang Ujian Otomatis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {settings.examTitle} &middot; Tahun Ajaran {settings.academicYear} &middot; {settings.examSession}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAllocated ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ruang Telah Dialokasikan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Belum Dialokasikan</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalStudents}
            </span>
            <span className="text-xs text-slate-500">orang</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kapasitas Kursi Total</span>
            <Armchair className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalCapacity}
            </span>
            <span className="text-xs text-slate-500">di {summary.totalRooms} ruang</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Siswa Teralokasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {summary.allocatedStudents}
            </span>
            <span className="text-xs text-slate-500">
              ({summary.totalStudents > 0 ? Math.round((summary.allocatedStudents / summary.totalStudents) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sisa Kursi Kosong</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-700">
              {summary.remainingCapacity}
            </span>
            <span className="text-xs text-slate-500">kursi cadangan</span>
          </div>
        </div>
      </div>

      {/* Capacity Warning if not enough room */}
      {!isCapacitySufficient && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-900">
            <p className="font-semibold">Kapasitas Ruang Tidak Mencukupi!</p>
            <p className="mt-0.5">
              Jumlah siswa ({summary.totalStudents}) melebihi total kapasitas seluruh ruangan ({summary.totalCapacity}).
              Sebanyak {summary.totalStudents - summary.totalCapacity} siswa tidak akan kebagian kursi. Silakan tambah ruangan baru atau tingkatkan kapasitas kursi.
            </p>
          </div>
        </div>
      )}

      {/* Control Panel: Metodologi Alokasi Berbasis NIS */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Konfigurasi Pembagian Otomatis Berbasis NIS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan metode pengurutan Nomor Induk Siswa untuk penempatan ruang dan meja ujian
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAllocated && (
              <button
                onClick={onResetAllocation}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Alokasi
              </button>
            )}

            <button
              onClick={onRunAllocation}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Jalankan Pembagian Otomatis</span>
            </button>
          </div>
        </div>

        {/* Algorithm Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Method 1: Cross-class */}
          <label
            className={`relative flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${
              settings.sortMethod === 'nis-cross-class'
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Silang Rombel (NIS)</span>
              <input
                type="radio"
                name="sortMethod"
                value="nis-cross-class"
                checked={settings.sortMethod === 'nis-cross-class'}
                onChange={() => onUpdateSettings({ ...settings, sortMethod: 'nis-cross-class' })}
                className="text-slate-900 focus:ring-slate-900"
              />
            </div>
            <span className="text-2xs font-semibold text-emerald-700 uppercase tracking-wider mt-1">
              Rekomendasi Ujian Resmi
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Mengurutkan NIS di masing-masing kelas lalu menyilangkan antar kelas agar teman sekelas tidak duduk berdampingan.
            </p>
          </label>

          {/* Method 2: Ascending */}
          <label
            className={`relative flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${
              settings.sortMethod === 'nis-asc'
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Urut NIS Terkecil</span>
              <input
                type="radio"
                name="sortMethod"
                value="nis-asc"
                checked={settings.sortMethod === 'nis-asc'}
                onChange={() => onUpdateSettings({ ...settings, sortMethod: 'nis-asc' })}
                className="text-slate-900 focus:ring-slate-900"
              />
            </div>
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Ascending (01 &rarr; 99)
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Mengalokasikan seluruh siswa murni dari nomor NIS paling kecil berurutan ke Ruang 01, Ruang 02, dan seterusnya.
            </p>
          </label>

          {/* Method 3: Odd-Even */}
          <label
            className={`relative flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${
              settings.sortMethod === 'nis-odd-even'
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Pola NIS Ganjil - Genap</span>
              <input
                type="radio"
                name="sortMethod"
                value="nis-odd-even"
                checked={settings.sortMethod === 'nis-odd-even'}
                onChange={() => onUpdateSettings({ ...settings, sortMethod: 'nis-odd-even' })}
                className="text-slate-900 focus:ring-slate-900"
              />
            </div>
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Selingan Digit Akhir
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Membagi siswa berdasarkan digit akhir NIS ganjil dan genap, lalu menyusun nomor kursi secara bergantian.
            </p>
          </label>

          {/* Method 4: Descending */}
          <label
            className={`relative flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${
              settings.sortMethod === 'nis-desc'
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Urut NIS Terbesar</span>
              <input
                type="radio"
                name="sortMethod"
                value="nis-desc"
                checked={settings.sortMethod === 'nis-desc'}
                onChange={() => onUpdateSettings({ ...settings, sortMethod: 'nis-desc' })}
                className="text-slate-900 focus:ring-slate-900"
              />
            </div>
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Descending (99 &rarr; 01)
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Mengalokasikan siswa mulai dari nomor induk sekolah paling besar (siswa angkatan terbaru) terlebih dahulu.
            </p>
          </label>
        </div>

        {/* Additional Config Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Format No. Peserta:</label>
            <input
              type="text"
              value={settings.participantPrefix}
              onChange={(e) => onUpdateSettings({ ...settings, participantPrefix: e.target.value.toUpperCase() })}
              placeholder="UJN"
              className="w-20 px-2 py-1 font-mono text-xs border border-slate-300 rounded focus:border-slate-900 focus:outline-none uppercase"
            />
            <span className="text-slate-500 font-mono">
              Contoh: {settings.participantPrefix || 'UJN'}-R01-01
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 ml-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Penomoran kursi dijamin unik tanpa nomor ganda.</span>
          </div>
        </div>
      </div>

      {/* Visual Recharts Bar Chart: Perbandingan Kapasitas vs Siswa Teralokasi */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Visualisasi Kapasitas vs Siswa Teralokasi Tiap Ruangan
              </h2>
              <span className="text-2xs font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                Recharts Bar Chart
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik batang interaktif membandingkan aturan kapasitas meja vs jumlah peserta ujian yang menempati ruang
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono">
              <span className="text-slate-500 text-2xs block">KETERISIAN TOTAL</span>
              <strong className="text-slate-900">{avgOccupancy}%</strong>
            </div>
            <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono">
              <span className="text-slate-500 text-2xs block">RUANG PENUH</span>
              <strong className="text-slate-900">{fullRooms} / {rooms.length} Ruang</strong>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={34}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar
                  dataKey="kapasitas"
                  name="Kapasitas Kursi (Aturan)"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="teralokasi"
                  name="Siswa Teralokasi (Terisi)"
                  fill="#0f172a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="kosong"
                  name="Sisa Kursi Kosong"
                  fill="#e2e8f0"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Bottom Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-slate-600">Total Kursi Sesuai Aturan:</span>
            <span className="font-mono font-bold text-slate-900">{summary.totalCapacity} Kursi</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 rounded-md border border-emerald-200">
            <span className="text-emerald-800">Siswa Telah Dialokasikan:</span>
            <span className="font-mono font-bold text-emerald-900">{summary.allocatedStudents} Siswa</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-slate-600">Kursi Cadangan Tersedia:</span>
            <span className="font-mono font-bold text-slate-900">{summary.remainingCapacity} Kursi</span>
          </div>
        </div>
      </div>

      {/* Room Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rekapitulasi Ruang Ujian</h2>
            <p className="text-xs text-slate-500">
              Status keterisian meja dan alokasi siswa per ruangan
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Kelola Daftar Ruangan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.roomBreakdowns.map((rb) => {
            const isFull = rb.allocatedCount >= rb.room.capacity;
            return (
              <div
                key={rb.room.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800">
                          {rb.room.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{rb.room.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{rb.room.building}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                        {rb.allocatedCount} / {rb.room.capacity}
                      </span>
                      <span className="text-xs text-slate-500 block">Kursi Terisi</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-slate-900' : rb.allocatedCount > 0 ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.min(100, rb.occupancyRate)}%` }}
                    />
                  </div>

                  {/* Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Rentang NIS:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {rb.nisMin && rb.nisMax ? `${rb.nisMin} - ${rb.nisMax}` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pengawas:</span>
                      <span className="text-slate-800 truncate block" title={rb.room.invigilator1}>
                        {rb.room.invigilator1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onSelectRoomForSeating(rb.room.id)}
                    className="font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
                  >
                    <span>Denah Kursi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportDoorPosterPdf(rb.room, students, settings)}
                      className="px-2 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                      title="Unduh Tempelan Pintu Ruang (PDF)"
                    >
                      <DoorOpen className="w-3 h-3 text-slate-500" />
                      <span>Tempelan Pintu</span>
                    </button>
                    <button
                      onClick={() => exportAttendancePdfForRoom(rb.room, students, settings)}
                      className="px-2 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                      title="Unduh Daftar Hadir (PDF)"
                    >
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>Daftar Hadir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
