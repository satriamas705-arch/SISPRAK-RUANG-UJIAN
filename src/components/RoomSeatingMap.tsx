import React, { useState } from 'react';
import {
  DoorOpen,
  FileText,
  User,
  Users,
  ArrowLeftRight,
  Maximize2,
  Check,
  Building,
  Info,
} from 'lucide-react';
import { Student, Room, ExamSettings } from '../types';
import { exportAttendancePdfForRoom, exportDoorPosterPdf } from '../utils/exportPdf';

interface RoomSeatingMapProps {
  rooms: Room[];
  students: Student[];
  settings: ExamSettings;
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onSwapStudents: (studentId1: string, studentId2: string) => void;
}

export const RoomSeatingMap: React.FC<RoomSeatingMapProps> = ({
  rooms,
  students,
  settings,
  selectedRoomId,
  onSelectRoom,
  onSwapStudents,
}) => {
  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const [selectedSeatStudent, setSelectedSeatStudent] = useState<Student | null>(null);
  const [swapSourceStudent, setSwapSourceStudent] = useState<Student | null>(null);

  if (!currentRoom) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <p className="text-sm text-slate-500">Belum ada data ruangan yang tersedia.</p>
      </div>
    );
  }

  // Get students in this room, sorted by seatNumber
  const roomStudents = students.filter((s) => s.roomId === currentRoom.id);
  const studentBySeatMap = new Map<number, Student>();
  roomStudents.forEach((st) => {
    if (st.seatNumber) {
      studentBySeatMap.set(st.seatNumber, st);
    }
  });

  const columns = Math.max(2, Math.min(6, currentRoom.columns || 4));
  const capacity = currentRoom.capacity;
  const rows = Math.ceil(capacity / columns);

  // Handle click on seat
  const handleSeatClick = (student: Student | undefined) => {
    if (swapSourceStudent) {
      if (student && student.id !== swapSourceStudent.id) {
        // Swap with another student
        onSwapStudents(swapSourceStudent.id, student.id);
        setSwapSourceStudent(null);
      } else {
        // Cancel swap
        setSwapSourceStudent(null);
      }
    } else if (student) {
      setSelectedSeatStudent(student);
    }
  };

  const handleStartSwap = (student: Student) => {
    setSelectedSeatStudent(null);
    setSwapSourceStudent(student);
  };

  return (
    <div className="space-y-6">
      {/* Header and Room Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Denah Tata Letak Meja Ujian
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Visualisasi posisi tempat duduk peserta dan pengawas di ruang ujian
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDoorPosterPdf(currentRoom, students, settings)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Tempelan Pintu (PDF)</span>
          </button>
          <button
            onClick={() => exportAttendancePdfForRoom(currentRoom, students, settings)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daftar Hadir (PDF)</span>
          </button>
        </div>
      </div>

      {/* Room Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {rooms.map((room) => {
          const roomCount = students.filter((s) => s.roomId === room.id).length;
          const isSelected = room.id === currentRoom.id;
          return (
            <button
              key={room.id}
              onClick={() => {
                onSelectRoom(room.id);
                setSwapSourceStudent(null);
                setSelectedSeatStudent(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{room.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-2xs font-mono ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {roomCount}/{room.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Swap Mode Notification Bar */}
      {swapSourceStudent && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-700" />
            <span>
              Mode Tukar Posisi: Memilih meja untuk ditukar dengan{' '}
              <strong>{swapSourceStudent.name}</strong> (Meja {swapSourceStudent.seatNumber}).
              Klik meja siswa lain untuk menukar posisi kursi.
            </span>
          </div>
          <button
            onClick={() => setSwapSourceStudent(null)}
            className="px-2.5 py-1 text-2xs font-semibold bg-white border border-amber-300 hover:bg-amber-100 rounded text-amber-900"
          >
            Batal Tukar
          </button>
        </div>
      )}

      {/* Classroom Room Card Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        {/* Room Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-900">
              {currentRoom.code}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentRoom.name}</h2>
              <p className="text-xs text-slate-500">
                {currentRoom.building} &middot; Kapasitas {currentRoom.capacity} Kursi &middot; {columns} Kolom Meja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block" />
              <span>Meja Terisi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-50 border border-dashed border-slate-200 inline-block" />
              <span>Meja Kosong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
              <span>Dipilih</span>
            </div>
          </div>
        </div>

        {/* 2D CLASSROOM PHYSICAL ENVIRONMENT */}
        <div className="mt-6 max-w-4xl mx-auto">
          {/* Front Blackboard & Invigilator Podium */}
          <div className="mb-8">
            {/* Blackboard banner */}
            <div className="w-full bg-slate-800 text-slate-200 text-center py-2 rounded-t-md font-mono text-xs font-semibold tracking-widest uppercase">
              [ PAPAN TULIS DEPAN KELAS / ARAH DEPAN ]
            </div>

            {/* Invigilator / Teacher Desk */}
            <div className="mx-auto max-w-xs mt-3 bg-amber-50 border border-amber-200 rounded-md p-2.5 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>MEJA PENGAWAS RUANG</span>
              </div>
              <p className="text-2xs text-amber-800 mt-0.5 truncate">
                {currentRoom.invigilator1}
                {currentRoom.invigilator2 ? ` & ${currentRoom.invigilator2}` : ''}
              </p>
            </div>
          </div>

          {/* Student Desks Grid */}
          <div
            className="grid gap-3 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: capacity }).map((_, idx) => {
              const seatNo = idx + 1;
              const student = studentBySeatMap.get(seatNo);
              const isSelected = selectedSeatStudent?.id === student?.id;
              const isSwapSource = swapSourceStudent?.id === student?.id;

              if (student) {
                return (
                  <div
                    key={seatNo}
                    onClick={() => handleSeatClick(student)}
                    className={`relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                      isSwapSource
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-500 shadow-sm'
                        : isSelected
                        ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs'
                    }`}
                  >
                    {/* Desk Number Badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-2xs font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                        Meja {String(seatNo).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-2xs font-bold px-1 py-0.2 rounded font-mono ${
                          student.gender === 'L'
                            ? 'text-sky-700 bg-sky-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate" title={student.name}>
                        {student.name}
                      </p>
                      <div className="flex items-center justify-between text-2xs text-slate-500 font-mono">
                        <span>NIS: {student.nis}</span>
                        <span className="font-sans font-medium text-slate-600 truncate max-w-[70px]">
                          {student.className}
                        </span>
                      </div>
                    </div>

                    {/* Participant ID pill */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 text-2xs text-slate-500 font-mono flex items-center justify-between">
                      <span className="truncate">{student.participantNo}</span>
                      <Maximize2 className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                  </div>
                );
              }

              // Empty Desk Slot
              return (
                <div
                  key={seatNo}
                  className="p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 text-left flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xs font-medium text-slate-400">
                      Meja {String(seatNo).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="py-2 text-center text-2xs text-slate-400 font-medium">
                    (Kursi Kosong)
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 text-2xs text-slate-300 font-mono">
                    Tersedia
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classroom Back Note */}
          <div className="mt-8 text-center text-2xs font-mono text-slate-400 uppercase tracking-widest">
            [ PINTU MASUK / BELAKANG KELAS ]
          </div>
        </div>
      </div>

      {/* Selected Student Detail Card Modal */}
      {selectedSeatStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-2xs font-bold text-slate-500">
                  DETAIL TEMPAT DUDUK PESERTA
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedSeatStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSeatStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            {/* Quick Card Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-2xs">NOMOR KURSI / MEJA:</span>
                <span className="font-bold font-mono text-base text-slate-900">
                  Meja {String(selectedSeatStudent.seatNumber).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-2xs">NOMOR PESERTA:</span>
                <span className="font-bold font-mono text-xs text-slate-900">
                  {selectedSeatStudent.participantNo}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-2xs">NOMOR INDUK (NIS):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selectedSeatStudent.nis}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-2xs">KELAS / ROMBEL:</span>
                <span className="font-semibold text-slate-900">
                  {selectedSeatStudent.className}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-2xs">RUANG UJIAN:</span>
                <span className="font-semibold text-slate-900">
                  {currentRoom.name} ({currentRoom.code})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-2xs">LOKASI:</span>
                <span className="font-medium text-slate-700">
                  {currentRoom.building}
                </span>
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => handleStartSwap(selectedSeatStudent)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Tukar Kursi Meja Ini</span>
              </button>

              <button
                onClick={() => setSelectedSeatStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
