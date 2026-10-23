'use client';

import React from 'react';
import { 
  CalculationResult, 
  formatRupiah, 
  formatPercentage 
} from '../lib/jaspel';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

interface ExecutiveSummaryProps {
  calc: CalculationResult;
  periodLabel: string;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  calc,
  periodLabel,
  onNavigateTab,
}) => {
  const isBalanced = Math.abs(calc.remainingAmount) < 5;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome with Classic Elegance */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/80 border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-400 bg-amber-950/70 border border-amber-700/50 px-2.5 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rekapitulasi Proporsional Periode {periodLabel}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Dashboard Jasa Manajemen UPTD RSUD Siwa
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Sistem perhitungan otomatis alokasi jasa pelayanan manajemen UPTD Rumah Sakit Umum Daerah Siwa.
              Seluruh proporsi dihitung presisi hingga ke satuan rupiah tanpa selisih.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('calculator')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-950/30 transition flex items-center space-x-2"
            >
              <span>Ubah Nominal / Proporsi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('sheets')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Sinkron Google Sheets</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Nominal Input */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Jasa Manajemen
            </span>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight font-serif">
              {formatRupiah(calc.totalAmount)}
            </div>
            <div className="mt-1 flex items-center text-xs text-amber-400/90 font-medium">
              <span>Dasar Perhitungan Utama</span>
            </div>
          </div>
        </div>

        {/* Total Realisasi Alokasi */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Dialokasikan
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight font-serif">
              {formatRupiah(calc.totalAllocated)}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-400">
              <span>{formatPercentage(calc.totalPercentage)} dari total dana</span>
            </div>
          </div>
        </div>

        {/* Total Penerima & Pos */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Jumlah Penerima & Pos
            </span>
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight font-serif">
              {calc.totalPersonnel} Pegawai / Pos
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-400">
              <span>Terbagi dalam {calc.groups.length} kelompok penerima</span>
            </div>
          </div>
        </div>

        {/* Status Validasi Saldo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Status Keseimbangan
            </span>
            <div className={`p-2 rounded-lg border ${
              isBalanced 
                ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400' 
                : 'bg-rose-950/60 border-rose-800/40 text-rose-400'
            }`}>
              {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-bold tracking-tight font-serif ${isBalanced ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isBalanced ? '100% Tepat' : formatRupiah(calc.remainingAmount)}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-400">
              <span>{isBalanced ? 'Tidak ada selisih saldo tersisa' : 'Perlu penyesuaian proporsi'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Proportion Breakdown Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white font-serif flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Proporsi Distribusi Anggaran</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribusi persentase dari total pagu jasa manajemen
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40 w-fit">
            Total Proporsi: {formatPercentage(calc.totalPercentage)}
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="mt-6">
          <div className="h-6 w-full rounded-xl bg-slate-950 overflow-hidden flex shadow-inner border border-slate-800">
            {calc.groups.map((group) => {
              if (group.percentage <= 0) return null;
              // Distinct luxury corporate palette
              const colors: Record<string, string> = {
                'kabag_kabid': 'bg-amber-600',
                'kasubag_kasie': 'bg-sky-600',
                'bendahara_penerimaan': 'bg-emerald-600',
                'bendahara_pengeluaran': 'bg-teal-600',
                'akuntansi': 'bg-cyan-600',
                'staf_manajemen': 'bg-indigo-600',
                'aset': 'bg-violet-600',
                'surveilans': 'bg-purple-600',
                'suci': 'bg-pink-600',
                'icha': 'bg-rose-600',
                'tim_pendukung': 'bg-blue-600',
                'non_medik_loket': 'bg-orange-600',
                'biaya_umum': 'bg-amber-700',
                'halifah': 'bg-emerald-700',
                'pengelola': 'bg-stone-500',
              };
              const bgClass = colors[group.id] || 'bg-slate-600';
              return (
                <div
                  key={group.id}
                  style={{ width: `${group.percentage}%` }}
                  title={`${group.name}: ${formatPercentage(group.percentage)} (${formatRupiah(group.totalGroupAmount)})`}
                  className={`${bgClass} h-full hover:brightness-125 transition-all cursor-pointer relative group`}
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Categories Grid Table */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {calc.groups.map((group) => {
            return (
              <div
                key={group.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      {group.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {group.category} ({group.recipientCount} {group.recipientCount > 1 ? 'orang' : 'pos'})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded">
                    {formatPercentage(group.percentage)}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Alokasi:</span>
                  <span className="font-semibold text-white">
                    {formatRupiah(group.totalGroupAmount)}
                  </span>
                </div>

                {group.recipientCount > 1 && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Per Orang:</span>
                    <span className="font-medium text-emerald-400">
                      {formatRupiah(group.perPersonAmount)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
