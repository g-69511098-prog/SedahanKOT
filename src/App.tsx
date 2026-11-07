import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Users,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  AthleteRegistration,
  EventResult,
  House,
  SportEvent,
  TournamentConfig,
} from './types';
import {
  DEFAULT_CONFIG,
  DEFAULT_HOUSES,
  DEFAULT_EVENTS,
  SAMPLE_REGISTRATIONS,
  SAMPLE_RESULTS,
} from './data/initialData';
import { calculateHouseStandings, validateAthleteLimits } from './utils/rules';
import { Header } from './components/Header';
import { StandingsTab } from './components/StandingsTab';
import { RegistrationTab } from './components/RegistrationTab';
import { ExcelTab } from './components/ExcelTab';
import { JudgeSheetsTab } from './components/JudgeSheetsTab';
import { AiScannerTab } from './components/AiScannerTab';
import { EventsTab } from './components/EventsTab';
import { SettingsModal } from './components/SettingsModal';
import { ManualResultModal } from './components/ManualResultModal';
import { ConfirmModal } from './components/ConfirmModal';

type ActiveTab = 'standings' | 'registration' | 'excel' | 'judge_sheets' | 'ai_scanner' | 'events';

export default function App() {
  // Load state from localStorage or defaults
  const [config, setConfig] = useState<TournamentConfig>(() => {
    try {
      const saved = localStorage.getItem('sukan_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [houses, setHouses] = useState<House[]>(() => {
    try {
      const saved = localStorage.getItem('sukan_houses');
      return saved ? JSON.parse(saved) : DEFAULT_HOUSES;
    } catch {
      return DEFAULT_HOUSES;
    }
  });

  const [events, setEvents] = useState<SportEvent[]>(() => {
    try {
      const saved = localStorage.getItem('sukan_events');
      return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });

  const [registrations, setRegistrations] = useState<AthleteRegistration[]>(() => {
    try {
      const saved = localStorage.getItem('sukan_registrations');
      return saved ? JSON.parse(saved) : SAMPLE_REGISTRATIONS;
    } catch {
      return SAMPLE_REGISTRATIONS;
    }
  });

  const [results, setResults] = useState<EventResult[]>(() => {
    try {
      const saved = localStorage.getItem('sukan_results');
      return saved ? JSON.parse(saved) : SAMPLE_RESULTS;
    } catch {
      return SAMPLE_RESULTS;
    }
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('standings');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isManualResultOpen, setIsManualResultOpen] = useState<boolean>(false);
  const [selectedResultEventId, setSelectedResultEventId] = useState<string | undefined>(undefined);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('sukan_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('sukan_houses', JSON.stringify(houses));
  }, [houses]);

  useEffect(() => {
    localStorage.setItem('sukan_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('sukan_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('sukan_results', JSON.stringify(results));
  }, [results]);

  // Calculate live standings
  const standings = useMemo(() => {
    return calculateHouseStandings(houses, results, config);
  }, [houses, results, config]);

  // Handler: Add athlete registration with strict 2+2 rule check
  const handleAddRegistration = (
    newReg: Omit<AthleteRegistration, 'id'>
  ): { success: boolean; message?: string } => {
    const targetEvent = events.find((e) => e.id === newReg.eventId);
    if (!targetEvent) {
      return { success: false, message: 'Acara tidak dijumpai.' };
    }

    const check = validateAthleteLimits(
      registrations,
      events,
      newReg.athleteName,
      targetEvent.type
    );

    if (!check.valid) {
      return { success: false, message: check.message };
    }

    const id = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setRegistrations((prev) => [...prev, { ...newReg, id }]);
    return { success: true };
  };

  // Handler: Update registration
  const handleUpdateRegistration = (
    id: string,
    updated: Partial<AthleteRegistration>
  ): { success: boolean; message?: string } => {
    const existing = registrations.find((r) => r.id === id);
    if (!existing) return { success: false, message: 'Pendaftaran tidak ditemui.' };

    const targetEventId = updated.eventId || existing.eventId;
    const targetEvent = events.find((e) => e.id === targetEventId);
    const athleteName = updated.athleteName || existing.athleteName;

    if (targetEvent) {
      const check = validateAthleteLimits(
        registrations,
        events,
        athleteName,
        targetEvent.type,
        id
      );
      if (!check.valid) {
        return { success: false, message: check.message };
      }
    }

    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
    return { success: true };
  };

  // Handler: Delete registration
  const handleDeleteRegistration = (id: string) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
  };

  // Handler: Clear all registrations
  const handleClearRegistrations = () => {
    setRegistrations([]);
  };

  // Handler: Import registrations from Excel
  const handleImportRegistrations = (
    newRegs: AthleteRegistration[],
    mode: 'append' | 'replace'
  ) => {
    if (mode === 'replace') {
      setRegistrations(newRegs);
    } else {
      setRegistrations((prev) => [...prev, ...newRegs]);
    }
  };

  // Handler: Apply results (from AI scanner or manual modal)
  const handleApplyResult = (res: EventResult) => {
    setResults((prev) => {
      const filtered = prev.filter((r) => r.eventId !== res.eventId);
      return [...filtered, res];
    });
  };

  // Handler: Delete an event result
  const handleDeleteResult = (eventId: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const eventName = targetEvent ? targetEvent.name : eventId;
    setConfirmModal({
      isOpen: true,
      title: 'Padam Keputusan Acara',
      message: `Adakah anda pasti mahu memadam keputusan bagi acara "${eventName}"?\n\nPungutan pingat dan mata bagi rumah sukan terlibat akan dikemas kini semula secara automatik.`,
      confirmText: 'Ya, Padam Keputusan',
      variant: 'danger',
      onConfirm: () => {
        setResults((prev) => prev.filter((r) => r.eventId !== eventId));
      },
    });
  };

  // Handler: Clear all results (Reset scores to 0-0-0 for clean start)
  const handleClearResults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Semua Keputusan Acara',
      message:
        'Adakah anda pasti mahu mengosongkan SEMUA keputusan acara?\n\n• Semua pungutan pingat (Emas, Perak, Gangsa) dan mata rumah sukan akan kembali ke 0.\n• Senarai pendaftaran atlit dan jadual acara TIDAK akan terjejas.',
      confirmText: 'Ya, Kosongkan Semua Keputusan',
      variant: 'danger',
      onConfirm: () => {
        setResults([]);
      },
    });
  };

  // Handler: Reset to factory defaults (sample data)
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Set Semula Kepada Data Contoh Asal',
      message:
        'Adakah anda ingin menetapkan semula semua data kepada nilai awal contoh (SK Mandahan 2026)?\n\nSebarang pendaftaran atlit atau perubahan acara yang telah dibuat akan digantikan dengan data contoh asal.',
      confirmText: 'Ya, Set Semula',
      variant: 'warning',
      onConfirm: () => {
        setConfig(DEFAULT_CONFIG);
        setHouses(DEFAULT_HOUSES);
        setEvents(DEFAULT_EVENTS);
        setRegistrations(SAMPLE_REGISTRATIONS);
        setResults(SAMPLE_RESULTS);
        localStorage.clear();
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        config={config}
        houses={houses}
        standings={standings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
        onClearResults={handleClearResults}
        onOpenAiScanner={() => setActiveTab('ai_scanner')}
      />

      {/* Main Tab Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5">
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'standings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Kedudukan & Johan</span>
              {results.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                  {results.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('registration')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'registration'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Pendaftaran Atlit (2+2)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-mono">
                {registrations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Templat Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('judge_sheets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'judge_sheets'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Cetak Borang Hakim</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_scanner')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'ai_scanner'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Pengimbas A.I. Keputusan</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Jadual Acara ({events.length})</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'standings' && (
          <StandingsTab
            config={config}
            houses={houses}
            standings={standings}
            events={events}
            results={results}
            onOpenAiScanner={() => setActiveTab('ai_scanner')}
            onOpenManualResult={(eventId) => {
              setSelectedResultEventId(eventId);
              setIsManualResultOpen(true);
            }}
            onDeleteResult={handleDeleteResult}
            onClearResults={handleClearResults}
          />
        )}

        {activeTab === 'registration' && (
          <RegistrationTab
            houses={houses}
            events={events}
            registrations={registrations}
            onAddRegistration={handleAddRegistration}
            onUpdateRegistration={handleUpdateRegistration}
            onDeleteRegistration={handleDeleteRegistration}
            onClearRegistrations={handleClearRegistrations}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelTab
            config={config}
            houses={houses}
            events={events}
            registrations={registrations}
            onImportRegistrations={handleImportRegistrations}
          />
        )}

        {activeTab === 'judge_sheets' && (
          <JudgeSheetsTab
            config={config}
            houses={houses}
            events={events}
            registrations={registrations}
          />
        )}

        {activeTab === 'ai_scanner' && (
          <AiScannerTab
            config={config}
            houses={houses}
            events={events}
            onApplyResult={handleApplyResult}
            onNavigateToStandings={() => setActiveTab('standings')}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            config={config}
            events={events}
            onUpdateEvent={(id, updated) => {
              setEvents((prev) =>
                prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
              );
            }}
            onAddEvent={(newEvent) => {
              const id = `ev-${Date.now()}`;
              setEvents((prev) => [...prev, { ...newEvent, id }]);
            }}
            onDeleteEvent={(id) => {
              setEvents((prev) => prev.filter((e) => e.id !== id));
            }}
          />
        )}
      </main>

      {/* Footer (hidden when printing) */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            {config.schoolName} &bull; {config.title} {config.edition} ({config.year})
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Sistem Pendaftaran Atlit, Borang Hakim & Pengimbas Keputusan Berkuasa A.I. Gemini
          </p>
        </div>
      </footer>

      {/* Tournament Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        houses={houses}
        onSaveConfig={(newConfig, newHouses) => {
          setConfig(newConfig);
          setHouses(newHouses);
        }}
      />

      {/* Manual Result Input Modal */}
      <ManualResultModal
        isOpen={isManualResultOpen}
        onClose={() => {
          setIsManualResultOpen(false);
          setSelectedResultEventId(undefined);
        }}
        events={events}
        houses={houses}
        results={results}
        preselectedEventId={selectedResultEventId}
        onSaveResult={handleApplyResult}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
