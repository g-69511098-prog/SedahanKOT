import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Award,
  PlusCircle,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { SportEvent, TournamentConfig } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface EventsTabProps {
  config: TournamentConfig;
  events: SportEvent[];
  onUpdateEvent: (id: string, updated: Partial<SportEvent>) => void;
  onAddEvent: (newEvent: Omit<SportEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
  config,
  events,
  onUpdateEvent,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [selectedSession, setSelectedSession] = useState<'all' | 'Hari 1' | 'Hari 2'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showOriginalImage, setShowOriginalImage] = useState<boolean>(false);

  // Form State
  const [session, setSession] = useState<'Hari 1' | 'Hari 2'>('Hari 1');
  const [bil, setBil] = useState<number>(1);
  const [time, setTime] = useState<string>('08:00');
  const [name, setName] = useState<string>('');
  const [categoryGender, setCategoryGender] = useState<'LELAKI' | 'PEREMPUAN' | 'CAMPURAN' | 'L/P'>('LELAKI');
  const [categoryAge, setCategoryAge] = useState<string>('TAHUN 3/4/5');
  const [kind, setKind] = useState<'Balapan' | 'Padang'>('Balapan');
  const [type, setType] = useState<'Individu' | 'Berpasukan'>('Individu');
  const [currentRecord, setCurrentRecord] = useState<string>('');
  const [recordHolder, setRecordHolder] = useState<string>('');
  const [unit, setUnit] = useState<'s' | 'm' | 'min'>('s');

  const filteredEvents = events.filter((ev) => {
    if (selectedSession !== 'all' && ev.session !== selectedSession) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingEventId(null);
    setSession('Hari 1');
    setBil(events.length + 1);
    setTime('08:00');
    setName('');
    setCategoryGender('LELAKI');
    setCategoryAge('TAHUN 3/4/5');
    setKind('Balapan');
    setType('Individu');
    setCurrentRecord('');
    setRecordHolder('');
    setUnit('s');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: SportEvent) => {
    setEditingEventId(ev.id);
    setSession(ev.session);
    setBil(ev.bil);
    setTime(ev.time);
    setName(ev.name);
    setCategoryGender(ev.categoryGender);
    setCategoryAge(ev.categoryAge);
    setKind(ev.kind);
    setType(ev.type);
    setCurrentRecord(ev.currentRecord || '');
    setRecordHolder(ev.recordHolder || '');
    setUnit(ev.unit);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingEventId) {
      onUpdateEvent(editingEventId, {
        session,
        bil,
        time,
        name: name.trim().toUpperCase(),
        categoryGender,
        categoryAge,
        kind,
        type,
        currentRecord: currentRecord.trim() || undefined,
        recordHolder: recordHolder.trim() || undefined,
        unit,
      });
    } else {
      onAddEvent({
        session,
        bil,
        time,
        name: name.trim().toUpperCase(),
        categoryGender,
        categoryAge,
        kind,
        type,
        currentRecord: currentRecord.trim() || undefined,
        recordHolder: recordHolder.trim() || undefined,
        unit,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Image Reference Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 mb-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              Susunan Jadual Acara Kejohanan
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Senarai Acara Padang & Balapan (SK Mandahan)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Berdasarkan jadual rasmi kejohanan. Anda boleh menyunting masa, kategori umur, rekod
              semasa, atau menambah acara baharu untuk tahun-tahun seterusnya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowOriginalImage(!showOriginalImage)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>{showOriginalImage ? 'Sembunyi Gambar Asal' : 'Lihat Gambar Jadual Asal'}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Acara Baharu
            </button>
          </div>
        </div>

        {/* Original Attached Image Viewer Modal/Drawer */}
        {showOriginalImage && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Gambar Rujukan Jadual Acara Asal Pengguna
              </span>
              <button
                onClick={() => setShowOriginalImage(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-96 flex items-center justify-center bg-black/40">
              <img
                src="/assets/aistudio/IMG-20261022-WA0039_e5725a88.jpg"
                alt="Jadual Asal SK Mandahan"
                className="max-h-96 object-contain"
              />
            </div>
          </div>
        )}

        {/* Session Filter Tabs */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setSelectedSession('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedSession === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Acara ({events.length})
          </button>
          <button
            onClick={() => setSelectedSession('Hari 1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedSession === 'Hari 1'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {config.day1Title} ({events.filter((e) => e.session === 'Hari 1').length})
          </button>
          <button
            onClick={() => setSelectedSession('Hari 2')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedSession === 'Hari 2'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {config.day2Title} ({events.filter((e) => e.session === 'Hari 2').length})
          </button>
        </div>
      </div>

      {/* Events List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 uppercase font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">Bil</th>
                <th className="py-3 px-4 w-20 text-center">Masa</th>
                <th className="py-3 px-4">Nama Acara</th>
                <th className="py-3 px-4">Kategori & Jantina</th>
                <th className="py-3 px-4 text-center">Jenis Acara</th>
                <th className="py-3 px-4">Rekod Kejohanan Semasa</th>
                <th className="py-3 px-4 text-center w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-700">
                    {ev.bil}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {ev.time}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    <div className="flex flex-col">
                      <span>{ev.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {ev.session} &bull; Acara {ev.kind}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700">
                      {ev.categoryGender}
                    </span>{' '}
                    <span className="text-slate-500">({ev.categoryAge})</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.type === 'Individu'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {ev.currentRecord ? (
                      <div className="text-[11px]">
                        <span className="font-bold font-mono text-amber-800">
                          {ev.currentRecord} {ev.unit}
                        </span>
                        {ev.recordHolder && (
                          <span className="text-slate-500 block text-[10px]">
                            {ev.recordHolder} ({ev.recordYear || 'Rekod'})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Sunting Acara"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Padam Acara',
                            message: `Adakah anda pasti mahu memadam acara "${ev.name}" (${ev.categoryGender} - ${ev.categoryAge})?`,
                            onConfirm: () => onDeleteEvent(ev.id),
                          });
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Padam Acara"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              {editingEventId ? 'Sunting Maklumat Acara' : 'Tambah Acara Baharu'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sesi / Hari</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value as 'Hari 1' | 'Hari 2')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Hari 1">{config.day1Title}</option>
                    <option value="Hari 2">{config.day2Title}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Bilangan</label>
                  <input
                    type="number"
                    min="1"
                    value={bil}
                    onChange={(e) => setBil(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Masa</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="08:00 atau 10:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Padang / Balapan</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as 'Balapan' | 'Padang')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Balapan">Balapan (Larian)</option>
                    <option value="Padang">Padang (Lompat / Lontar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Acara</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cth: 100M TAHUN 3/4/5 (AKHIR)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jantina</label>
                  <select
                    value={categoryGender}
                    onChange={(e) => setCategoryGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="LELAKI">LELAKI</option>
                    <option value="PEREMPUAN">PEREMPUAN</option>
                    <option value="CAMPURAN">CAMPURAN</option>
                    <option value="L/P">L/P</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Umur/Kelas</label>
                  <input
                    type="text"
                    value={categoryAge}
                    onChange={(e) => setCategoryAge(e.target.value)}
                    placeholder="TAHUN 3/4/5"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Individu' | 'Berpasukan')}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Individu">Individu</option>
                    <option value="Berpasukan">Berpasukan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Rekod Semasa</label>
                  <input
                    type="text"
                    value={currentRecord}
                    onChange={(e) => setCurrentRecord(e.target.value)}
                    placeholder="13.60 atau 3.90"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 's' | 'm' | 'min')}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="s">Saat (s)</option>
                    <option value="m">Meter (m)</option>
                    <option value="min">Minit (min)</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Pemegang Rekod</label>
                  <input
                    type="text"
                    value={recordHolder}
                    onChange={(e) => setRecordHolder(e.target.value)}
                    placeholder="Nama & Rumah"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingEventId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Ya, Padam Acara"
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
