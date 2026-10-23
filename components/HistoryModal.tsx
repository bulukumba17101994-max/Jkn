'use client';

import React, { useState } from 'react';
import { MonthlyRecord, formatRupiah } from '../lib/jaspel';
import { 
  History, 
  X, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  FolderOpen, 
  Plus, 
  FileCheck 
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MonthlyRecord[];
  currentPeriod: string;
  onSelectRecord: (rec: MonthlyRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSaveCurrentRecord: (notes?: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  currentPeriod,
  onSelectRecord,
  onDeleteRecord,
  onSaveCurrentRecord,
}) => {
  const [saveNotes, setSaveNotes] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white font-serif">
              Arsip & Riwayat Pembagian Bulanan
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Action */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              Arsipkan Periode Aktif: <span className="text-amber-400">{currentPeriod}</span>
            </h4>
            <p className="text-xs text-slate-400">
              Simpan konfigurasi pagu, persentase, dan rincian pegawai saat ini ke database arsip.
            </p>
          </div>
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 flex items-center space-x-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan Baru</span>
          </button>
        </div>

        {showSaveForm && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase">
              Catatan Periode / Dasar SK (Opsional)
            </label>
            <input
              type="text"
              placeholder="e.g. Pembagian jaspel reguler sesuai SK Direktur No. 12"
              value={saveNotes}
              onChange={(e) => setSaveNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onSaveCurrentRecord(saveNotes);
                  setShowSaveForm(false);
                  setSaveNotes('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300"
              >
                Konfirmasi Simpan
              </button>
            </div>
          </div>
        )}

        {/* List of Archived Records */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {records.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">
              Belum ada riwayat pembagian yang tersimpan.
            </p>
          ) : (
            records.map((rec) => {
              const isSelected = rec.periodLabel === currentPeriod;
              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/80 border-amber-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-base text-white">
                        {rec.periodLabel}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          rec.status === 'Dicairkan'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : 'bg-blue-950 text-blue-300 border border-blue-800/40'
                        }`}
                      >
                        {rec.status}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-950 text-amber-300 border border-amber-800/40">
                          Aktif Saat Ini
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      Pagu:{' '}
                      <span className="font-mono font-semibold text-emerald-400">
                        {formatRupiah(rec.totalAmount)}
                      </span>{' '}
                      • {rec.groups.length} Kelompok
                    </div>
                    {rec.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        &quot;{rec.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onSelectRecord(rec);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center space-x-1"
                      title="Buka data bulan ini"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buka</span>
                    </button>
                    {records.length > 1 && (
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Hapus Arsip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
