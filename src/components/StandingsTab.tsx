import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { House, HouseStanding, SportEvent, TournamentConfig, EventResult } from '../types';

interface StandingsTabProps {
  config: TournamentConfig;
  houses: House[];
  standings: HouseStanding[];
  events: SportEvent[];
  results: EventResult[];
  onOpenAiScanner: () => void;
  onOpenManualResult: (eventId?: string) => void;
  onDeleteResult: (eventId: string) => void;
  onClearResults?: () => void;
}

export const StandingsTab: React.FC<StandingsTabProps> = ({
  config,
  houses,
  standings,
  events,
  results,
  onOpenAiScanner,
  onOpenManualResult,
  onDeleteResult,
  onClearResults,
}) => {
  const leader = standings[0];
  const maxMedals = Math.max(...standings.map((s) => s.totalMedals), 1);

  // Trigger celebration confetti when viewed if there are recorded medals
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#dc2626', '#2563eb', '#eab308'],
    });
  };

  useEffect(() => {
    if (results.length > 0) {
      triggerConfetti();
    }
  }, []);

  // Collect all broken records across results
  const brokenRecords: {
    event: SportEvent;
    winner: { athleteName: string; houseId: string; score: string; notes?: string };
    oldRecord?: string;
  }[] = [];

  results.forEach((res) => {
    const ev = events.find((e) => e.id === res.eventId);
    if (!ev) return;
    res.winners.forEach((w) => {
      if (w.isNewRecord) {
        brokenRecords.push({
          event: ev,
          winner: w,
          oldRecord: ev.currentRecord ? `${ev.currentRecord} ${ev.unit}` : undefined,
        });
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Hero Banner: Johan Keseluruhan */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Trophy className="w-4 h-4 text-amber-400" />
              Papan Kedudukan Rasmi Kejohanan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {config.title} {config.edition}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              {config.schoolName} &bull; {config.day1Date} - {config.day2Date}. Kedudukan Johan
              Keseluruhan ditentukan mengikut pungutan pingat (Emas, Perak, dan Gangsa).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerConfetti}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Raikan Johan
            </button>
            <button
              onClick={onOpenAiScanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Imbas Keputusan A.I.
            </button>
            <button
              onClick={() => onOpenManualResult()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Catat Manual
            </button>
          </div>
        </div>

        {/* Podium Highlight */}
        {leader && leader.totalMedals > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                style={{ backgroundColor: leader.house.colorHex }}
              >
                1
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-amber-300">
                  Mendahului Carta (Johan Keseluruhan)
                </div>
                <div className="text-xl font-extrabold text-white">
                  {leader.house.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-semibold">
              <div className="text-center">
                <div className="text-slate-400 text-xs">🥇 Emas</div>
                <div className="text-2xl font-black text-amber-300 font-mono">{leader.gold}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-xs">🥈 Perak</div>
                <div className="text-2xl font-bold text-slate-300 font-mono">{leader.silver}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-xs">🥉 Gangsa</div>
                <div className="text-2xl font-bold text-amber-600 font-mono">{leader.bronze}</div>
              </div>
              <div className="text-center border-l border-slate-800 pl-6">
                <div className="text-slate-400 text-xs">Jumlah Pingat</div>
                <div className="text-2xl font-black text-white font-mono">{leader.totalMedals}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Standings Cards for Houses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {standings.map((st, idx) => {
          const percentage = Math.round((st.totalMedals / maxMedals) * 100);
          const isFirst = idx === 0 && st.totalMedals > 0;
          return (
            <div
              key={st.house.id}
              className={`rounded-2xl bg-white border p-6 transition shadow-sm relative overflow-hidden ${
                isFirst
                  ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/5'
                  : 'border-slate-200'
              }`}
            >
              {isFirst && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Johan
                </div>
              )}

              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md"
                  style={{ backgroundColor: st.house.colorHex }}
                >
                  #{st.rank}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{st.house.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Rumah Sukan {st.house.colorName}
                  </p>
                </div>
              </div>

              {/* Progress Bar of Medals */}
              <div className="space-y-1.5 mb-5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Jumlah Pingat</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {st.totalMedals} Pingat
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(percentage, 5)}%`,
                      backgroundColor: st.house.colorHex,
                    }}
                  />
                </div>
              </div>

              {/* Medal Breakdown: Emas, Perak, Gangsa */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="bg-white rounded-lg py-2 border border-amber-200/50">
                  <span className="text-xs font-bold block text-amber-700">🥇 Emas</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {st.gold}
                  </span>
                </div>
                <div className="bg-white rounded-lg py-2 border border-slate-200/70">
                  <span className="text-xs font-bold block text-slate-600">🥈 Perak</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {st.silver}
                  </span>
                </div>
                <div className="bg-white rounded-lg py-2 border border-amber-300/40">
                  <span className="text-xs font-bold block text-amber-800">🥉 Gangsa</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {st.bronze}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Broken Records Showcase (Rekod Baharu Dipecahkan) */}
      {brokenRecords.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-300 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Rekod Kejohanan Baharu Dipecahkan!
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  {brokenRecords.length} Rekod
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                Pencapaian cemerlang atlit yang berjaya mengatasi rekod kejohanan terdahulu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brokenRecords.map((item, i) => {
              const h = houses.find((house) => house.id === item.winner.houseId);
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        {item.event.name}
                      </span>
                      {h && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${h.colorHex}18`,
                            color: h.colorHex,
                            border: `1px solid ${h.colorHex}40`,
                          }}
                        >
                          {h.shortName}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {item.winner.athleteName}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Rekod Lama</span>
                      <span className="text-slate-600 font-mono font-medium line-through">
                        {item.oldRecord || 'Tiada'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-600 font-bold text-[11px] block">
                        Catatan Baharu ✨
                      </span>
                      <span className="text-amber-600 font-mono font-black text-sm">
                        {item.winner.score}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comprehensive Medal Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Jadual Pungutan Pingat Keseluruhan
            </h3>
            <p className="text-xs text-slate-500">
              Kedudukan rasmi ditentukan mengikut bilangan pingat Emas, diikuti Perak dan Gangsa
            </p>
          </div>
          <div className="text-xs text-slate-600 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            Selesai: {results.length} daripada {events.length} Acara
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 w-16 text-center">Ked.</th>
                <th className="py-3.5 px-4">Rumah Sukan</th>
                <th className="py-3.5 px-4 text-center bg-amber-50/80 text-amber-900 font-black">
                  🥇 Emas
                </th>
                <th className="py-3.5 px-4 text-center bg-slate-100 text-slate-800 font-bold">
                  🥈 Perak
                </th>
                <th className="py-3.5 px-4 text-center bg-amber-50/50 text-amber-900 font-bold">
                  🥉 Gangsa
                </th>
                <th className="py-3.5 px-4 text-center font-black bg-slate-900 text-white">
                  Jumlah Pingat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.map((st, idx) => (
                <tr
                  key={st.house.id}
                  className={`hover:bg-slate-50 transition ${
                    idx === 0 && st.totalMedals > 0 ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-bold">
                    {idx === 0 && st.totalMedals > 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
                        1
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono font-bold text-xs">{st.rank}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                        style={{ backgroundColor: st.house.colorHex }}
                      />
                      <span className="font-bold text-slate-900">{st.house.name}</span>
                      {idx === 0 && st.totalMedals > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-extrabold border border-amber-300">
                          Johan Semasa
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-amber-950 font-mono text-base bg-amber-50/30">
                    {st.gold}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono text-base bg-slate-50/50">
                    {st.silver}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-900 font-mono text-base bg-amber-50/20">
                    {st.bronze}
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-slate-950 font-mono text-base bg-slate-100">
                    {st.totalMedals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Events & Results List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Keputusan Acara Yang Telah Direkodkan ({results.length})
            </h3>
            <p className="text-xs text-slate-500">
              Senarai pemenang pingat yang telah diimbas A.I. atau dimasukkan secara rasmi
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {results.length > 0 && onClearResults && (
              <button
                onClick={onClearResults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                title="Padam semua keputusan acara dan reset pungutan pingat ke 0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Semua Keputusan</span>
              </button>
            )}
            <button
              onClick={() => onOpenManualResult()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              Tambah Keputusan Acara
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/60">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Keputusan Acara</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Gunakan Pengimbas A.I. untuk memuat naik gambar borang catatan hakim padang/balapan
              atau tekan butang &ldquo;Catat Manual&rdquo;.
            </p>
            <button
              onClick={onOpenAiScanner}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Buka Pengimbas A.I.
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res) => {
              const ev = events.find((e) => e.id === res.eventId);
              // Only positions 1, 2, and 3
              const topWinners = res.winners
                .filter((w) => w.position <= 3)
                .sort((a, b) => a.position - b.position);

              return (
                <div
                  key={res.eventId}
                  className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition bg-slate-50/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {ev ? `${ev.session} &bull; Bil ${ev.bil}` : 'Acara'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {ev ? ev.name : res.eventId}
                        </span>
                        {ev && (
                          <span className="text-[11px] text-slate-500">
                            ({ev.categoryGender} - {ev.categoryAge})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenManualResult(res.eventId)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 cursor-pointer"
                      >
                        Kemaskini
                      </button>
                      <button
                        onClick={() => onDeleteResult(res.eventId)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 cursor-pointer"
                      >
                        Padam
                      </button>
                    </div>
                  </div>

                  {/* Winners Row (Emas, Perak, Gangsa Sahaja) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    {topWinners.map((w, wIdx) => {
                      const h = houses.find((house) => house.id === w.houseId);
                      const medal =
                        w.position === 1
                          ? '🥇 Emas'
                          : w.position === 2
                          ? '🥈 Perak'
                          : '🥉 Gangsa';

                      return (
                        <div
                          key={wIdx}
                          className="bg-white rounded-lg p-3 border border-slate-200 text-xs space-y-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{medal}</span>
                            {w.isNewRecord && (
                              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Rekod Baharu!
                              </span>
                            )}
                          </div>
                          <div className="font-extrabold text-slate-900 truncate">
                            {w.athleteName}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span
                              className="font-bold"
                              style={{ color: h?.colorHex || '#475569' }}
                            >
                              {h?.name || w.houseId}
                            </span>
                            <span className="font-mono font-semibold text-slate-800">
                              {w.score}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
