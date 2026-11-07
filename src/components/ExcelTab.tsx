import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Info,
  ArrowRight,
} from 'lucide-react';
import { AthleteRegistration, House, SportEvent, TournamentConfig } from '../types';
import { generateExcelWorkbook, parseUploadedExcel } from '../utils/rules';

interface ExcelTabProps {
  config: TournamentConfig;
  houses: House[];
  events: SportEvent[];
  registrations: AthleteRegistration[];
  onImportRegistrations: (
    newRegs: AthleteRegistration[],
    mode: 'append' | 'replace'
  ) => void;
}

export const ExcelTab: React.FC<ExcelTabProps> = ({
  config,
  houses,
  events,
  registrations,
  onImportRegistrations,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    registrations: AthleteRegistration[];
    validCount: number;
    skippedCount: number;
    warnings: string[];
    errors: string[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Download Blank/Current Excel Template
  const handleDownloadExcel = (includeCurrentData: boolean = true) => {
    try {
      setErrorMessage(null);
      const dataToExport = includeCurrentData ? registrations : [];
      const excelBytes = generateExcelWorkbook(config, houses, events, dataToExport);
      const blob = new Blob([excelBytes.buffer as ArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `Borang_Pendaftaran_${config.schoolName.replace(/\s+/g, '_')}_${config.year}.xlsx`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating Excel file:', err);
      setErrorMessage('Gagal menjana fail Excel: ' + (err as Error).message);
    }
  };

  // 2. Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setSuccessBanner(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseUploadedExcel(
        buffer,
        events,
        houses,
        importMode === 'append' ? registrations : []
      );
      setImportPreview(result);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setImportPreview({
        registrations: [],
        validCount: 0,
        skippedCount: 0,
        warnings: [],
        errors: ['Gagal membaca fail Excel: ' + (err as Error).message],
      });
    } finally {
      setIsProcessing(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Confirm & Commit Import into state
  const handleConfirmImport = () => {
    if (!importPreview || importPreview.registrations.length === 0) return;

    onImportRegistrations(importPreview.registrations, importMode);
    setSuccessBanner(
      `Berjaya memasukkan ${importPreview.validCount} pendaftaran atlit ke dalam sistem secara automatik!`
    );
    setImportPreview(null);
  };

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Integrasi Templat Excel Pintar
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Muat Turun & Muat Naik Templat Borang Acara Excel
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Muat turun borang berformat Excel standard dengan helaian khusus untuk{' '}
              <strong>Rumah Hijau, Rumah Merah, dan Rumah Biru</strong>. Selepas guru rumah sukan
              mengisi nama atlit, muat naik semula ke sini dan sistem akan mengisi setiap acara
              secara automatik sambil menguatkuasakan syarat{' '}
              <span className="font-bold text-slate-800">
                2 Acara Individu & 2 Acara Berpasukan
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleDownloadExcel(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Muat Turun Templat Excel (.xlsx)
            </button>
            <button
              onClick={() => handleDownloadExcel(false)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
              title="Templat Kosong tanpa nama atlit sedia ada"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Templat Kosong Sahaja
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Muat Turun Templat</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mengandungi kod acara dari gambar rasmi (1-13 Hari 1 & 1-12 Hari 2).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-sm">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Guru Rumah Sukan Isi</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Setiap ketua rumah sukan (Hijau, Merah, Biru) hanya perlu mengisi nama atlit.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-sm">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Muat Naik & Semak 2+2</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sistem membaca dan menolak secara automatik jika ada atlit yang melebihi kuota.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="flex-1">{successBanner}</span>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-medium flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-file-input"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Muat Naik Semula Borang Excel Yang Telah Diisi
          </h3>
          <p className="text-xs text-slate-500">
            Pilih fail borang Excel (.xlsx, .xls) dari peranti anda untuk memuatkan pendaftaran atlit
            ke setiap acara secara automatik.
          </p>

          {/* Mode Selector */}
          <div className="inline-flex items-center gap-4 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-700">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition select-none has-checked:bg-white has-checked:text-indigo-600 has-checked:shadow-xs font-semibold">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="hidden"
              />
              <span>Tambah ke Data Sedia Ada</span>
            </label>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition select-none has-checked:bg-white has-checked:text-rose-600 has-checked:shadow-xs font-semibold">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="hidden"
              />
              <span>Gantikan Semua Data</span>
            </label>
          </div>

          <div className="pt-2">
            <label
              htmlFor="excel-file-input"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Sedang Membaca...' : 'Pilih Fail Excel'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Upload Preview & Validation Results */}
      {importPreview && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                Hasil Imbasan Fail Excel
              </h3>
              <p className="text-xs text-slate-500">
                Sila semak maklumat sebelum menekan butang sahkan kemasukan data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setImportPreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importPreview.validCount === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <CheckCircle className="w-4 h-4" />
                Sahkan & Masukkan ({importPreview.validCount} Rekod)
              </button>
            </div>
          </div>

          {/* Statistics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <span className="text-emerald-700 text-xs block font-semibold">
                Pendaftaran Sah
              </span>
              <span className="text-xl font-extrabold text-emerald-950 font-mono">
                {importPreview.validCount}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-slate-500 text-xs block">Baris Kosong / Diabaikan</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {importPreview.skippedCount}
              </span>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <span className="text-amber-700 text-xs block font-semibold">Amaran Had Kuota</span>
              <span className="text-xl font-extrabold text-amber-950 font-mono">
                {importPreview.warnings.length}
              </span>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
              <span className="text-rose-700 text-xs block font-semibold">Ralat Format</span>
              <span className="text-xl font-extrabold text-rose-950 font-mono">
                {importPreview.errors.length}
              </span>
            </div>
          </div>

          {/* Warnings List */}
          {importPreview.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Peringatan Kuota Acara Atlit Dikesan ({importPreview.warnings.length}):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px] max-h-36 overflow-y-auto pl-1">
                {importPreview.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Errors List */}
          {importPreview.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Ralat Kritikal Ditemui:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-rose-800 text-[11px]">
                {importPreview.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {importPreview.registrations.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                <span>Pratonton Atlit Yang Akan Didaftarkan:</span>
                <span className="font-normal text-slate-500">
                  {importPreview.registrations.length} atlit
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Kod Acara</th>
                      <th className="py-2 px-3">Rumah Sukan</th>
                      <th className="py-2 px-3">Nama Atlit</th>
                      <th className="py-2 px-3">Bib</th>
                      <th className="py-2 px-3">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.registrations.map((r, i) => {
                      const ev = events.find((e) => e.id === r.eventId);
                      const h = houses.find((house) => house.id === r.houseId);
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-medium text-slate-700">
                            {ev?.name || r.eventId}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className="font-bold text-[11px]"
                              style={{ color: h?.colorHex || '#475569' }}
                            >
                              {h?.name || r.houseId}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">{r.athleteName}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {r.bibNumber || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{r.className || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
