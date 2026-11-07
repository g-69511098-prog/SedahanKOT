import React, { useState, useRef, useEffect } from 'react';
import { Trophy, Settings, Calendar, RefreshCw, Sparkles, Award, RotateCcw, ChevronDown } from 'lucide-react';
import { House, HouseStanding, TournamentConfig } from '../types';

interface HeaderProps {
  config: TournamentConfig;
  houses: House[];
  standings: HouseStanding[];
  onOpenSettings: () => void;
  onResetData: () => void;
  onClearResults?: () => void;
  onOpenAiScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  standings,
  onOpenSettings,
  onResetData,
  onClearResults,
  onOpenAiScanner,
}) => {
  const [isResetMenuOpen, setIsResetMenuOpen] = useState(false);
  const resetMenuRef = useRef<HTMLDivElement>(null);
  const currentLeader = standings[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resetMenuRef.current && !resetMenuRef.current.contains(event.target as Node)) {
        setIsResetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Tournament Branding */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-xl shrink-0">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {config.schoolName}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {config.year}
                </span>
                {currentLeader && currentLeader.totalMedals > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Award className="w-3 h-3 text-amber-400" />
                    Mendahului: {currentLeader.house.name} (🥇{currentLeader.gold} 🥈{currentLeader.silver} 🥉{currentLeader.bronze})
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-0.5">
                {config.title} {config.edition}
              </h1>
            </div>
          </div>

          {/* Quick House Medals Summary & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* House Tally Chips */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
              {standings.map((st) => (
                <div
                  key={st.house.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: `${st.house.colorHex}22`,
                    border: `1px solid ${st.house.colorHex}55`,
                    color: st.house.id === 'hijau' ? '#4ade80' : st.house.id === 'merah' ? '#f87171' : '#60a5fa',
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: st.house.colorHex }}
                  />
                  <span>{st.house.shortName}</span>
                  <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-[10px] text-amber-300 font-mono" title="Pingat Emas">
                    🥇{st.gold}
                  </span>
                  <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono" title="Pingat Perak">
                    🥈{st.silver}
                  </span>
                  <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-[10px] text-amber-600 font-mono" title="Pingat Gangsa">
                    🥉{st.bronze}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Scanner Quick Button */}
            <button
              onClick={onOpenAiScanner}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-sm transition"
              title="Imbas Borang Keputusan dengan A.I."
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Imbas A.I.</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Tetapan Kejohanan (Nama, Tarikh & Hari)"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tetapan</span>
            </button>

            {/* Reset Dropdown */}
            <div className="relative" ref={resetMenuRef}>
              <button
                onClick={() => setIsResetMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
                title="Pilihan Reset & Set Semula"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Set Semula</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isResetMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Pilihan Set Semula
                  </div>

                  {onClearResults && (
                    <button
                      onClick={() => {
                        setIsResetMenuOpen(false);
                        onClearResults();
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 flex items-start gap-2.5 transition text-rose-300 hover:text-rose-200"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Reset Semua Keputusan</div>
                        <div className="text-[11px] text-slate-400">
                          Padam semua keputusan acara (Pungutan pingat kembali ke 0)
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsResetMenuOpen(false);
                      onResetData();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 flex items-start gap-2.5 transition text-slate-200 hover:text-white border-t border-slate-800/80"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Muat Semula Data Contoh</div>
                      <div className="text-[11px] text-slate-400">
                        Kembalikan konfigurasi asal SK Mandahan 2026
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
