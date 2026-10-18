import React from 'react';
import { Search, Settings, FileSpreadsheet, Building2, Users, LayoutGrid, Sliders, Eye, Calendar } from 'lucide-react';
import { ExamSettings } from '../types';

export type AppTab = 'dashboard' | 'seating' | 'students' | 'manage-students' | 'rooms' | 'schedule' | 'rules' | 'export';

interface HeaderProps {
  settings: ExamSettings;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  isAllocated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenSettings,
  isAllocated,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Row */}
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single element brand / title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              EX
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                SISPRAK RUANG UJIAN
              </span>
              <span className="text-xs text-slate-500 block leading-tight truncate max-w-[200px] sm:max-w-[320px]">
                {settings.activityName || settings.examTitle} &middot; TP {settings.academicYear}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Alokasi & Ringkasan
            </button>

            <button
              onClick={() => setActiveTab('seating')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'seating'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Denah Ruang
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Daftar Peserta
            </button>

            <button
              onClick={() => setActiveTab('manage-students')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'manage-students'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Data Siswa
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'rooms'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Ruangan
            </button>

            {/* Menu Jadwal Ujian */}
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Jadwal Ujian
            </button>

            {/* Menu Aturan & Preview */}
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Menu Aturan & Kop
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Ekspor & Cetak
            </button>
          </nav>

          {/* Zone 3: Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
              title="Cari lokasi ruang & kursi berdasarkan NIS"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cek NIS Siswa</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              title="Pengaturan Data Ujian & Sekolah"
              aria-label="Pengaturan"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Medium and Mobile Navigation bar */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Alokasi
          </button>
          <button
            onClick={() => setActiveTab('seating')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'seating' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Denah Meja
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Peserta
          </button>
          <button
            onClick={() => setActiveTab('manage-students')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'manage-students' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Data Siswa
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'rooms' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Ruangan
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Jadwal Ujian
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'rules' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Menu Aturan & Kop
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'export' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Ekspor
          </button>
        </div>
      </div>
    </header>
  );
};
