import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building2, Armchair, Users, Check } from 'lucide-react';
import { Room } from '../types';

interface RoomManagementProps {
  rooms: Room[];
  onAddRoom: (room: Omit<Room, 'id'>) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  rooms,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCapacity, setFormCapacity] = useState(24);
  const [formColumns, setFormColumns] = useState(4);
  const [formBuilding, setFormBuilding] = useState('Gedung A - Lantai 1');
  const [formInvigilator1, setFormInvigilator1] = useState('');
  const [formInvigilator2, setFormInvigilator2] = useState('');

  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);

  const openAddModal = () => {
    setEditingRoom(null);
    const nextNum = rooms.length + 1;
    const formattedNum = String(nextNum).padStart(2, '0');
    setFormName(`Ruang ${formattedNum}`);
    setFormCode(`R${formattedNum}`);
    setFormCapacity(24);
    setFormColumns(4);
    setFormBuilding('Gedung A - Lantai 1');
    setFormInvigilator1('');
    setFormInvigilator2('');
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormCode(room.code);
    setFormCapacity(room.capacity);
    setFormColumns(room.columns);
    setFormBuilding(room.building);
    setFormInvigilator1(room.invigilator1);
    setFormInvigilator2(room.invigilator2 || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (editingRoom) {
      onEditRoom({
        ...editingRoom,
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        capacity: Number(formCapacity) || 20,
        columns: Number(formColumns) || 4,
        building: formBuilding.trim(),
        invigilator1: formInvigilator1.trim() || 'Pengawas Ruang',
        invigilator2: formInvigilator2.trim() || undefined,
      });
    } else {
      onAddRoom({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        capacity: Number(formCapacity) || 20,
        columns: Number(formColumns) || 4,
        building: formBuilding.trim(),
        invigilator1: formInvigilator1.trim() || 'Pengawas Ruang',
        invigilator2: formInvigilator2.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Kelola Ruangan Ujian
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Atur kapasitas meja, pengawas, denah kolom, dan gedung pelaksanaan
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Ruangan Baru</span>
        </button>
      </div>

      {/* Quick stats */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-500">
            Total Ruangan: <strong className="text-slate-900 font-mono">{rooms.length}</strong> ruang
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            Daya Tampung Total: <strong className="text-slate-900 font-mono">{totalCapacity}</strong> kursi
          </span>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                    {room.code}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{room.name}</h3>
                    <p className="text-xs text-slate-500">{room.building}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {room.capacity}
                  </span>
                  <span className="text-2xs text-slate-500 block">Kursi</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tata Letak Kolom:</span>
                  <span className="font-medium text-slate-800">{room.columns} Kolom Meja</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengawas 1:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px]" title={room.invigilator1}>
                    {room.invigilator1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengawas 2:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px]" title={room.invigilator2}>
                    {room.invigilator2 || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(room)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              {rooms.length > 1 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus ruangan ${room.name}?`)) {
                      onDeleteRoom(room.id);
                    }
                  }}
                  className="px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded transition-colors"
                  title="Hapus Ruangan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoom ? 'Edit Data Ruangan' : 'Tambah Ruang Ujian Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ruang *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Ruang 01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Ruang *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Contoh: R01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:border-slate-900 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas Kursi *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Kolom Meja *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    required
                    value={formColumns}
                    onChange={(e) => setFormColumns(parseInt(e.target.value, 10) || 4)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi / Gedung
                </label>
                <input
                  type="text"
                  value={formBuilding}
                  onChange={(e) => setFormBuilding(e.target.value)}
                  placeholder="Contoh: Gedung A - Lantai 1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pengawas Ruang 1
                </label>
                <input
                  type="text"
                  value={formInvigilator1}
                  onChange={(e) => setFormInvigilator1(e.target.value)}
                  placeholder="Nama & Gelar Pengawas 1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pengawas Ruang 2 (Opsional)
                </label>
                <input
                  type="text"
                  value={formInvigilator2}
                  onChange={(e) => setFormInvigilator2(e.target.value)}
                  placeholder="Nama & Gelar Pengawas 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
