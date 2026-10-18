export interface Student {
  id: string;
  nis: string;
  nisn?: string;
  name: string;
  className: string;
  gender: 'L' | 'P';
  // Allocation results
  roomId?: string;
  roomName?: string;
  seatNumber?: number;
  participantNo?: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  columns: number;
  building: string;
  invigilator1: string;
  invigilator2?: string;
}

export interface ExamScheduleItem {
  id: string;
  day: string;
  date: string;
  time: string;
  subject: string;
  grade: string;
  roomNotes?: string;
}

export type SortMethod = 'nis-asc' | 'nis-desc' | 'nis-cross-class' | 'nis-odd-even';

export interface ExamSettings {
  // Kop Surat Identitas
  governmentName: string;
  educationDept: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  postalCode: string;
  logoLeftPemda: string;
  logoRightSchool: string;

  // Ujian Info
  examTitle: string;
  activityName: string;
  academicYear: string;
  examDate: string;
  examSession: string;
  participantPrefix: string;
  sortMethod: SortMethod;

  // Pejabat Penandatangan
  headmaster: string;
  headmasterNip: string;
  committeeHead: string;
  committeeNip: string;

  // Aturan Kursi Ruang
  defaultRoomCapacity: number;
  defaultRoomColumns: number;
  maxSeatRule: number;
  uniformCapacityMode: boolean;
}

export interface AllocationSummary {
  totalStudents: number;
  allocatedStudents: number;
  unallocatedStudents: number;
  totalRooms: number;
  totalCapacity: number;
  remainingCapacity: number;
  roomBreakdowns: {
    room: Room;
    allocatedCount: number;
    occupancyRate: number;
    nisMin?: string;
    nisMax?: string;
  }[];
}
