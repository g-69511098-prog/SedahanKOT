import React, { useState } from 'react';
import { Settings, Save, X, RotateCcw } from 'lucide-react';
import { TournamentConfig, House } from '../types';
import { DEFAULT_CONFIG } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TournamentConfig;
  houses: House[];
  onSaveConfig: (newConfig: TournamentConfig, newHouses: House[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  houses,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<TournamentConfig>({ ...config });
  const [housesData, setHousesData] = useState<House[]>([...houses]);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData, housesData);
    onClose();
  };

  const handleResetDefaults = () => {
    setIsConfirmResetOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Tetapan Maklumat Kejohanan Tahunan
              </h3>
              <p className="text-xs text-slate-500">
                Ubah nama kejohanan, sekolah, tarikh dan hari untuk kegunaan tahun-tahun berikutnya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Main Tournament Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Maklumat Asas Kejohanan & Sekolah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kejohanan
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Cth: KEJOHANAN PADANG & BALAPAN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edisi / Siri
                </label>
                <input
                  type="text"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="Cth: KALI KE-14 atau KALI KE-15"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Cth: SK MANDAHAN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="Cth: 2026 atau 2027"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates & Schedule Days */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Tarikh & Hari Kejohanan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tajuk Sesi 1 (Hari 1)
                </label>
                <input
                  type="text"
                  value={formData.day1Title}
                  onChange={(e) => setFormData({ ...formData, day1Title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tarikh Hari 1
                </label>
                <input
                  type="text"
                  value={formData.day1Date}
                  onChange={(e) => setFormData({ ...formData, day1Date: e.target.value })}
                  placeholder="Cth: 23 Oktober 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tajuk Sesi 2 (Hari 2)
                </label>
                <input
                  type="text"
                  value={formData.day2Title}
                  onChange={(e) => setFormData({ ...formData, day2Title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tarikh Hari 2
                </label>
                <input
                  type="text"
                  value={formData.day2Date}
                  onChange={(e) => setFormData({ ...formData, day2Date: e.target.value })}
                  placeholder="Cth: 24 Oktober 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sports Houses Customization */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Nama Rumah Sukan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {housesData.map((h, i) => (
                <div key={h.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: h.colorHex }}
                    />
                    <span className="text-xs font-bold text-slate-800">{h.shortName}</span>
                  </div>
                  <input
                    type="text"
                    value={h.name}
                    onChange={(e) => {
                      const updated = [...housesData];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setHousesData(updated);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Set Semula Nilai Asal
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <Save className="w-4 h-4" />
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmResetOpen}
        title="Set Semula Konfigurasi Kejohanan"
        message="Adakah anda pasti mahu menetapkan semula maklumat konfigurasi kepada nilai asal SK Mandahan 2026?"
        confirmText="Ya, Set Semula"
        variant="warning"
        onConfirm={() => {
          setFormData({ ...DEFAULT_CONFIG });
          setIsConfirmResetOpen(false);
        }}
        onClose={() => setIsConfirmResetOpen(false)}
      />
    </div>
  );
};
