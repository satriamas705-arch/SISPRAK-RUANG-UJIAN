import { Student, Room, ExamSettings, SortMethod, AllocationSummary } from '../types';

/**
 * Natural comparison for NIS (works for numeric string like '240101' as well as alphanumeric)
 */
function compareNis(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Orders students based on chosen algorithm
 */
export function sortStudentsByMethod(students: Student[], method: SortMethod): Student[] {
  const cloned = [...students];

  switch (method) {
    case 'nis-asc':
      return cloned.sort((a, b) => compareNis(a.nis, b.nis));

    case 'nis-desc':
      return cloned.sort((a, b) => compareNis(b.nis, a.nis));

    case 'nis-cross-class': {
      // Group by class
      const classMap: Record<string, Student[]> = {};
      for (const student of cloned) {
        if (!classMap[student.className]) {
          classMap[student.className] = [];
        }
        classMap[student.className].push(student);
      }

      // Sort each class by NIS ascending
      const classNames = Object.keys(classMap).sort();
      for (const cls of classNames) {
        classMap[cls].sort((a, b) => compareNis(a.nis, b.nis));
      }

      // Interleave / round-robin from each class
      const result: Student[] = [];
      let hasMore = true;
      let index = 0;

      while (hasMore) {
        hasMore = false;
        for (const cls of classNames) {
          const list = classMap[cls];
          if (index < list.length) {
            result.push(list[index]);
            hasMore = true;
          }
        }
        index++;
      }
      return result;
    }

    case 'nis-odd-even': {
      // Group by odd / even last digit of NIS
      const odds: Student[] = [];
      const evens: Student[] = [];

      for (const student of cloned) {
        const lastChar = student.nis.trim().slice(-1);
        const lastDigit = parseInt(lastChar, 10);
        if (!isNaN(lastDigit) && lastDigit % 2 === 0) {
          evens.push(student);
        } else {
          odds.push(student);
        }
      }

      odds.sort((a, b) => compareNis(a.nis, b.nis));
      evens.sort((a, b) => compareNis(a.nis, b.nis));

      const result: Student[] = [];
      const maxLen = Math.max(odds.length, evens.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < odds.length) result.push(odds[i]);
        if (i < evens.length) result.push(evens[i]);
      }
      return result;
    }

    default:
      return cloned.sort((a, b) => compareNis(a.nis, b.nis));
  }
}

/**
 * Automatically allocates students to rooms and assigns seat & participant numbers
 */
export function allocateStudentsToRooms(
  students: Student[],
  rooms: Room[],
  settings: ExamSettings
): { allocatedStudents: Student[]; summary: AllocationSummary } {
  // Sort students according to selected NIS method
  const sortedStudents = sortStudentsByMethod(students, settings.sortMethod);

  const prefix = settings.participantPrefix || 'UJN';
  const allocatedStudents: Student[] = [];
  let studentIdx = 0;

  const roomBreakdowns: AllocationSummary['roomBreakdowns'] = [];

  for (const room of rooms) {
    const roomStudents: Student[] = [];
    const capacity = Math.max(1, room.capacity);

    for (let seat = 1; seat <= capacity && studentIdx < sortedStudents.length; seat++) {
      const student = sortedStudents[studentIdx];
      const seatNoFormatted = String(seat).padStart(2, '0');
      const participantNo = `${prefix}-${room.code}-${seatNoFormatted}`;

      const updatedStudent: Student = {
        ...student,
        roomId: room.id,
        roomName: room.name,
        seatNumber: seat,
        participantNo,
      };

      roomStudents.push(updatedStudent);
      allocatedStudents.push(updatedStudent);
      studentIdx++;
    }

    // NIS min & max for room summary
    const roomNisList = roomStudents.map((s) => s.nis).sort(compareNis);
    const nisMin = roomNisList[0];
    const nisMax = roomNisList[roomNisList.length - 1];

    roomBreakdowns.push({
      room,
      allocatedCount: roomStudents.length,
      occupancyRate: Math.round((roomStudents.length / capacity) * 100),
      nisMin,
      nisMax,
    });
  }

  // Any remaining students that didn't fit into rooms
  while (studentIdx < sortedStudents.length) {
    const unallocated = sortedStudents[studentIdx];
    allocatedStudents.push({
      ...unallocated,
      roomId: undefined,
      roomName: undefined,
      seatNumber: undefined,
      participantNo: undefined,
    });
    studentIdx++;
  }

  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalAllocated = allocatedStudents.filter((s) => s.roomId).length;
  const unallocatedStudents = allocatedStudents.filter((s) => !s.roomId).length;

  const summary: AllocationSummary = {
    totalStudents: students.length,
    allocatedStudents: totalAllocated,
    unallocatedStudents,
    totalRooms: rooms.length,
    totalCapacity,
    remainingCapacity: Math.max(0, totalCapacity - totalAllocated),
    roomBreakdowns,
  };

  return { allocatedStudents, summary };
}
