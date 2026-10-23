'use client';

import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Printer, 
  Calculator, 
  Users, 
  FileText, 
  History,
  CheckCircle2,
  Calendar,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  periodLabel: string;
  setPeriodLabel: (val: string) => void;
  onOpenHistory: () => void;
  onOpenSheets: () => void;
  isSheetsConnected: boolean;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  periodLabel,
  setPeriodLabel,
  onOpenHistory,
  onOpenSheets,
  isSheetsConnected,
  isCloudSynced = true,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Ringkasan Eksekutif', icon: Building2 },
    { id: 'calculator', label: 'Kalkulator & Proporsi', icon: Calculator },
    { id: 'recipients', label: 'Daftar Pegawai & Alokasi', icon: Users },
    { id: 'report', label: 'Laporan Bulanan Resmi', icon: FileText },
    { id: 'sheets', label: 'Integrasi Google Sheets', icon: FileSpreadsheet },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Crest */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-lg shadow-amber-950/40 flex items-center justify-center">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Building2 className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-md">
                  UPTD RSUD SIWA
                </span>
                <span className="inline-flex items-center text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Proporsional Akurat
                </span>
                <span className="hidden lg:inline-flex items-center text-[11px] text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                  <Cloud className="w-3 h-3 mr-1 text-cyan-400" /> Firebase Sync
                </span>
              </div>
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white font-serif">
                Sistem Jasa Manajemen - RSUD Siwa
              </h1>
            </div>
          </div>

          {/* Right controls: Period selector & quick actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Period selector */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
              <input
                type="text"
                aria-label="Periode Pembagian"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-100 focus:outline-none w-20 sm:w-32"
                placeholder="e.g. Oktober 2026"
              />
            </div>

            {/* Riwayat Arsip Button */}
            <button
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
              title="Arsip & Riwayat Bulanan"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Arsip Bulanan</span>
            </button>

            {/* Google Sheets Status / Action */}
            <button
              onClick={onOpenSheets}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition shadow-sm ${
                isSheetsConnected
                  ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSheetsConnected ? 'Sheets Terhubung' : 'Google Sheets'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 overflow-x-auto py-2 scrollbar-none" aria-label="Navigasi Utama">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
