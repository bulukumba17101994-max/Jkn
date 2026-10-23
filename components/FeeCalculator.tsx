'use client';

import React, { useState } from 'react';
import { 
  RuleGroup, 
  DEFAULT_TOTAL_AMOUNT, 
  INITIAL_GROUPS, 
  formatRupiah, 
  formatPercentage,
  CalculationResult 
} from '../lib/jaspel';
import { 
  Calculator, 
  RotateCcw, 
  Percent, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface FeeCalculatorProps {
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  groups: RuleGroup[];
  setGroups: React.Dispatch<React.SetStateAction<RuleGroup[]>>;
  calc: CalculationResult;
  onSaveArchive: () => void;
  onNavigateToRecipients?: () => void;
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({
  totalAmount,
  setTotalAmount,
  groups,
  setGroups,
  calc,
  onSaveArchive,
  onNavigateToRecipients,
}) => {
  const [inputVal, setInputVal] = useState<string>(totalAmount.toString());
  const [showProportionEditor, setShowProportionEditor] = useState<boolean>(true);

  // Quick Presets
  const presets = [
    { label: 'Data Referensi (Rp 59,49 jt)', value: DEFAULT_TOTAL_AMOUNT },
    { label: 'Rp 45.000.000', value: 45000000 },
    { label: 'Rp 65.000.000', value: 65000000 },
    { label: 'Rp 80.000.000', value: 80000000 },
    { label: 'Rp 100.000.000', value: 100000000 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numbers
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    setInputVal(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= 0) {
      setTotalAmount(num);
    } else if (cleaned === '') {
      setTotalAmount(0);
    }
  };

  const handlePercentageChange = (groupId: string, newPercentage: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, percentage: newPercentage } : g))
    );
  };

  const handleResetToDefault = () => {
    setTotalAmount(DEFAULT_TOTAL_AMOUNT);
    setInputVal(DEFAULT_TOTAL_AMOUNT.toString());
    setGroups(JSON.parse(JSON.stringify(INITIAL_GROUPS)));
  };

  const isExact100 = Math.abs(calc.totalPercentage - 100) < 0.05;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Input Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-amber-400" />
              <span>Input Pagu Jasa Manajemen</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Masukkan total rupiah jasa pelayanan manajemen yang akan dibagikan untuk periode berjalan.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetToDefault}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Kembalikan ke proporsi data awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar</span>
            </button>
            <button
              onClick={onSaveArchive}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-950/30 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan ke Arsip</span>
            </button>
          </div>
        </div>

        {/* Big Input Area */}
        <div className="mt-6 max-w-2xl">
          <label htmlFor="jasa-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Nominal Total Jasa Manajemen (Rp)
          </label>
          <div className="relative rounded-xl shadow-inner">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-amber-400 font-serif font-bold text-xl sm:text-2xl">
              Rp
            </div>
            <input
              id="jasa-input"
              type="text"
              value={inputVal ? parseInt(inputVal, 10).toLocaleString('id-ID') : ''}
              onChange={handleInputChange}
              placeholder="0"
              className="block w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-14 sm:pl-16 pr-4 py-3.5 sm:py-4 text-xl sm:text-3xl font-bold text-white tracking-wide font-serif focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-inner"
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Terbilang: <span className="text-amber-300 font-medium">{formatRupiah(totalAmount)}</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" /> Preset Cepat:
            </span>
            {presets.map((preset) => {
              const isSelected = totalAmount === preset.value;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    setTotalAmount(preset.value);
                    setInputVal(preset.value.toString());
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Proportion Settings Accordion / Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Pengaturan Proporsi Persentase Kelompok</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur persentase bagian masing-masing jabatan dan kelompok. Total seluruh proporsi wajib berjumlah 100%.
            </p>
          </div>

          {/* Total Validation Badge */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${
                isExact100
                  ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-600/60 text-amber-300'
              }`}
            >
              {isExact100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span>Total: {formatPercentage(calc.totalPercentage)}</span>
            </div>
            <button
              onClick={() => setShowProportionEditor(!showProportionEditor)}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              {showProportionEditor ? 'Sembunyikan' : 'Buka Pengaturan'}
            </button>
          </div>
        </div>

        {showProportionEditor && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => {
              const calcGroup = calc.groups.find((g) => g.id === group.id);
              return (
                <div
                  key={group.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {group.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {group.category} • {group.recipients.length} orang/pos
                      </span>
                    </div>

                    {/* Percentage input */}
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        aria-label={`Persentase ${group.name}`}
                        value={Number(group.percentage.toFixed(3))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            handlePercentageChange(group.id, val);
                          }
                        }}
                        className="w-20 px-2 py-1 text-right text-sm font-mono font-bold bg-slate-900 border border-slate-700 rounded-md text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Calculated nominal preview */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Hasil Alokasi:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {calcGroup ? formatRupiah(calcGroup.totalGroupAmount) : 'Rp 0'}
                    </span>
                  </div>

                  {group.recipients.length > 1 && calcGroup && (
                    <div className="mt-1 pt-1 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Bagian Per Orang:</span>
                      <span className="text-emerald-300 font-mono font-semibold">
                        {formatRupiah(calcGroup.perPersonAmount)}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Otomatis hitung ulang saat ± pegawai</span>
                    {onNavigateToRecipients && (
                      <button
                        onClick={onNavigateToRecipients}
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Kelola Pegawai
                      </button>
                    )}
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
