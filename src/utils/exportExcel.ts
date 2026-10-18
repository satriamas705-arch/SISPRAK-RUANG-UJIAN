import * as XLSX from 'xlsx';
import { Student, Room, ExamSettings } from '../types';

/**
 * Exports complete exam room allocation to Excel (.xlsx) with multiple organized sheets:
 * 1. Rekapitulasi Alokasi (Summary)
 * 2. Master Seluruh Siswa (Master list)
 * 3. Individual sheets for each room with signature lines
 */
export function exportAllocationToExcel(
  students: Student[],
  rooms: Room[],
  settings: ExamSettings
): void {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: REKAPITULASI ALOKASI ---
  const rekapData: (string | number)[][] = [
    [settings.schoolName],
    [settings.examTitle],
    [`Tahun Ajaran: ${settings.academicYear} | Tanggal: ${settings.examDate}`],
    [],
    ['REKAPITULASI PEMBAGIAN RUANG UJIAN'],
    [],
    [
      'No',
      'Kode',
      'Nama Ruang',
      'Lokasi / Gedung',
      'Kapasitas',
      'Terisi',
      'Sisa Kursi',
      'Pengawas 1',
      'Pengawas 2',
      'Rentang NIS',
    ],
  ];

  let totalCap = 0;
  let totalFilled = 0;

  rooms.forEach((room, idx) => {
    const roomStudents = students.filter((s) => s.roomId === room.id);
    const filled = roomStudents.length;
    const remaining = Math.max(0, room.capacity - filled);
    totalCap += room.capacity;
    totalFilled += filled;

    const nisList = roomStudents.map((s) => s.nis).sort();
    const nisRange =
      nisList.length > 0 ? `${nisList[0]} s/d ${nisList[nisList.length - 1]}` : '-';

    rekapData.push([
      idx + 1,
      room.code,
      room.name,
      room.building,
      room.capacity,
      filled,
      remaining,
      room.invigilator1,
      room.invigilator2 || '-',
      nisRange,
    ]);
  });

  rekapData.push([]);
  rekapData.push([
    '',
    'TOTAL',
    `${rooms.length} Ruangan`,
    '',
    totalCap,
    totalFilled,
    Math.max(0, totalCap - totalFilled),
    '',
    '',
    '',
  ]);

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);
  // Column widths
  wsRekap['!cols'] = [
    { wch: 5 },
    { wch: 8 },
    { wch: 16 },
    { wch: 22 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi');

  // --- SHEET 2: MASTER SELURUH SISWA ---
  const masterHeaders = [
    'No',
    'Nomor Peserta',
    'NIS',
    'NISN',
    'Nama Lengkap Siswa',
    'L/P',
    'Kelas',
    'Ruang Ujian',
    'No Meja',
  ];

  const masterRows = students.map((s, idx) => [
    idx + 1,
    s.participantNo || 'Belum Dialokasikan',
    s.nis,
    s.nisn || '-',
    s.name,
    s.gender,
    s.className,
    s.roomName || 'Belum Ada',
    s.seatNumber ? `Meja ${String(s.seatNumber).padStart(2, '0')}` : '-',
  ]);

  const masterData = [
    [settings.schoolName],
    [`MASTER DATA PESERTA UJIAN - ${settings.examTitle}`],
    [],
    masterHeaders,
    ...masterRows,
  ];

  const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
  wsMaster['!cols'] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 32 },
    { wch: 6 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master Peserta');

  // --- SHEET 3..N: PER RUANGAN (DAFTAR HADIR RESMI) ---
  rooms.forEach((room) => {
    const roomStudents = students
      .filter((s) => s.roomId === room.id)
      .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));

    const roomSheetName = room.name.replace(/[^a-zA-Z0-9]/g, ' ').trim().slice(0, 30);

    const roomHeader: (string | number)[][] = [
      [settings.schoolName],
      [settings.examTitle],
      [`DAFTAR HADIR & PESERTA UJIAN - ${room.name.toUpperCase()}`],
      [`Lokasi: ${room.building} | Pengawas 1: ${room.invigilator1} ${room.invigilator2 ? '| Pengawas 2: ' + room.invigilator2 : ''}`],
      [`Tanggal: ${settings.examDate} | Sesi: ${settings.examSession}`],
      [],
      [
        'No',
        'No Kursi',
        'No Peserta',
        'NIS',
        'Nama Lengkap Siswa',
        'L/P',
        'Kelas',
        'Tanda Tangan Ganjil',
        'Tanda Tangan Genap',
        'Keterangan',
      ],
    ];

    const capacity = Math.max(1, room.capacity);
    for (let seat = 1; seat <= capacity; seat++) {
      const student = roomStudents.find((s) => s.seatNumber === seat);
      const isOdd = seat % 2 !== 0;

      if (student) {
        roomHeader.push([
          seat,
          seat,
          student.participantNo || '-',
          student.nis,
          student.name,
          student.gender,
          student.className,
          isOdd ? `${seat}. ....................` : '',
          !isOdd ? `${seat}. ....................` : '',
          'Hadir',
        ]);
      } else {
        roomHeader.push([
          seat,
          seat,
          '-',
          '-',
          '[ KURSI KOSONG / TERSEDIA ]',
          '-',
          '-',
          '--------------------',
          '--------------------',
          'Kosong',
        ]);
      }
    }

    // Add signature space
    roomHeader.push([]);
    roomHeader.push([]);
    roomHeader.push([
      '',
      '',
      '',
      '',
      'Pengawas Ruang 1,',
      '',
      '',
      '',
      'Pengawas Ruang 2,',
    ]);
    roomHeader.push([]);
    roomHeader.push([]);
    roomHeader.push([
      '',
      '',
      '',
      '',
      `( ${room.invigilator1} )`,
      '',
      '',
      '',
      `( ${room.invigilator2 || '........................'} )`,
    ]);

    const wsRoom = XLSX.utils.aoa_to_sheet(roomHeader);
    wsRoom['!cols'] = [
      { wch: 5 },
      { wch: 10 },
      { wch: 16 },
      { wch: 12 },
      { wch: 30 },
      { wch: 6 },
      { wch: 12 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsRoom, roomSheetName);
  });

  // Save Excel file
  const fileName = `Alokasi_Ruang_Ujian_${settings.schoolName.replace(/\s+/g, '_').slice(0, 20)}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Downloads a clean Excel template for importing students
 */
export function exportStudentTemplateExcel(): void {
  const wb = XLSX.utils.book_new();
  const templateData = [
    ['NIS', 'Nama Lengkap', 'Kelas', 'Jenis Kelamin (L/P)', 'NISN (Opsional)'],
    ['240101', 'Ahmad Dhani Prakoso', 'X MIPA 1', 'L', '0089100001'],
    ['240102', 'Bunga Citra Lestari', 'X MIPA 1', 'P', '0089100002'],
    ['240103', 'Cahya Ramadhani', 'X MIPA 1', 'L', '0089100003'],
    ['240201', 'Dewi Sartika Putri', 'X MIPA 2', 'P', '0089100004'],
    ['240202', 'Eko Prasetyo Utomo', 'X MIPA 2', 'L', '0089100005'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.writeFile(wb, 'Template_Data_Siswa_Ujian.xlsx');
}

/**
 * Parses uploaded Excel or CSV file into Student array
 */
export async function parseStudentsFromExcel(file: File): Promise<Student[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
  });

  if (!rawRows || rawRows.length < 2) {
    throw new Error('File Excel tidak memiliki data atau baris header.');
  }

  // Find header row indices
  const headerRow = (rawRows[0] || []).map((h) => String(h).trim().toLowerCase());
  
  let nisIdx = headerRow.findIndex((h) => h.includes('nis') && !h.includes('nisn'));
  if (nisIdx === -1) nisIdx = headerRow.findIndex((h) => h.includes('nis'));
  const nisnIdx = headerRow.findIndex((h) => h.includes('nisn'));
  const nameIdx = headerRow.findIndex((h) => h.includes('nama'));
  const classIdx = headerRow.findIndex((h) => h.includes('kelas') || h.includes('rombel'));
  const genderIdx = headerRow.findIndex((h) => h.includes('kelamin') || h.includes('jk') || h.includes('gender'));

  if (nisIdx === -1 && nameIdx === -1) {
    throw new Error('Kolom NIS dan Nama Siswa tidak ditemukan pada baris judul file Excel.');
  }

  const students: Student[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawNis = nisIdx !== -1 ? String(row[nisIdx] || '').trim() : '';
    const rawName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
    if (!rawNis && !rawName) continue; // Skip empty row

    const rawClass = classIdx !== -1 ? String(row[classIdx] || '').trim() : 'Umum';
    const rawGender = genderIdx !== -1 ? String(row[genderIdx] || '').trim().toUpperCase() : 'L';
    const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' || rawGender === 'W' ? 'P' : 'L';
    const rawNisn = nisnIdx !== -1 ? String(row[nisnIdx] || '').trim() : undefined;

    students.push({
      id: `std-upload-${Date.now()}-${r}`,
      nis: rawNis || `NIS-${r}`,
      nisn: rawNisn,
      name: rawName || `Siswa ${r}`,
      className: rawClass || 'Kelas X',
      gender,
    });
  }

  return students;
}
