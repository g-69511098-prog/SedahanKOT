import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  Users,
  CheckCircle,
} from 'lucide-react';
import { AthleteRegistration, House, SportEvent } from '../types';
import {
  validateAthleteLimits,
  getAthleteParticipation,
} from '../utils/rules';
import { AthleteLimitBadge } from './AthleteLimitBadge';
import { ConfirmModal } from './ConfirmModal';

interface RegistrationTabProps {
  houses: House[];
  events: SportEvent[];
  registrations: AthleteRegistration[];
  onAddRegistration: (reg: Omit<AthleteRegistration, 'id'>) => { success: boolean; message?: string };
  onUpdateRegistration: (id: string, updated: Partial<AthleteRegistration>) => { success: boolean; message?: string };
  onDeleteRegistration: (id: string) => void;
  onClearRegistrations: () => void;
}

export const RegistrationTab: React.FC<RegistrationTabProps> = ({
  houses,
  events,
  registrations,
  onAddRegistration,
  onUpdateRegistration,
  onDeleteRegistration,
  onClearRegistrations,
}) => {
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string>('all');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formEventId, setFormEventId] = useState<string>(events[0]?.id || '');
  const [formHouseId, setFormHouseId] = useState<string>(houses[0]?.id || '');
  const [formAthleteName, setFormAthleteName] = useState<string>('');
  const [formBibNumber, setFormBibNumber] = useState<string>('');
  const [formClassName, setFormClassName] = useState<string>('');
  const [formLaneOrTurn, setFormLaneOrTurn] = useState<string>('1');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Pre-calculated stats
  const totalAthletes = useMemo(() => {
    const unique = new Set(registrations.map((r) => r.athleteName.trim().toUpperCase()));
    return unique.size;
  }, [registrations]);

  // Selected event for form to check type
  const targetEvent = events.find((e) => e.id === formEventId);

  // Real-time limit check as user types athlete name in modal
  const liveParticipation = useMemo(() => {
    if (!formAthleteName.trim()) return null;
    return getAthleteParticipation(
      registrations,
      events,
      formAthleteName,
      editingId || undefined
    );
  }, [formAthleteName, registrations, events, editingId]);

  const handleOpenAddModal = (preselectedEventId?: string, preselectedHouseId?: string) => {
    setEditingId(null);
    setFormEventId(preselectedEventId || events[0]?.id || '');
    setFormHouseId(preselectedHouseId || houses[0]?.id || '');
    setFormAthleteName('');
    setFormBibNumber('');
    setFormClassName('');
    setFormLaneOrTurn('1');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reg: AthleteRegistration) => {
    setEditingId(reg.id);
    setFormEventId(reg.eventId);
    setFormHouseId(reg.houseId);
    setFormAthleteName(reg.athleteName);
    setFormBibNumber(reg.bibNumber || '');
    setFormClassName(reg.className || '');
    setFormLaneOrTurn(reg.laneOrTurn ? String(reg.laneOrTurn) : '1');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAthleteName.trim()) {
      setFormError('Sila masukkan nama atlit atau nama kuartet.');
      return;
    }
    if (!targetEvent) {
      setFormError('Sila pilih acara yang sah.');
      return;
    }

    // Check limit
    const valResult = validateAthleteLimits(
      registrations,
      events,
      formAthleteName,
      targetEvent.type,
      editingId || undefined
    );

    if (!valResult.valid) {
      setFormError(valResult.message || 'Atlit melebihi had kuota acara.');
      return;
    }

    if (editingId) {
      const res = onUpdateRegistration(editingId, {
        eventId: formEventId,
        houseId: formHouseId,
        athleteName: formAthleteName.trim(),
        bibNumber: formBibNumber.trim() || undefined,
        className: formClassName.trim() || undefined,
        laneOrTurn: parseInt(formLaneOrTurn, 10) || undefined,
      });
      if (!res.success) {
        setFormError(res.message || 'Gagal mengemaskini pendaftaran.');
        return;
      }
    } else {
      const res = onAddRegistration({
        eventId: formEventId,
        houseId: formHouseId,
        athleteName: formAthleteName.trim(),
        bibNumber: formBibNumber.trim() || undefined,
        className: formClassName.trim() || undefined,
        laneOrTurn: parseInt(formLaneOrTurn, 10) || undefined,
      });
      if (!res.success) {
        setFormError(res.message || 'Gagal mendaftar atlit.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (selectedHouseFilter !== 'all' && reg.houseId !== selectedHouseFilter) {
        return false;
      }
      if (selectedEventFilter !== 'all' && reg.eventId !== selectedEventFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ev = events.find((e) => e.id === reg.eventId);
        const matchName = reg.athleteName.toLowerCase().includes(q);
        const matchBib = reg.bibNumber?.toLowerCase().includes(q);
        const matchClass = reg.className?.toLowerCase().includes(q);
        const matchEvent = ev?.name.toLowerCase().includes(q);
        if (!matchName && !matchBib && !matchClass && !matchEvent) {
          return false;
        }
      }
      return true;
    });
  }, [registrations, selectedHouseFilter, selectedEventFilter, searchQuery, events]);

  return (
    <div className="space-y-6">
      {/* Top Controls & Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Pendaftaran Atlit Mengikut Acara & Rumah Sukan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Syarat rasmi: <strong>Maksimum 2 Acara Individu</strong> dan{' '}
              <strong>2 Acara Berpasukan</strong> untuk setiap atlit. Sistem akan menyemak dan
              menghalang pendaftaran yang melebihi had kuota.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <UserPlus className="w-4 h-4" />
              Daftar Atlit Baharu
            </button>
            {registrations.length > 0 && (
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Kosongkan Semua Pendaftaran Atlit',
                    message:
                      'Adakah anda pasti mahu memadamkan SEMUA data pendaftaran atlit?\n\nSenarai nama atlit di semua acara akan dikosongkan. Tindakan ini tidak boleh dibatalkan.',
                    confirmText: 'Ya, Kosongkan Semua',
                    variant: 'danger',
                    onConfirm: onClearRegistrations,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
                title="Kosongkan Semua Pendaftaran"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-slate-500 text-xs block">Jumlah Pendaftaran Acara</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {registrations.length}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-slate-500 text-xs block">Bilangan Atlit Unik</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {totalAthletes} orang
            </span>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
            <span className="text-emerald-700 text-xs block font-semibold">Rumah Hijau</span>
            <span className="text-xl font-extrabold text-emerald-900 font-mono">
              {registrations.filter((r) => r.houseId === 'hijau').length} atlit
            </span>
          </div>
          <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-100">
            <span className="text-rose-700 text-xs block font-semibold">Rumah Merah & Biru</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              M:{registrations.filter((r) => r.houseId === 'merah').length} | B:
              {registrations.filter((r) => r.houseId === 'biru').length}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atlit, nombor bib, kelas atau acara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* House Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedHouseFilter}
              onChange={(e) => setSelectedHouseFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Rumah Sukan</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Filter */}
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none max-w-xs"
          >
            <option value="all">Semua Acara ({events.length})</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.session} - {ev.bil}. {ev.name} ({ev.categoryGender})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Athletes List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700">
            Menunjukkan {filteredRegistrations.length} daripada {registrations.length} pendaftaran
          </span>
          <span className="text-[11px] text-slate-500">
            Penunjuk Kuota: <strong>Individu (Maks 2)</strong> |{' '}
            <strong>Berpasukan (Maks 2)</strong>
          </span>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Tiada Pendaftaran Dijumpai</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || selectedHouseFilter !== 'all' || selectedEventFilter !== 'all'
                ? 'Cuba ubah carian atau tetapan penapis anda.'
                : 'Mula daftarkan atlit atau muat naik fail Excel template yang telah diisi.'}
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Daftar Atlit Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">Bil</th>
                  <th className="py-3 px-4">Nama Atlit / Pasukan</th>
                  <th className="py-3 px-4">Rumah Sukan</th>
                  <th className="py-3 px-4">Acara & Kategori</th>
                  <th className="py-3 px-4 text-center">Jenis Acara</th>
                  <th className="py-3 px-4 text-center">Status Kuota (2+2)</th>
                  <th className="py-3 px-4 text-center">Bib / Lorong</th>
                  <th className="py-3 px-4 text-center w-24">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRegistrations.map((reg, idx) => {
                  const ev = events.find((e) => e.id === reg.eventId);
                  const house = houses.find((h) => h.id === reg.houseId);
                  const participation = getAthleteParticipation(
                    registrations,
                    events,
                    reg.athleteName
                  );

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-center text-slate-500 font-mono font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex flex-col">
                          <span>{reg.athleteName}</span>
                          {reg.className && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              Kelas: {reg.className}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {house && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{
                              backgroundColor: `${house.colorHex}15`,
                              color: house.colorHex,
                              border: `1px solid ${house.colorHex}35`,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: house.colorHex }}
                            />
                            {house.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {ev?.name || reg.eventId}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {ev?.session} &bull; {ev?.categoryGender} ({ev?.categoryAge})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ev?.type === 'Individu'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {ev?.type || 'Individu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <AthleteLimitBadge
                          individualCount={participation.individualCount}
                          teamCount={participation.teamCount}
                          compact
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {reg.bibNumber ? `Bib: ${reg.bibNumber}` : ''}
                        {reg.laneOrTurn ? ` [L${reg.laneOrTurn}]` : ''}
                        {!reg.bibNumber && !reg.laneOrTurn && '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(reg)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Kemaskini"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Padam Pendaftaran Atlit',
                                message: `Adakah anda pasti mahu memadam pendaftaran bagi "${reg.athleteName}"?`,
                                confirmText: 'Ya, Padam',
                                variant: 'danger',
                                onConfirm: () => onDeleteRegistration(reg.id),
                              });
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Padam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Athlete Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                {editingId ? 'Kemaskini Pendaftaran Atlit' : 'Daftar Atlit ke Acara'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Event Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Acara <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formEventId}
                  onChange={(e) => setFormEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      [{ev.session} Bil {ev.bil}] {ev.name} ({ev.categoryGender} - {ev.type})
                    </option>
                  ))}
                </select>
                {targetEvent && (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Kategori:</span>
                    <span>
                      {targetEvent.kind} &bull; {targetEvent.type}
                    </span>
                    {targetEvent.currentRecord && (
                      <span className="text-amber-700 font-mono">
                        (Rekod: {targetEvent.currentRecord} {targetEvent.unit})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sports House Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rumah Sukan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {houses.map((h) => (
                    <button
                      type="button"
                      key={h.id}
                      onClick={() => setFormHouseId(h.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        formHouseId === h.id
                          ? 'ring-2 ring-indigo-500 border-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                      style={{
                        backgroundColor: formHouseId === h.id ? `${h.colorHex}20` : undefined,
                        color: formHouseId === h.id ? h.colorHex : undefined,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: h.colorHex }}
                      />
                      <span>{h.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Athlete Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penuh Atlit / Nama Pasukan Kuartet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formAthleteName}
                  onChange={(e) => setFormAthleteName(e.target.value)}
                  placeholder="Cth: MUHAMMAD HAZIQ BIN AZLAN atau KUARTET MERAH A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                  required
                />

                {/* Real-time Quota Indicator */}
                {liveParticipation && formAthleteName.trim().length > 2 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700">Status Kuota Atlit:</span>
                      <AthleteLimitBadge
                        individualCount={liveParticipation.individualCount}
                        teamCount={liveParticipation.teamCount}
                      />
                    </div>
                    {targetEvent?.type === 'Individu' && liveParticipation.individualCount >= 2 && (
                      <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Amaran: Atlit ini telah mencapai had 2 acara individu!
                      </div>
                    )}
                    {targetEvent?.type === 'Berpasukan' && liveParticipation.teamCount >= 2 && (
                      <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Amaran: Atlit ini telah mencapai had 2 acara berpasukan!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bib, Class, Lane */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Bib / Peserta
                  </label>
                  <input
                    type="text"
                    value={formBibNumber}
                    onChange={(e) => setFormBibNumber(e.target.value)}
                    placeholder="Cth: H101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    placeholder="Cth: 5 ARIF"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {targetEvent?.kind === 'Balapan' ? 'No. Lorong (1-8)' : 'Giliran (1-12)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formLaneOrTurn}
                    onChange={(e) => setFormLaneOrTurn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? 'Simpan Perubahan' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
