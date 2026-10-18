import React, { useState, useEffect, useMemo } from 'react';
import { Header, AppTab } from './components/Header';
import { AllocationDashboard } from './components/AllocationDashboard';
import { RoomSeatingMap } from './components/RoomSeatingMap';
import { StudentListTable } from './components/StudentListTable';
import { StudentManagement } from './components/StudentManagement';
import { RoomManagement } from './components/RoomManagement';
import { ScheduleManagement } from './components/ScheduleManagement';
import { RulesAndPreviewMenu } from './components/RulesAndPreviewMenu';
import { ExportCenter } from './components/ExportCenter';
import { StudentSearchModal } from './components/StudentSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { Student, Room, ExamSettings, ExamScheduleItem } from './types';
import { defaultExamSettings, defaultRooms, sampleStudents, defaultExamSchedule } from './utils/sampleData';
import { allocateStudentsToRooms } from './utils/allocator';
import { Check, Sparkles } from 'lucide-react';

export default function App() {
  // Load state from localStorage or initial defaults
  const [settings, setSettings] = useState<ExamSettings>(() => {
    try {
      const saved = localStorage.getItem('autoexam_settings');
      return saved ? JSON.parse(saved) : defaultExamSettings;
    } catch {
      return defaultExamSettings;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('autoexam_rooms');
      return saved ? JSON.parse(saved) : defaultRooms;
    } catch {
      return defaultRooms;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('autoexam_students');
      if (saved) {
        return JSON.parse(saved);
      }
      // On first load, pre-allocate sample students so user immediately has full interactive experience
      const { allocatedStudents } = allocateStudentsToRooms(
        sampleStudents,
        defaultRooms,
        defaultExamSettings
      );
      return allocatedStudents;
    } catch {
      return sampleStudents;
    }
  });

  const [schedules, setSchedules] = useState<ExamScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('autoexam_schedules');
      return saved ? JSON.parse(saved) : defaultExamSchedule;
    } catch {
      return defaultExamSchedule;
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  const [selectedRoomId, setSelectedRoomId] = useState<string>(defaultRooms[0]?.id || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSearchStudent, setActiveSearchStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('autoexam_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('autoexam_rooms', JSON.stringify(rooms));
    } catch {
      // ignore
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('autoexam_students', JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('autoexam_schedules', JSON.stringify(schedules));
    } catch {
      // ignore
    }
  }, [schedules]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute allocation summary
  const summary = useMemo(() => {
    const totalStudents = students.length;
    const allocated = students.filter((s) => s.roomId);
    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);

    const roomBreakdowns = rooms.map((room) => {
      const roomStudents = students.filter((s) => s.roomId === room.id);
      const nisList = roomStudents.map((s) => s.nis).sort();
      return {
        room,
        allocatedCount: roomStudents.length,
        occupancyRate: Math.round((roomStudents.length / Math.max(1, room.capacity)) * 100),
        nisMin: nisList[0],
        nisMax: nisList[nisList.length - 1],
      };
    });

    return {
      totalStudents,
      allocatedStudents: allocated.length,
      unallocatedStudents: Math.max(0, totalStudents - allocated.length),
      totalRooms: rooms.length,
      totalCapacity,
      remainingCapacity: Math.max(0, totalCapacity - allocated.length),
      roomBreakdowns,
    };
  }, [students, rooms]);

  // Execute Automatic Allocation
  const handleRunAllocation = () => {
    const { allocatedStudents } = allocateStudentsToRooms(students, rooms, settings);
    setStudents(allocatedStudents);

    let methodLabel = 'Silang Antar Kelas';
    if (settings.sortMethod === 'nis-asc') methodLabel = 'Urut NIS Terkecil';
    if (settings.sortMethod === 'nis-desc') methodLabel = 'Urut NIS Terbesar';
    if (settings.sortMethod === 'nis-odd-even') methodLabel = 'Pola NIS Ganjil-Genap';

    showToast(`Berhasil mengalokasikan ${allocatedStudents.filter(s => s.roomId).length} siswa dengan metode "${methodLabel}"!`);
  };

  // Reset Allocation
  const handleResetAllocation = () => {
    const reset = students.map((s) => ({
      ...s,
      roomId: undefined,
      roomName: undefined,
      seatNumber: undefined,
      participantNo: undefined,
    }));
    setStudents(reset);
    showToast('Alokasi ruang dan nomor meja berhasil direset.');
  };

  // Swap Seats between two students
  const handleSwapStudents = (id1: string, id2: string) => {
    const s1 = students.find((s) => s.id === id1);
    const s2 = students.find((s) => s.id === id2);
    if (!s1 || !s2) return;

    const updated = students.map((s) => {
      if (s.id === id1) {
        return {
          ...s,
          roomId: s2.roomId,
          roomName: s2.roomName,
          seatNumber: s2.seatNumber,
          participantNo: s2.participantNo,
        };
      }
      if (s.id === id2) {
        return {
          ...s,
          roomId: s1.roomId,
          roomName: s1.roomName,
          seatNumber: s1.seatNumber,
          participantNo: s1.participantNo,
        };
      }
      return s;
    });

    setStudents(updated);
    showToast(`Tempat duduk ${s1.name} dan ${s2.name} berhasil ditukar!`);
  };

  // Student CRUD
  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const created: Student = {
      ...newStudent,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [...prev, created]);
    showToast(`Siswa "${newStudent.name}" berhasil ditambahkan.`);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    showToast(`Data siswa "${updatedStudent.name}" diperbarui.`);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('Siswa berhasil dihapus.');
  };

  const handleImportStudents = (imported: Student[]) => {
    setStudents(imported);
    // Auto-allocate upon import for seamless UX
    const { allocatedStudents } = allocateStudentsToRooms(imported, rooms, settings);
    setStudents(allocatedStudents);
    showToast(`Berhasil mengimpor ${imported.length} siswa dan menjalankan pembagian ruang otomatis!`);
  };

  const handleLoadSampleStudents = () => {
    const { allocatedStudents } = allocateStudentsToRooms(sampleStudents, rooms, settings);
    setStudents(allocatedStudents);
    showToast('Data sampel 80 siswa berhasil dimuat dan dialokasikan ke 4 ruangan!');
  };

  const handleClearAllStudents = () => {
    setStudents([]);
    showToast('Semua data siswa telah dibersihkan.');
  };

  // Room CRUD
  const handleAddRoom = (newRoom: Omit<Room, 'id'>) => {
    const created: Room = {
      ...newRoom,
      id: `room-${Date.now()}`,
    };
    const updatedRooms = [...rooms, created];
    setRooms(updatedRooms);
    // If not allocated yet or re-allocating
    showToast(`Ruangan "${newRoom.name}" berhasil ditambahkan.`);
  };

  const handleEditRoom = (updatedRoom: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    showToast(`Data "${updatedRoom.name}" diperbarui.`);
  };

  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) {
      alert('Minimal harus ada 1 ruangan ujian!');
      return;
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
    showToast('Ruangan berhasil dihapus.');
  };

  // Schedule CRUD
  const handleAddSchedule = (newSch: Omit<ExamScheduleItem, 'id'>) => {
    const item: ExamScheduleItem = {
      ...newSch,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, item]);
    showToast(`Mata pelajaran "${newSch.subject}" berhasil ditambahkan.`);
  };

  const handleEditSchedule = (updated: ExamScheduleItem) => {
    setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Jadwal "${updated.subject}" berhasil diperbarui.`);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showToast('Mata pelajaran dihapus dari jadwal.');
  };

  const handleResetSchedule = () => {
    setSchedules(defaultExamSchedule);
    showToast('Jadwal ujian dikembalikan ke daftar standar.');
  };

  const handleSelectRoomForSeating = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('seating');
  };

  const handleViewStudentCard = (student: Student) => {
    setActiveSearchStudent(student);
    setIsSearchOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Contract */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => {
          setActiveSearchStudent(null);
          setIsSearchOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isAllocated={summary.allocatedStudents > 0}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <AllocationDashboard
            students={students}
            rooms={rooms}
            settings={settings}
            summary={summary}
            onUpdateSettings={setSettings}
            onRunAllocation={handleRunAllocation}
            onResetAllocation={handleResetAllocation}
            onSelectRoomForSeating={handleSelectRoomForSeating}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'seating' && (
          <RoomSeatingMap
            rooms={rooms}
            students={students}
            settings={settings}
            selectedRoomId={selectedRoomId || rooms[0]?.id || ''}
            onSelectRoom={setSelectedRoomId}
            onSwapStudents={handleSwapStudents}
          />
        )}

        {activeTab === 'students' && (
          <StudentListTable
            students={students}
            rooms={rooms}
            settings={settings}
            schedules={schedules}
            onViewStudentCard={handleViewStudentCard}
          />
        )}

        {activeTab === 'manage-students' && (
          <StudentManagement
            students={students}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onImportStudents={handleImportStudents}
            onLoadSampleStudents={handleLoadSampleStudents}
            onClearAllStudents={handleClearAllStudents}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomManagement
            rooms={rooms}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleManagement
            schedules={schedules}
            settings={settings}
            onAddSchedule={handleAddSchedule}
            onEditSchedule={handleEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onResetSchedule={handleResetSchedule}
          />
        )}

        {activeTab === 'rules' && (
          <RulesAndPreviewMenu
            settings={settings}
            rooms={rooms}
            students={students}
            schedules={schedules}
            onUpdateSettings={setSettings}
            onUpdateRooms={setRooms}
          />
        )}

        {activeTab === 'export' && (
          <ExportCenter
            students={students}
            rooms={rooms}
            settings={settings}
            schedules={schedules}
          />
        )}
      </main>

      {/* Student Quick Search & Card Modal */}
      <StudentSearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setActiveSearchStudent(null);
        }}
        students={students}
        rooms={rooms}
        settings={settings}
        schedules={schedules}
        initialStudent={activeSearchStudent}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          showToast('Pengaturan sekolah & ujian berhasil disimpan!');
        }}
      />
    </div>
  );
}
