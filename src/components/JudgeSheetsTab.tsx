import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import { AthleteRegistration, House, SportEvent, TournamentConfig } from '../types';

interface JudgeSheetsTabProps {
  config: TournamentConfig;
  houses: House[];
  events: SportEvent[];
  registrations: AthleteRegistration[];
}

export const JudgeSheetsTab: React.FC<JudgeSheetsTabProps> = ({
  config,
  houses,
  events,
  registrations,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<'all' | 'Hari 1' | 'Hari 2'>('all');
  const [filterKind, setFilterKind] = useState<'all' | 'Balapan' | 'Padang'>('all');

  const filteredEvents = events.filter((ev) => {
    if (selectedEventId !== 'all' && ev.id !== selectedEventId) return false;
    if (filterSession !== 'all' && ev.session !== filterSession) return false;
    if (filterKind !== 'all' && ev.kind !== filterKind) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden during print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Printer className="w-4 h-4 text-indigo-600" />
              Borang Rasmi Hakim Padang & Hakim Balapan
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Cetak Borang Acara Untuk Hakim Pertandingan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Borang piawai kejohanan sekolah sedia cetak dengan maklumat atlit, susunan lorong
              balapan (Lorong 1-8) dan ruang catatan percubaan padang (Percubaan 1, 2, 3) beserta
              ruang tandatangan rasmi ketua hakim.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Borang Sekarang
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Pilih Acara:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none max-w-xs"
            >
              <option value="all">Semua Acara (Cetak Sekaligus - {events.length})</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  [{ev.session} Bil {ev.bil}] {ev.name} ({ev.categoryGender})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sesi:</span>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value as 'all' | 'Hari 1' | 'Hari 2')}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Hari</option>
              <option value="Hari 1">{config.day1Title}</option>
              <option value="Hari 2">{config.day2Title}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Kategori:</span>
            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as 'all' | 'Balapan' | 'Padang')}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua (Padang & Balapan)</option>
              <option value="Balapan">Acara Balapan Sahaja</option>
              <option value="Padang">Acara Padang Sahaja</option>
            </select>
          </div>

          <span className="text-slate-400 ml-auto font-mono text-[11px]">
            {filteredEvents.length} helaian borang sedia dicetak
          </span>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="space-y-12">
        {filteredEvents.map((ev, evIndex) => {
          const eventRegs = registrations.filter((r) => r.eventId === ev.id);
          const isTrack = ev.kind === 'Balapan';
          const isHighJump = ev.name.toUpperCase().includes('TINGGI');

          // Sort by lane or turn
          eventRegs.sort((a, b) => (a.laneOrTurn || 99) - (b.laneOrTurn || 99));

          return (
            <div
              key={ev.id}
              className={`bg-white rounded-2xl border border-slate-300 p-8 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 ${
                evIndex > 0 ? 'page-break' : ''
              }`}
            >
              {/* Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  {config.schoolName}
                </div>
                <h1 className="text-xl font-black uppercase text-slate-950 mt-0.5">
                  {config.title} {config.edition} {config.year}
                </h1>
                <div className="inline-block mt-2 px-4 py-1 rounded bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                  BORANG HAKIM {ev.kind.toUpperCase()}
                </div>
              </div>

              {/* Event Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 bg-slate-50 p-3 mb-4 rounded-lg">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Sesi & Tarikh
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {ev.session === 'Hari 1' ? config.day1Date : config.day2Date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    No. Acara & Masa
                  </span>
                  <span className="font-extrabold text-slate-900">
                    Bil {ev.bil} &bull; {ev.time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Kategori & Jantina
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {ev.categoryGender} ({ev.categoryAge})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Rekod Kejohanan
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {ev.currentRecord ? `${ev.currentRecord} ${ev.unit}` : 'Tiada'}
                    {ev.recordHolder ? ` (${ev.recordHolder})` : ''}
                  </span>
                </div>
              </div>

              {/* Event Title Banner */}
              <div className="bg-slate-200/80 px-4 py-2 rounded font-extrabold text-slate-900 text-sm mb-4 flex items-center justify-between">
                <span>ACARA: {ev.name}</span>
                <span className="text-xs uppercase font-mono">
                  {ev.type} &bull; {ev.kind}
                </span>
              </div>

              {/* Table For Track Events (Borang Balapan) */}
              {isTrack && (
                <div className="border border-slate-900 mb-6 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-extrabold text-center">
                        <th className="py-2.5 px-2 border-r border-slate-900 w-14">Lorong</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-20">No. Bib</th>
                        <th className="py-2.5 px-3 border-r border-slate-900 text-left">
                          Nama Atlit / Pasukan
                        </th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-28">Rumah</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-28">Catatan Masa</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-20">Kedudukan</th>
                        <th className="py-2.5 px-2 w-32">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Lanes 1 through 8 */}
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((laneNum) => {
                        const reg = eventRegs.find((r) => r.laneOrTurn === laneNum);
                        const h = reg ? houses.find((house) => house.id === reg.houseId) : null;

                        return (
                          <tr
                            key={laneNum}
                            className="border-b border-slate-400 h-10 text-slate-900"
                          >
                            <td className="py-2 px-2 text-center font-bold font-mono border-r border-slate-900 bg-slate-50">
                              {laneNum}
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-900">
                              {reg?.bibNumber || ''}
                            </td>
                            <td className="py-2 px-3 font-bold border-r border-slate-900 truncate">
                              {reg?.athleteName || ''}
                              {reg?.className && (
                                <span className="font-normal text-[10px] text-slate-500 ml-2">
                                  ({reg.className})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-900 text-center font-bold">
                              {h?.name || ''}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-900"></td>
                            <td className="py-2 px-2 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table For Field Events (Borang Padang - Lompat Jauh, Lontar Peluru, Lompat Tinggi) */}
              {!isTrack && !isHighJump && (
                <div className="border border-slate-900 mb-6 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-extrabold text-center">
                        <th className="py-2.5 px-2 border-r border-slate-900 w-12">Giliran</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-16">No. Bib</th>
                        <th className="py-2.5 px-3 border-r border-slate-900 text-left">
                          Nama Peserta
                        </th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-24">Rumah</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-16">P1 (m)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-16">P2 (m)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-16">P3 (m)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-20">Terbaik (m)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-16">Kedudukan</th>
                        <th className="py-2.5 px-2 w-24">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Rows for athletes or 10 blank slots */}
                      {Array.from({ length: Math.max(eventRegs.length, 8) }).map((_, idx) => {
                        const reg = eventRegs[idx];
                        const h = reg ? houses.find((house) => house.id === reg.houseId) : null;

                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-400 h-10 text-slate-900"
                          >
                            <td className="py-2 px-2 text-center font-bold font-mono border-r border-slate-900 bg-slate-50">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-900">
                              {reg?.bibNumber || ''}
                            </td>
                            <td className="py-2 px-3 font-bold border-r border-slate-900">
                              {reg?.athleteName || ''}
                              {reg?.className && (
                                <span className="font-normal text-[10px] text-slate-500 ml-2">
                                  ({reg.className})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-900 text-center font-bold">
                              {h?.name || ''}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-900"></td>
                            <td className="py-2 px-2 border-r border-slate-900"></td>
                            <td className="py-2 px-2 border-r border-slate-900"></td>
                            <td className="py-2 px-2 border-r border-slate-900 font-bold font-mono text-center"></td>
                            <td className="py-2 px-2 border-r border-slate-900 text-center font-bold"></td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table For High Jump (Lompat Tinggi) */}
              {!isTrack && isHighJump && (
                <div className="border border-slate-900 mb-6 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-extrabold text-center">
                        <th className="py-2.5 px-2 border-r border-slate-900 w-12">Gil.</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-16">Bib</th>
                        <th className="py-2.5 px-3 border-r border-slate-900 text-left">
                          Nama Peserta
                        </th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-24">Rumah</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.00m</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.05m</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.10m</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.15m</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.20m</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.25m</th>
                        <th className="py-2.5 px-1 border-r border-slate-900 w-12">1.30m</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 w-20">Terbaik</th>
                        <th className="py-2.5 px-2 w-16">Ked.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: Math.max(eventRegs.length, 8) }).map((_, idx) => {
                        const reg = eventRegs[idx];
                        const h = reg ? houses.find((house) => house.id === reg.houseId) : null;

                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-400 h-10 text-slate-900"
                          >
                            <td className="py-2 px-2 text-center font-bold font-mono border-r border-slate-900 bg-slate-50">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-900">
                              {reg?.bibNumber || ''}
                            </td>
                            <td className="py-2 px-3 font-bold border-r border-slate-900 truncate">
                              {reg?.athleteName || ''}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-900 text-center font-bold">
                              {h?.name || ''}
                            </td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-1 border-r border-slate-900 text-center"></td>
                            <td className="py-2 px-2 border-r border-slate-900 text-center font-bold font-mono"></td>
                            <td className="py-2 px-2 text-center font-bold"></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Official Signatures Footer */}
              <div className="pt-6 grid grid-cols-3 gap-6 text-xs text-center border-t border-slate-300">
                <div>
                  <div className="h-12 border-b border-dashed border-slate-400"></div>
                  <span className="font-bold text-slate-800 block mt-1">
                    Tandatangan Hakim 1 / Pencatat
                  </span>
                  <span className="text-[10px] text-slate-500">Nama: ........................................</span>
                </div>
                <div>
                  <div className="h-12 border-b border-dashed border-slate-400"></div>
                  <span className="font-bold text-slate-800 block mt-1">
                    Tandatangan Hakim 2
                  </span>
                  <span className="text-[10px] text-slate-500">Nama: ........................................</span>
                </div>
                <div>
                  <div className="h-12 border-b border-dashed border-slate-400"></div>
                  <span className="font-bold text-slate-800 block mt-1">
                    Ketua Hakim {ev.kind} / Pengesahan
                  </span>
                  <span className="text-[10px] text-slate-500">Tarikh: {new Date().toLocaleDateString('ms-MY')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
