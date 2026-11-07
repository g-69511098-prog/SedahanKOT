import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, X, Flame } from 'lucide-react';
import { EventResult, House, SportEvent, WinnerPlacement } from '../types';
import { checkIsNewRecord } from '../utils/rules';

interface ManualResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SportEvent[];
  houses: House[];
  results: EventResult[];
  preselectedEventId?: string;
  onSaveResult: (result: EventResult) => void;
}

export const ManualResultModal: React.FC<ManualResultModalProps> = ({
  isOpen,
  onClose,
  events,
  houses,
  results,
  preselectedEventId,
  onSaveResult,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    preselectedEventId || events[0]?.id || ''
  );

  const [goldAthlete, setGoldAthlete] = useState<string>('');
  const [goldHouse, setGoldHouse] = useState<string>(houses[0]?.id || 'hijau');
  const [goldScore, setGoldScore] = useState<string>('');

  const [silverAthlete, setSilverAthlete] = useState<string>('');
  const [silverHouse, setSilverHouse] = useState<string>(houses[1]?.id || 'merah');
  const [silverScore, setSilverScore] = useState<string>('');

  const [bronzeAthlete, setBronzeAthlete] = useState<string>('');
  const [bronzeHouse, setBronzeHouse] = useState<string>(houses[2]?.id || 'biru');
  const [bronzeScore, setBronzeScore] = useState<string>('');

  const [notes, setNotes] = useState<string>('');

  // Load existing result if available
  useEffect(() => {
    if (preselectedEventId) {
      setSelectedEventId(preselectedEventId);
    }
  }, [preselectedEventId]);

  useEffect(() => {
    const existing = results.find((r) => r.eventId === selectedEventId);
    if (existing) {
      const g = existing.winners.find((w) => w.position === 1);
      const s = existing.winners.find((w) => w.position === 2);
      const b = existing.winners.find((w) => w.position === 3);

      setGoldAthlete(g?.athleteName || '');
      setGoldHouse(g?.houseId || 'hijau');
      setGoldScore(g?.score || '');

      setSilverAthlete(s?.athleteName || '');
      setSilverHouse(s?.houseId || 'merah');
      setSilverScore(s?.score || '');

      setBronzeAthlete(b?.athleteName || '');
      setBronzeHouse(b?.houseId || 'biru');
      setBronzeScore(b?.score || '');

      setNotes(existing.notes || '');
    } else {
      setGoldAthlete('');
      setGoldScore('');
      setSilverAthlete('');
      setSilverScore('');
      setBronzeAthlete('');
      setBronzeScore('');
      setNotes('');
    }
  }, [selectedEventId, results]);

  if (!isOpen) return null;

  const currentEvent = events.find((e) => e.id === selectedEventId);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if gold score breaks current record
  const isGoldRecord =
    currentEvent && goldScore
      ? checkIsNewRecord(currentEvent.currentRecord, goldScore, currentEvent.kind)
      : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goldAthlete.trim()) {
      setErrorMessage('Sila masukkan sekurang-kurangnya nama pemenang pingat Emas.');
      return;
    }
    setErrorMessage(null);

    const winners: WinnerPlacement[] = [];

    if (goldAthlete.trim()) {
      winners.push({
        position: 1,
        athleteName: goldAthlete.trim().toUpperCase(),
        houseId: goldHouse,
        score: goldScore.trim() || '-',
        isNewRecord: isGoldRecord,
        notes: isGoldRecord ? 'Memecahkan Rekod Kejohanan!' : undefined,
      });
    }

    if (silverAthlete.trim()) {
      winners.push({
        position: 2,
        athleteName: silverAthlete.trim().toUpperCase(),
        houseId: silverHouse,
        score: silverScore.trim() || '-',
      });
    }

    if (bronzeAthlete.trim()) {
      winners.push({
        position: 3,
        athleteName: bronzeAthlete.trim().toUpperCase(),
        houseId: bronzeHouse,
        score: bronzeScore.trim() || '-',
      });
    }

    const res: EventResult = {
      eventId: selectedEventId,
      completedAt: new Date().toISOString(),
      winners,
      notes: notes.trim() || undefined,
    };

    onSaveResult(res);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">
              Catatan Keputusan Acara Rasmi
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
              {errorMessage}
            </div>
          )}

          {/* Event Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Acara</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  [{ev.session} Bil {ev.bil}] {ev.name} ({ev.categoryGender} - {ev.type})
                </option>
              ))}
            </select>
            {currentEvent && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Jenis: {currentEvent.kind} &bull; {currentEvent.type}
                </span>
                <span className="font-mono text-amber-800">
                  Rekod Semasa:{' '}
                  <strong>
                    {currentEvent.currentRecord
                      ? `${currentEvent.currentRecord} ${currentEvent.unit}`
                      : 'Tiada'}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Gold Winner */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <span>🥇 Pemenang Emas (Tempat 1)</span>
                {isGoldRecord && (
                  <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-black flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-amber-700" /> REKOD BAHARU!
                  </span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={goldAthlete}
                onChange={(e) => setGoldAthlete(e.target.value)}
                placeholder="Nama Atlit / Pasukan Emas"
                className="col-span-6 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white uppercase font-bold"
                required
              />
              <select
                value={goldHouse}
                onChange={(e) => setGoldHouse(e.target.value)}
                className="col-span-3 px-2 py-1.5 rounded-lg border border-amber-200 bg-white font-semibold"
              >
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={goldScore}
                onChange={(e) => setGoldScore(e.target.value)}
                placeholder={currentEvent?.kind === 'Balapan' ? '13.35s' : '3.80m'}
                className="col-span-3 px-2 py-1.5 rounded-lg border border-amber-200 bg-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Silver Winner */}
          <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">🥈 Pemenang Perak (Tempat 2)</span>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={silverAthlete}
                onChange={(e) => setSilverAthlete(e.target.value)}
                placeholder="Nama Atlit / Pasukan Perak"
                className="col-span-6 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white uppercase font-semibold"
              />
              <select
                value={silverHouse}
                onChange={(e) => setSilverHouse(e.target.value)}
                className="col-span-3 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
              >
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={silverScore}
                onChange={(e) => setSilverScore(e.target.value)}
                placeholder="Masa/Jarak"
                className="col-span-3 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
              />
            </div>
          </div>

          {/* Bronze Winner */}
          <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200 space-y-2">
            <span className="font-bold text-amber-900 block">🥉 Pemenang Gangsa (Tempat 3)</span>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={bronzeAthlete}
                onChange={(e) => setBronzeAthlete(e.target.value)}
                placeholder="Nama Atlit / Pasukan Gangsa"
                className="col-span-6 px-2.5 py-1.5 rounded-lg border border-orange-200 bg-white uppercase font-semibold"
              />
              <select
                value={bronzeHouse}
                onChange={(e) => setBronzeHouse(e.target.value)}
                className="col-span-3 px-2 py-1.5 rounded-lg border border-orange-200 bg-white font-semibold"
              >
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={bronzeScore}
                onChange={(e) => setBronzeScore(e.target.value)}
                placeholder="Masa/Jarak"
                className="col-span-3 px-2 py-1.5 rounded-lg border border-orange-200 bg-white font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Catatan Tambahan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cth: Angin kencang, saringan akhir, dsb."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan Keputusan Rasmi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
