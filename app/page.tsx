'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DEFAULT_TOTAL_AMOUNT, 
  INITIAL_GROUPS, 
  RuleGroup, 
  MonthlyRecord, 
  calculateDistribution 
} from '../lib/jaspel';
import { 
  getLocalRecords, 
  saveRecordToCloudAndLocal, 
  deleteRecordFromCloudAndLocal, 
  subscribeToMonthlyRecords 
} from '../lib/storage';
import { Navbar } from '../components/Navbar';
import { ExecutiveSummary } from '../components/ExecutiveSummary';
import { FeeCalculator } from '../components/FeeCalculator';
import { RecipientsTable } from '../components/RecipientsTable';
import { MonthlyReport } from '../components/MonthlyReport';
import { GoogleSheetsIntegration } from '../components/GoogleSheetsIntegration';
import { HistoryModal } from '../components/HistoryModal';
import { Cloud, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [totalAmount, setTotalAmount] = useState<number>(DEFAULT_TOTAL_AMOUNT);
  const [periodLabel, setPeriodLabel] = useState<string>('Oktober 2026');
  const [groups, setGroups] = useState<RuleGroup[]>(INITIAL_GROUPS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSheetsConnected, setIsSheetsConnected] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Subscribe to real-time records from Firebase Firestore with local fallback
  useEffect(() => {
    const unsubscribe = subscribeToMonthlyRecords((loadedRecords) => {
      setRecords(loadedRecords);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Compute distribution dynamically
  const calc = useMemo(() => {
    return calculateDistribution(totalAmount, groups);
  }, [totalAmount, groups]);

  const handleSaveCurrentArchive = async (notes?: string) => {
    const newRecord: MonthlyRecord = {
      id: `rec-${periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      period: periodLabel.toLowerCase().replace(/\s+/g, '-'),
      periodLabel: periodLabel,
      totalAmount: totalAmount,
      status: 'Disetujui',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      groups: JSON.parse(JSON.stringify(groups)),
      notes: notes || `Arsip pembagian jaspel periode ${periodLabel}`,
    };

    const updated = await saveRecordToCloudAndLocal(newRecord, (status) => {
      setSyncNotice(status.message);
      setTimeout(() => setSyncNotice(null), 4000);
    });
    setRecords(updated);
  };

  const handleSelectRecord = (record: MonthlyRecord) => {
    setTotalAmount(record.totalAmount);
    setPeriodLabel(record.periodLabel);
    setGroups(JSON.parse(JSON.stringify(record.groups)));
    setSyncNotice(`Memuat arsip periode ${record.periodLabel}`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleDeleteRecord = async (id: string) => {
    const updated = await deleteRecordFromCloudAndLocal(id);
    setRecords(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        periodLabel={periodLabel}
        setPeriodLabel={setPeriodLabel}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSheets={() => setActiveTab('sheets')}
        isSheetsConnected={isSheetsConnected}
        isCloudSynced={true}
      />

      {/* Cloud Sync Toast Notification */}
      {syncNotice && (
        <div className="no-print fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncNotice}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <ExecutiveSummary
            calc={calc}
            periodLabel={periodLabel}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'calculator' && (
          <FeeCalculator
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            groups={groups}
            setGroups={setGroups}
            calc={calc}
            onSaveArchive={() => handleSaveCurrentArchive()}
            onNavigateToRecipients={() => setActiveTab('recipients')}
          />
        )}

        {activeTab === 'recipients' && (
          <RecipientsTable
            groups={groups}
            setGroups={setGroups}
            calc={calc}
            periodLabel={periodLabel}
            totalAmount={totalAmount}
          />
        )}

        {activeTab === 'report' && (
          <MonthlyReport
            calc={calc}
            periodLabel={periodLabel}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsIntegration
            calc={calc}
            periodLabel={periodLabel}
            isSheetsConnected={isSheetsConnected}
            setIsSheetsConnected={setIsSheetsConnected}
          />
        )}
      </main>

      {/* History & Archive Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={records}
        currentPeriod={periodLabel}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={handleDeleteRecord}
        onSaveCurrentRecord={handleSaveCurrentArchive}
      />

      {/* Minimal Classic Footer (hidden on print) */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Sistem Pembagian Jasa Manajemen • Terintegrasi Google Sheets & Firebase Cloud</p>
          <div className="flex items-center space-x-1.5 text-[11px] text-cyan-400">
            <Cloud className="w-3.5 h-3.5" />
            <span>Database Cloud Firestore Aktif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
