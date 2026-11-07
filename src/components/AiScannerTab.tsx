import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  ArrowRight,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { House, SportEvent, TournamentConfig, EventResult, WinnerPlacement } from '../types';

interface AiScannerTabProps {
  config: TournamentConfig;
  houses: House[];
  events: SportEvent[];
  onApplyResult: (result: EventResult) => void;
  onNavigateToStandings: () => void;
}

export const AiScannerTab: React.FC<AiScannerTabProps> = ({
  config,
  houses,
  events,
  onApplyResult,
  onNavigateToStandings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Parsed AI result
  const [aiData, setAiData] = useState<{
    eventName: string;
    matchedEventId: string;
    eventCategory?: string;
    winners: WinnerPlacement[];
    summary: string;
    isRecordBroken?: boolean;
    recordBrokenDetails?: string;
  } | null>(null);

  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAiData(null);
      setScanError(null);
      setAppliedSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  // Preset demo score sheets (generated dynamically via HTML Canvas)
  const loadDemoScoreSheet = (type: '100m' | 'lompat_jauh') => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${config.schoolName} - ${config.title} ${config.edition}`,
      canvas.width / 2,
      60
    );

    if (type === '100m') {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('BORANG KEPUTUSAN RASMI HAKIM BALAPAN', canvas.width / 2, 90);

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ACARA: 100M TAHUN 3/4/5 (AKHIR) LELAKI', 50, 130);
      ctx.fillText('SESI: SABTU : 24 OKTOBER 2026 (08:30)', 50, 155);
      ctx.fillText('REKOD KEJOHANAN: 13.60s (Luqman Nurhaqim - Biru 2024)', 50, 180);

      // Table Header
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(50, 210, 800, 35);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('LORONG', 65, 233);
      ctx.fillText('NAMA ATLIT', 150, 233);
      ctx.fillText('RUMAH', 420, 233);
      ctx.fillText('MASA', 530, 233);
      ctx.fillText('KEDUDUKAN', 640, 233);
      ctx.fillText('CATATAN', 740, 233);

      // Rows
      const rows = [
        { lane: '4', name: 'MUHAMMAD DANISH BIN ROSLAN', house: 'MERAH', time: '13.35s', pos: '1 (EMAS)', note: 'REKOD BAHARU!' },
        { lane: '3', name: 'MUHAMMAD AMMAR BIN AZHAR', house: 'HIJAU', time: '13.72s', pos: '2 (PERAK)', note: 'LAYAK KE MSSD' },
        { lane: '5', name: 'SYAHMI IRFAN BIN KAMARUL', house: 'BIRU', time: '14.05s', pos: '3 (GANGSA)', note: '' },
      ];

      rows.forEach((r, idx) => {
        const y = 280 + idx * 45;
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(r.lane, 80, y);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(r.name, 150, y);
        ctx.font = '13px sans-serif';
        ctx.fillText(r.house, 420, y);
        ctx.font = 'bold 13px monospace';
        ctx.fillText(r.time, 530, y);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = idx === 0 ? '#b45309' : idx === 1 ? '#475569' : idx === 2 ? '#92400e' : '#64748b';
        ctx.fillText(r.pos, 640, y);
        ctx.fillStyle = '#dc2626';
        ctx.fillText(r.note, 740, y);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, y + 15);
        ctx.lineTo(850, y + 15);
        ctx.stroke();
      });

      // Signature
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic 13px sans-serif';
      ctx.fillText('Disahkan oleh: Ketua Hakim Balapan (Cikgu Khairul)', 50, 600);
      ctx.fillText('Tarikh: 24 Oktober 2026', 600, 600);
    } else {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('BORANG KEPUTUSAN RASMI HAKIM PADANG', canvas.width / 2, 90);

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ACARA: LOMPAT JAUH (AKHIR) PEREMPUAN', 50, 130);
      ctx.fillText('SESI: JUMAAT : 23 OKTOBER 2026 (08:00)', 50, 155);
      ctx.fillText('REKOD KEJOHANAN: 3.45m (Nur Aisyah - Hijau 2024)', 50, 180);

      // Table Header
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(50, 210, 800, 35);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('GIL.', 65, 233);
      ctx.fillText('NAMA PESERTA', 120, 233);
      ctx.fillText('RUMAH', 380, 233);
      ctx.fillText('P1', 470, 233);
      ctx.fillText('P2', 530, 233);
      ctx.fillText('P3', 590, 233);
      ctx.fillText('TERBAIK', 660, 233);
      ctx.fillText('KED.', 760, 233);

      const rows = [
        { turn: '1', name: 'NUR BALQIS BINTI ROZLAN', house: 'HIJAU', p1: '3.40m', p2: '3.48m', p3: '3.52m', best: '3.52m', pos: '1 (EMAS)' },
        { turn: '3', name: 'NURUL IMAN BINTI ANUAR', house: 'BIRU', p1: '3.20m', p2: '3.38m', p3: '3.35m', best: '3.38m', pos: '2 (PERAK)' },
        { turn: '2', name: 'AIN SYAFIQAH BINTI HASNOL', house: 'MERAH', p1: '3.10m', p2: '3.20m', p3: 'X', best: '3.20m', pos: '3 (GANGSA)' },
      ];

      rows.forEach((r, idx) => {
        const y = 280 + idx * 45;
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(r.turn, 75, y);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(r.name, 120, y);
        ctx.font = '13px sans-serif';
        ctx.fillText(r.house, 380, y);
        ctx.font = '13px monospace';
        ctx.fillText(r.p1, 470, y);
        ctx.fillText(r.p2, 530, y);
        ctx.fillText(r.p3, 590, y);
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(r.best, 660, y);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = idx === 0 ? '#b45309' : idx === 1 ? '#475569' : '#92400e';
        ctx.fillText(r.pos, 760, y);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, y + 15);
        ctx.lineTo(850, y + 15);
        ctx.stroke();
      });

      // Signature
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic 13px sans-serif';
      ctx.fillText('Disahkan oleh: Ketua Hakim Padang (Cikgu Rohani)', 50, 600);
      ctx.fillText('Tarikh: 23 Oktober 2026', 600, 600);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setSelectedImage(dataUrl);
    setMimeType('image/jpeg');
    setAiData(null);
    setScanError(null);
    setAppliedSuccess(false);
  };

  // Perform AI Scan
  const handleScanWithGemini = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanError(null);
    setAppliedSuccess(false);

    try {
      const response = await fetch('/api/ai/scan-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: mimeType,
          currentEvents: events,
        }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.error || 'Gagal membaca imej borang keputusan.');
      }

      const parsed = res.data;
      setAiData(parsed);

      if (parsed.isRecordBroken) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
        });
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanError((err as Error).message);
    } finally {
      setIsScanning(false);
    }
  };

  // Apply to official tournament results
  const handleApplyResults = () => {
    if (!aiData) return;

    // Resolve event id
    let targetEventId = aiData.matchedEventId;
    if (!targetEventId) {
      const matched = events.find((e) =>
        aiData.eventName.toLowerCase().includes(e.name.toLowerCase()) ||
        e.name.toLowerCase().includes(aiData.eventName.toLowerCase())
      );
      targetEventId = matched ? matched.id : events[0]?.id || 'h1-1';
    }

    const formattedWinners: WinnerPlacement[] = aiData.winners
      .filter((w) => w.position <= 3)
      .map((w) => ({
        position: w.position as 1 | 2 | 3,
        athleteName: w.athleteName,
        houseId: w.houseId.toLowerCase(),
        score: w.score,
        isNewRecord: w.isNewRecord,
        notes: w.notes,
      }));

    const resultRecord: EventResult = {
      eventId: targetEventId,
      completedAt: new Date().toISOString(),
      winners: formattedWinners,
      notes: aiData.summary,
    };

    onApplyResult(resultRecord);
    setAppliedSuccess(true);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-2xl border border-indigo-800 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Pengimbas A.I. Borang Keputusan Hakim
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Imbas Gambar Keputusan & Terjemah Secara Automatik
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Muat naik gambar borang catatan hakim padang atau balapan yang telah bertulis tangan /
            bercetak. Model A.I. Gemini akan membaca nama acara, pemenang tempat 1, 2, 3 (Emas,
            Perak, Gangsa), mengesan jika rekod kejohanan dipecahkan, dan terus mengemaskini mata
            dan carta Johan Keseluruhan secara langsung.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload / Camera / Demo sheets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              Pilih Gambar Borang Keputusan
            </h3>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drop / Select Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-slate-50"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                Ambil Gambar atau Muat Naik Foto
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Kamera telefon pintar atau fail imej JPEG/PNG
              </div>
            </div>

            {/* Quick Demo Pre-sets */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Atau Cuba Contoh Borang Siap Catat:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loadDemoScoreSheet('100m')}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 text-left text-xs font-medium text-slate-700 transition"
                >
                  <span className="font-bold text-indigo-700 block">Contoh Balapan</span>
                  <span className="text-[10px] text-slate-500">100M Akhir (Pecah Rekod)</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoScoreSheet('lompat_jauh')}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-left text-xs font-medium text-slate-700 transition"
                >
                  <span className="font-bold text-emerald-700 block">Contoh Padang</span>
                  <span className="text-[10px] text-slate-500">Lompat Jauh (Pecah Rekod)</span>
                </button>
              </div>
            </div>

            {/* Image Preview Box */}
            {selectedImage && (
              <div className="space-y-3 pt-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-300 max-h-64 bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Pratonton Borang Keputusan"
                    className="max-h-64 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    Imej Sedia
                  </div>
                </div>

                <button
                  onClick={handleScanWithGemini}
                  disabled={isScanning}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>A.I. Sedang Menganalisis Keputusan...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Imbas Keputusan Dengan A.I. Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Scan Output & Verification (7 cols) */}
        <div className="lg:col-span-7">
          {scanError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal mengimbas borang keputusan:</span>
                <span>{scanError}</span>
              </div>
            </div>
          )}

          {appliedSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-3 mb-6 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm">
                  Keputusan Acara Berjaya Dimasukkan ke Papan Kedudukan Rasmi!
                </span>
              </div>
              <p className="text-slate-600">
                Pungutan pingat emas, perak, gangsa dan mata kejohanan setiap rumah sukan telah
                dikemaskini secara automatik.
              </p>
              <button
                onClick={onNavigateToStandings}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                <span>Lihat Kedudukan & Johan Keseluruhan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {aiData ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in">
              {/* Event Match Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                    Acara Dikesan
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {aiData.eventName}
                  </h3>
                  {aiData.eventCategory && (
                    <span className="text-xs text-slate-500">{aiData.eventCategory}</span>
                  )}
                </div>

                {aiData.isRecordBroken && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold shadow-sm">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Rekod Baharu Dipecahkan!</span>
                  </div>
                )}
              </div>

              {/* Record Broken Banner if detected */}
              {aiData.isRecordBroken && aiData.recordBrokenDetails && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 text-amber-950 text-xs font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{aiData.recordBrokenDetails}</span>
                </div>
              )}

              {/* Winners Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Pungutan Pingat & Catatan Atlit Dikesan:</span>
                  <span className="font-normal text-slate-500">
                    {aiData.winners.length} Kedudukan
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-16 text-center">Ked.</th>
                        <th className="py-2.5 px-3">Nama Atlit / Pasukan</th>
                        <th className="py-2.5 px-3">Rumah Sukan</th>
                        <th className="py-2.5 px-3">Catatan Masa / Jarak</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiData.winners.map((w, idx) => {
                        const h = houses.find((house) => house.id === w.houseId.toLowerCase());
                        const medalLabel =
                          w.position === 1
                            ? '🥇 Emas'
                            : w.position === 2
                            ? '🥈 Perak'
                            : w.position === 3
                            ? '🥉 Gangsa'
                            : 'Ke-4';

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-3 text-center font-bold">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                                  w.position === 1
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : w.position === 2
                                    ? 'bg-slate-200 text-slate-800'
                                    : w.position === 3
                                    ? 'bg-orange-100 text-orange-900'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {medalLabel}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-extrabold text-slate-900">
                              {w.athleteName}
                            </td>
                            <td className="py-3 px-3">
                              {h ? (
                                <span
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold"
                                  style={{
                                    backgroundColor: `${h.colorHex}15`,
                                    color: h.colorHex,
                                    border: `1px solid ${h.colorHex}35`,
                                  }}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: h.colorHex }}
                                  />
                                  {h.name}
                                </span>
                              ) : (
                                <span className="font-bold text-slate-700">{w.houseId}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              {w.score}
                            </td>
                            <td className="py-3 px-3">
                              {w.isNewRecord ? (
                                <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Rekod Baharu ✨
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Summary note */}
              {aiData.summary && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Rumusan A.I:</span>
                  <span>{aiData.summary}</span>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAiData(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Imbas Semula
                </button>
                <button
                  type="button"
                  onClick={handleApplyResults}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Sahkan & Kemaskini Papan Kedudukan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Hasil Imbasan A.I. Akan Muncul Di Sini</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pilih atau ambil foto borang keputusan hakim di sebelah kiri, kemudian tekan &ldquo;Imbas
                Keputusan Dengan A.I.&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
